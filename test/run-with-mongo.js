#!/usr/bin/env node
'use strict';

/*
 * Reproducible single-command test runner.
 *
 * routes/wines.js hardcodes its Mongo connection to localhost:27017 /
 * 'winedb' with no environment-variable or config hook of any kind, so
 * there's no additive way to point the app at an isolated test
 * database. Instead, this script owns a throwaway mongod bound to
 * that exact host/port on a fresh scratch --dbpath per run (so the
 * 'winedb' database it auto-creates is always empty), runs the mocha
 * suite against it, and tears it down afterwards.
 *
 * Guard: if port 27017 is already occupied when this starts, it
 * aborts instead of running the CRUD suite against whatever is
 * already listening there -- which could be a developer's, or a
 * deployed instance's, real data.
 */

var net = require('net');
var fs = require('fs');
var os = require('os');
var path = require('path');
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;

var MONGO_HOST = '127.0.0.1';
var MONGO_PORT = 27017;
var READY_TIMEOUT_MS = 30000;

function isPortInUse(host, port, callback) {
    var settled = false;
    var socket = net.connect({host: host, port: port});

    var timer = setTimeout(function () {
        settled = true;
        socket.destroy();
        callback(false);
    }, 500);

    socket.once('connect', function () {
        if (settled) { return; }
        settled = true;
        clearTimeout(timer);
        socket.destroy();
        callback(true);
    });

    socket.once('error', function () {
        if (settled) { return; }
        settled = true;
        clearTimeout(timer);
        callback(false);
    });
}

function waitForMongo(host, port, deadline, callback) {
    isPortInUse(host, port, function (up) {
        if (up) { return callback(null); }
        if (Date.now() > deadline) {
            return callback(new Error(
                'Timed out waiting for mongod to accept connections on ' + host + ':' + port
            ));
        }
        setTimeout(function () {
            waitForMongo(host, port, deadline, callback);
        }, 250);
    });
}

function main() {
    isPortInUse(MONGO_HOST, MONGO_PORT, function (inUse) {
        if (inUse) {
            console.error(
                'ABORTING: port ' + MONGO_PORT + ' on ' + MONGO_HOST + ' is already in use.\n' +
                'Refusing to point the test suite\'s CRUD assertions at whatever is already ' +
                'listening there -- it could be a developer\'s or a deployed instance\'s real ' +
                '"winedb" data (routes/wines.js hardcodes that host/port/db name with no config ' +
                'hook). Stop whatever is bound to port ' + MONGO_PORT + ' and re-run "npm test".'
            );
            process.exitCode = 1;
            return;
        }

        var dbPath = fs.mkdtempSync(path.join(os.tmpdir(), 'wine-cellar-test-mongo-'));
        var logPath = path.join(dbPath, 'mongod.log');

        console.log('Starting a throwaway mongod (dbpath=' + dbPath + ')...');

        var mongod;
        try {
            mongod = spawn('mongod', [
                '--dbpath', dbPath,
                '--port', String(MONGO_PORT),
                '--bind_ip', MONGO_HOST,
                '--logpath', logPath
            ]);
        } catch (spawnErr) {
            reportSpawnFailure(spawnErr);
            process.exitCode = 1;
            return;
        }

        var mongodExited = false;

        mongod.on('error', function (err) {
            reportSpawnFailure(err);
            mongodExited = true;
            process.exitCode = 1;
        });

        mongod.on('exit', function () {
            mongodExited = true;
        });

        function teardown(exitCode) {
            if (!mongodExited) {
                try {
                    process.kill(mongod.pid, 'SIGTERM');
                } catch (killErr) {
                    // already gone
                }
            }
            try {
                fs.rmSync(dbPath, {recursive: true, force: true});
            } catch (rmErr) {
                // best-effort cleanup
            }
            process.exitCode = exitCode;
        }

        waitForMongo(MONGO_HOST, MONGO_PORT, Date.now() + READY_TIMEOUT_MS, function (err) {
            if (mongodExited) {
                console.error(
                    'mongod exited before becoming ready. See log at ' + logPath + ' if it still exists.'
                );
                return teardown(1);
            }

            if (err) {
                console.error(err.message);
                return teardown(1);
            }

            console.log('mongod is up. Running specs...');

            var mocha = spawnSync(process.execPath, [
                path.join(__dirname, '..', 'node_modules', 'mocha', 'bin', '_mocha'),
                '--reporter', 'tap',
                path.join(__dirname, 'unit'),
                path.join(__dirname, 'api')
            ], {stdio: 'inherit'});

            teardown(mocha.status === null ? 1 : mocha.status);
        });
    });
}

function reportSpawnFailure(err) {
    if (err && err.code === 'ENOENT') {
        console.error(
            'Could not find a "mongod" executable on PATH.\n' +
            'Install MongoDB Community Server (a version <= 5.0 -- see test/README.md for why) ' +
            'and make sure "mongod" is on PATH, then re-run "npm test".'
        );
    } else {
        console.error('Failed to start mongod: ' + (err && err.message ? err.message : err));
    }
}

main();
