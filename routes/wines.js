var Wine = require('../models/wine');

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving wine: ' + id);
    Wine.findById(id).then(function(item) {
        res.send(item);
    }).catch(function(err) {
        res.send({'error':'An error has occurred'});
    });
};

exports.findAll = function(req, res) {
    Wine.find().then(function(items) {
        res.send(items);
    }).catch(function(err) {
        res.send({'error':'An error has occurred'});
    });
};

exports.addWine = function(req, res) {
    var wine = new Wine(req.body);
    console.log('Adding wine: ' + JSON.stringify(wine));
    wine.save().then(function(result) {
        console.log('Success: ' + JSON.stringify(result));
        res.send(result);
    }).catch(function(err) {
        res.send({'error':'An error has occurred'});
    });
}

exports.updateWine = function(req, res) {
    var id = req.params.id;
    var wine = req.body;
    delete wine._id;
    console.log('Updating wine: ' + id);
    console.log(JSON.stringify(wine));
    Wine.findByIdAndUpdate(id, wine, {new: true}).then(function(result) {
        console.log('Document updated: ' + JSON.stringify(result));
        res.send(result);
    }).catch(function(err) {
        console.log('Error updating wine: ' + err);
        res.send({'error':'An error has occurred'});
    });
}

exports.deleteWine = function(req, res) {
    var id = req.params.id;
    console.log('Deleting wine: ' + id);
    Wine.findByIdAndDelete(id).then(function(result) {
        console.log('Document deleted: ' + JSON.stringify(result));
        res.send(req.body);
    }).catch(function(err) {
        res.send({'error':'An error has occurred - ' + err});
    });
}
