'use strict';

var assert = require('assert');
var path = require('path');

// public/js/models/models.js is a plain browser script: it assumes
// `window`, `Backbone` and `_` are already global and assigns onto
// `window.Wine` / `window.WineCollection` rather than exporting
// anything. Shim those three globals before requiring the real file
// (not a copy) so we exercise the exact same code the browser runs.
global._ = require('underscore');
global.Backbone = require('backbone');
global.window = global;

require(path.join(__dirname, '..', '..', 'public', 'js', 'models', 'models.js'));

var Wine = global.window.Wine;

describe('Wine model', function () {

    it('has the expected urlRoot', function () {
        var wine = new Wine();
        assert.strictEqual(wine.urlRoot, '/wines');
    });

    it('has the expected idAttribute', function () {
        var wine = new Wine();
        assert.strictEqual(wine.idAttribute, '_id');
    });

    it('defaults country to USA', function () {
        var wine = new Wine();
        assert.strictEqual(wine.get('country'), 'USA');
    });

    it('defaults region to California', function () {
        var wine = new Wine();
        assert.strictEqual(wine.get('region'), 'California');
    });

    it('defaults picture to null', function () {
        var wine = new Wine();
        assert.strictEqual(wine.get('picture'), null);
    });

});

describe('Wine#validateItem / validateAll', function () {

    it('flags an empty name as invalid', function () {
        var wine = new Wine({name: '', grapes: 'Merlot', country: 'France'});
        var check = wine.validateItem('name');
        assert.strictEqual(check.isValid, false);
        assert.ok(check.message, 'expected a validation message');
    });

    it('flags empty grapes as invalid', function () {
        var wine = new Wine({name: 'Test Wine', grapes: '', country: 'France'});
        var check = wine.validateItem('grapes');
        assert.strictEqual(check.isValid, false);
        assert.ok(check.message, 'expected a validation message');
    });

    it('flags an empty country as invalid', function () {
        var wine = new Wine({name: 'Test Wine', grapes: 'Merlot', country: ''});
        var check = wine.validateItem('country');
        assert.strictEqual(check.isValid, false);
        assert.ok(check.message, 'expected a validation message');
    });

    it('passes validateAll when name, grapes and country are all populated', function () {
        var wine = new Wine({name: 'Test Wine', grapes: 'Merlot', country: 'France'});
        var check = wine.validateAll();
        assert.strictEqual(check.isValid, true);
    });

});
