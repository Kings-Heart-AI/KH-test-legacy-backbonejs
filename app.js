var express = require('express'),
    path = require('path'),
    http = require('http'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    socketio = require('socket.io'),
    wine = require('./routes/wines');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Reads the Mongo connection details from MONGODB_URI (set automatically by
// Heroku/MongoLab), falling back to the historical localhost/winedb defaults
// for local development.
var mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/winedb';
mongoose.connect(mongoUri).catch(function (err) {
    console.error('MongoDB connection error: ' + err);
});
mongoose.connection.on('error', function (err) {
    console.error('MongoDB connection error: ' + err);
});
mongoose.connection.once('open', function () {
    console.log("Connected to '" + mongoose.connection.name + "' database");
});

app.get('/wines', wine.findAll);
app.get('/wines/:id', wine.findById);
app.post('/wines', wine.addWine);
app.put('/wines/:id', wine.updateWine);
app.delete('/wines/:id', wine.deleteWine);

// Express 4 error handler (must be defined last, with 4 args)
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send({ error: 'An error has occurred' });
});

var server = http.createServer(app);

// socket.io 4.x wiring, attached to the Express 4 http.Server instance.
// allowRequest re-implements the old io.set('authorization', ...) cross-domain
// rejection: reject handshakes whose Origin header doesn't match this host.
var io = socketio(server, {
    allowRequest: function (req, callback) {
        var origin = req.headers.origin;
        if (origin && req.headers.host && origin.indexOf(req.headers.host) === -1) {
            return callback('Cross-domain connections are not allowed', false);
        }
        callback(null, true);
    }
});

io.on('connection', function (socket) {

    socket.on('message', function (message) {
        console.log("Got message: " + message);
        var ip = socket.handshake.address;
        var url = message;
        io.emit('pageview', { 'connections': io.engine.clientsCount, 'ip': '***.***.***.' + ip.substring(ip.lastIndexOf('.') + 1), 'url': url, 'xdomain': !!socket.handshake.headers.origin, 'timestamp': new Date()});
    });

    socket.on('disconnect', function () {
        console.log("Socket disconnected");
        io.emit('pageview', { 'connections': io.engine.clientsCount });
    });

});

server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
