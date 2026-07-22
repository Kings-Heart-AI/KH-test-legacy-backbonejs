// One-off audit: count existing "wines" documents that are missing name,
// grapes, and/or country before any `required: true` validator is enabled
// on the Mongoose Wine schema (see models/wine.js).
//
// Usage:
//   MONGODB_URI="<your MongoLab connection string>" node scripts/audit-wine-fields.js
//
// Only flip name/grapes/country to `required: true` in models/wine.js once
// this reports 0 for all three counts (or after backfilling the offending
// documents).

var mongoose = require('mongoose');
var Wine = require('../models/wine');

var mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/winedb';

mongoose.connect(mongoUri)
    .then(function () {
        return Promise.all([
            Wine.countDocuments({ $or: [{ name: null }, { name: { $exists: false } }, { name: '' }] }),
            Wine.countDocuments({ $or: [{ grapes: null }, { grapes: { $exists: false } }, { grapes: '' }] }),
            Wine.countDocuments({ $or: [{ country: null }, { country: { $exists: false } }, { country: '' }] })
        ]);
    })
    .then(function (counts) {
        console.log('Documents missing name:    ' + counts[0]);
        console.log('Documents missing grapes:  ' + counts[1]);
        console.log('Documents missing country: ' + counts[2]);
        return mongoose.disconnect();
    })
    .catch(function (err) {
        console.error('Audit failed:', err);
        process.exitCode = 1;
        return mongoose.disconnect();
    });
