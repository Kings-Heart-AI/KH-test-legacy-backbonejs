'use strict';

// server.js has no test hook of its own (it starts listening as soon
// as it is required, and exports nothing) -- that's fine for
// Supertest, which can hit a base URL string just as well as an app
// object. We set process.env.PORT before requiring it so we control
// which port it binds; require() caches the module, so requiring this
// file from multiple spec files only starts the server once.

var http = require('http');

var PORT = process.env.WINE_CELLAR_TEST_PORT || 3000;
process.env.PORT = String(PORT);

// server.js calls http.createServer(app).listen(port, callback) with no
// host argument, which binds to all interfaces (0.0.0.0) by Node's
// default. That's fine for the production entrypoint a human runs
// deliberately, but here it would mean every "npm test" run silently
// exposes the unauthenticated /wines CRUD API to the network for the
// duration of the run. Without editing server.js, patch
// http.Server.prototype.listen for the lifetime of this test process
// so a bare listen(port[, callback]) call binds loopback-only instead.
var originalListen = http.Server.prototype.listen;
http.Server.prototype.listen = function (port) {
    var args = Array.prototype.slice.call(arguments);
    var isPortLike = typeof port === 'number' || typeof port === 'string';
    if (isPortLike && (args.length === 1 || typeof args[1] === 'function')) {
        args.splice(1, 0, '127.0.0.1');
    }
    return originalListen.apply(this, args);
};

require('../../server');

module.exports = 'http://127.0.0.1:' + PORT;
