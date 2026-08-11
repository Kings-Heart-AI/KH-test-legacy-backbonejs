'use strict';

var request = require('supertest');
var assert = require('assert');
var baseUrl = require('../support/app');

function isEmptyResponseBody(body) {
    return body === undefined || body === null || (typeof body === 'object' && Object.keys(body).length === 0);
}

describe('GET /wines', function () {

    it('returns the sample wines that populateDB() seeds on first run', function (done) {
        request(baseUrl)
            .get('/wines')
            .expect(200)
            .end(function (err, res) {
                if (err) { return done(err); }
                assert.ok(Array.isArray(res.body));
                assert.ok(res.body.length > 0, 'expected at least one seeded wine');
                res.body.forEach(function (wine) {
                    assert.ok(wine._id);
                    assert.ok(wine.name);
                });
                done();
            });
    });

});

describe('GET /wines/:id', function () {
    var seededId;

    before(function (done) {
        request(baseUrl)
            .get('/wines')
            .end(function (err, res) {
                if (err) { return done(err); }
                seededId = res.body[0]._id;
                done();
            });
    });

    it('returns the matching wine for a valid, existing id', function (done) {
        request(baseUrl)
            .get('/wines/' + seededId)
            .expect(200)
            .end(function (err, res) {
                if (err) { return done(err); }
                assert.strictEqual(res.body._id, seededId);
                done();
            });
    });

    it('returns no document for a well-formed but non-existent id', function (done) {
        // A syntactically valid Mongo ObjectID (24 hex chars) that was
        // never inserted.
        request(baseUrl)
            .get('/wines/ffffffffffffffffffffffff')
            .end(function (err, res) {
                if (err) { return done(err); }
                assert.strictEqual(res.status, 200);
                assert.ok(isEmptyResponseBody(res.body), 'expected no document to be found');
                done();
            });
    });

});

describe('POST /wines', function () {

    it('inserts and echoes back the new wine document', function (done) {
        var newWine = {
            name: 'Integration Test Wine',
            grapes: 'Test Grape',
            country: 'Testland',
            region: 'Test Region',
            year: '2020',
            description: 'Created by test/api/wines.js'
        };

        request(baseUrl)
            .post('/wines')
            .send(newWine)
            .expect(200)
            .end(function (err, res) {
                if (err) { return done(err); }
                assert.strictEqual(res.body.name, newWine.name);
                assert.strictEqual(res.body.grapes, newWine.grapes);
                assert.ok(res.body._id, 'expected the inserted document to have an _id');
                done();
            });
    });

});

describe('PUT /wines/:id then DELETE /wines/:id', function () {
    var wineId;

    before(function (done) {
        request(baseUrl)
            .post('/wines')
            .send({name: 'Wine To Update', grapes: 'Grape', country: 'Country'})
            .end(function (err, res) {
                if (err) { return done(err); }
                wineId = res.body._id;
                done();
            });
    });

    it('replaces the document (the handler strips _id before updating)', function (done) {
        request(baseUrl)
            .put('/wines/' + wineId)
            .send({name: 'Wine Updated', grapes: 'Grape', country: 'Country'})
            .expect(200)
            .end(function (err, res) {
                if (err) { return done(err); }
                assert.strictEqual(res.body.name, 'Wine Updated');
                done();
            });
    });

    it('removes the document, and a follow-up GET no longer finds it', function (done) {
        request(baseUrl)
            .delete('/wines/' + wineId)
            .expect(200)
            .end(function (err) {
                if (err) { return done(err); }
                request(baseUrl)
                    .get('/wines/' + wineId)
                    .end(function (err2, res2) {
                        if (err2) { return done(err2); }
                        assert.ok(isEmptyResponseBody(res2.body), 'expected the wine to be gone');
                        done();
                    });
            });
    });

});
