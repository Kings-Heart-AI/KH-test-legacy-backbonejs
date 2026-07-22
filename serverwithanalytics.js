var express = require('express'),
    path = require('path'),
    http = require('http'),
    morgan = require('morgan'),
    Server = require('socket.io').Server,
    wine = require('./routes/wines');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client', 'dist')));
// Fallback for the pre-existing /pics, /img and /css assets the React app still links to directly.
app.use(express.static(path.join(__dirname, 'public')));

app.get('/wines', wine.findAll);
app.get('/wines/:id', wine.findById);
app.post('/wines', wine.addWine);
app.put('/wines/:id', wine.updateWine);
app.delete('/wines/:id', wine.deleteWine);

var server = http.createServer(app);

var io = new Server(server, {
    // Reject cross-domain handshakes, mirroring the legacy io.set('authorization', ...) check.
    // (Note: socket.io's `cors` option only controls response headers for browser CORS preflight;
    // `cors: {origin: false}` does NOT reject the connection. `allowRequest` is the option that
    // actually accepts/rejects the handshake itself.)
    allowRequest: function (req, callback) {
        var origin = req.headers.origin;
        if (!origin) {
            return callback(null, true);
        }
        var originHost;
        try {
            originHost = new URL(origin).host;
        } catch (e) {
            return callback('Cross-domain connections are not allowed', false);
        }
        if (originHost === req.headers.host) {
            return callback(null, true);
        }
        callback('Cross-domain connections are not allowed', false);
    }
});

server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

io.on('connection', function (socket) {

    socket.on('message', function (message) {
        console.log("Got message: " + message);
        var ip = socket.handshake.address;
        var url = message;
        var isXDomain = socket.handshake.headers.origin !== undefined;
        io.emit('pageview', { 'connections': io.engine.clientsCount, 'ip': '***.***.***.' + ip.substring(ip.lastIndexOf('.') + 1), 'url': url, 'xdomain': isXDomain, 'timestamp': new Date()});
    });

    socket.on('disconnect', function () {
        console.log("Socket disconnected");
        io.emit('pageview', { 'connections': io.engine.clientsCount});
    });

});
