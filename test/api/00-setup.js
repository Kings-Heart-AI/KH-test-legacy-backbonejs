'use strict';

// A root-level (not nested in a describe) `before` hook runs once
// before every spec in the whole mocha process, regardless of which
// file it's declared in. routes/wines.js opens its Mongo connection
// asynchronously and, on a fresh database, kicks off populateDB() to
// seed ~23 sample wines -- neither of those is awaited anywhere in
// routes/wines.js itself, so the API specs poll GET /wines until the
// server is actually ready instead of assuming it is the instant
// server.js is required.

var request = require('supertest');
var baseUrl = require('../support/app');

before(function (done) {
    this.timeout(20000);

    var attempts = 0;
    var maxAttempts = 60;

    (function poll() {
        attempts += 1;
        request(baseUrl)
            .get('/wines')
            .end(function (err, res) {
                if (!err && res && res.status === 200 && Array.isArray(res.body) && res.body.length > 0) {
                    return done();
                }
                if (attempts >= maxAttempts) {
                    return done(new Error(
                        'Timed out waiting for server.js to connect to Mongo and for ' +
                        'populateDB() to seed the wines collection.'
                    ));
                }
                setTimeout(poll, 250);
            });
    }());
});
