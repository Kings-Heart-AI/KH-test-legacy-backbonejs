'use strict';

// server.js has no test hook of its own (it starts listening as soon
// as it is required, and exports nothing) -- that's fine for
// Supertest, which can hit a base URL string just as well as an app
// object. We set process.env.PORT before requiring it so we control
// which port it binds; require() caches the module, so requiring this
// file from multiple spec files only starts the server once.

var PORT = process.env.WINE_CELLAR_TEST_PORT || 3000;
process.env.PORT = String(PORT);

require('../../server');

module.exports = 'http://127.0.0.1:' + PORT;
