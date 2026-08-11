'use strict';

var request = require('supertest');
var assert = require('assert');
var baseUrl = require('../support/app');

function isEmptyResponseBody(body) {
    return body === undefined || body === null || (typeof body === 'object' && Object.keys(body).length === 0);
}

describe('Browse -> add -> edit -> delete workflow (API layer)', function () {
    var wineId;

    it('creates a wine', function (done) {
        request(baseUrl)
            .post('/wines')
            .send({
                name: 'Workflow Wine',
                grapes: 'Workflow Grape',
                country: 'Workflow Country',
                region: 'Workflow Region',
                year: '2021',
                description: 'Created by the create->read->update->delete workflow smoke test'
            })
            .expect(200)
            .end(function (err, res) {
                if (err) { return done(err); }
                assert.ok(res.body._id, 'expected the created document to have an _id');
                wineId = res.body._id;
                done();
            });
    });

    it('fetches the created wine', function (done) {
        request(baseUrl)
            .get('/wines/' + wineId)
            .expect(200)
            .end(function (err, res) {
                if (err) { return done(err); }
                assert.strictEqual(res.body.name, 'Workflow Wine');
                done();
            });
    });

    it('updates the wine and a follow-up GET reflects the change', function (done) {
        request(baseUrl)
            .put('/wines/' + wineId)
            .send({
                name: 'Workflow Wine (edited)',
                grapes: 'Workflow Grape',
                country: 'Workflow Country'
            })
            .expect(200)
            .end(function (err) {
                if (err) { return done(err); }
                request(baseUrl)
                    .get('/wines/' + wineId)
                    .expect(200)
                    .end(function (err2, res2) {
                        if (err2) { return done(err2); }
                        assert.strictEqual(res2.body.name, 'Workflow Wine (edited)');
                        done();
                    });
            });
    });

    it('deletes the wine, and a follow-up GET no longer finds it', function (done) {
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

describe('Current server-side validation gap', function () {

    // routes/wines.js#addWine inserts req.body verbatim -- it never
    // calls Wine.validateItem/validateAll anywhere. That validation
    // logic lives only in public/js/models/models.js and only runs in
    // the browser. This test documents that gap rather than silently
    // assuming a server-side safeguard that doesn't exist: it is
    // *expected* to keep passing even though the payload below is
    // missing name/grapes/country, matching addWine's current
    // behavior. If this ever starts failing, it means server-side
    // validation was added -- update this test, don't "fix" it back.
    it('still accepts a POST missing name, grapes and country', function (done) {
        request(baseUrl)
            .post('/wines')
            .send({description: 'No name, grapes or country supplied'})
            .expect(200)
            .end(function (err, res) {
                if (err) { return done(err); }
                assert.ok(res.body._id, 'expected the unvalidated document to still be inserted');
                done();
            });
    });

});
