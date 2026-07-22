var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// Mirrors the fields already produced/consumed by public/js/models/models.js
// (window.Wine). NOTE: name/grapes/country are deliberately NOT marked
// `required: true` yet -- see scripts/audit-wine-fields.js. Only flip them to
// required once that audit confirms zero existing MongoLab documents would
// be rejected.
var wineSchema = new Schema({
    name: { type: String },
    grapes: { type: String },
    country: { type: String, default: 'USA' },
    region: { type: String, default: 'California' },
    year: { type: String },
    description: { type: String },
    picture: { type: String }
});

module.exports = mongoose.model('Wine', wineSchema, 'wines');
