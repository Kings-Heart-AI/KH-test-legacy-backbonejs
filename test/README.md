# Test suite notes

## Runner: mocha 1.21.5 + supertest 0.8.3, invoked via `_mocha` directly

This repo is pinned to a long-EOL stack (`node@0.8.4` / `npm@1.1.49`,
`express@3.x`, `mongodb@1.1.8` — see the root `package.json`). The test
tooling deliberately targets versions that were contemporary with that
stack (`mocha@1.21.5`, `supertest@0.8.3`), and both install cleanly
against a modern Node/npm.

**However, do not run tests via `node_modules/.bin/mocha` (or the
`mocha` binary at all).** The `mocha@1.x` CLI wrapper
(`node_modules/mocha/bin/mocha`) spawns its real runner with
`spawn(proc, args, { customFds: [0, 1, 2] })`. The `customFds` option
was removed from Node's `child_process` API long ago; modern Node
silently ignores it, so the spawned child's stdout is never connected
back to the parent. The wrapper still exits `0`, but produces **zero
output** whenever it isn't attached to a real TTY — i.e. every time it
runs piped or redirected, which is every CI invocation.

The fix is to bypass the wrapper and invoke mocha's actual runner
directly:

```
node node_modules/mocha/bin/_mocha --reporter tap <files or dirs>
```

This is what `npm test` / `npm run test:mocha` do (see the root
`package.json`); do not "simplify" that back to plain `mocha` later,
it will silently stop reporting anything in CI.

## Running the suite

```
npm test
```

This starts a throwaway `mongod` bound to `127.0.0.1:27017` with a
fresh scratch `--dbpath` (see `test/run-with-mongo.js`), runs
`test/unit` and `test/api` via `_mocha`, then tears the `mongod` down
again. If port 27017 is already occupied when this starts, it aborts
immediately instead of running the suite's CRUD tests against
whatever is already listening there (which could be a developer's, or
a deployed instance's, real `winedb` data — `routes/wines.js`
hardcodes that host/port/database name with no config hook, so an
exclusive throwaway instance is the only additive way to get
isolation).

`npm test` requires a `mongod` binary on `PATH`. **It must be a
version that still speaks the legacy MongoDB wire protocol
(OP_INSERT/OP_UPDATE/OP_DELETE/OP_QUERY)** — MongoDB removed those
opcodes server-side in 5.1, and the pinned `mongodb@1.1.8` driver used
by `routes/wines.js` predates their replacement (`OP_MSG`) entirely,
so it cannot speak to a 5.1+ server at all. Use a MongoDB Community
Server release **≤ 5.0** (the CI workflow in
`.github/workflows/test.yml` pins `4.4.29` for exactly this reason).
This exact incompatibility was not reachable from this repo's sandbox
during plan authoring (`fastdl.mongodb.org` was network-blocked, so no
`mongod` of any version could be installed or run there); it is
recorded here as the concrete follow-up risk for whoever first runs
this suite against a real `mongod`.

If you only want the DB-free unit tests (no `mongod` needed):

```
node node_modules/mocha/bin/_mocha --reporter tap test/unit
```

## What's covered

- `test/unit/wine-model.js` — `window.Wine` (`public/js/models/models.js`):
  `urlRoot`, `idAttribute`, defaults, and `validateItem`/`validateAll`.
  No I/O, no jsdom (the model logic never touches the DOM).
- `test/api/wines.js` — the five `/wines` routes in `routes/wines.js`,
  driven through `server.js` with Supertest against a real `mongod`.
- `test/api/workflow.js` — an end-to-end create → read → update →
  delete sequence, plus an explicit assertion that `POST /wines`
  currently succeeds even with `name`/`grapes`/`country` missing
  (`addWine` inserts `req.body` verbatim with no server-side
  validation call anywhere in `routes/wines.js` — validation exists
  only in the browser, in `Wine.validateItem`/`validateAll`).

## CI workflow: `test/ci/github-actions-test.yml`, not `.github/workflows/`

The CI workflow definition for this suite lives at
`test/ci/github-actions-test.yml` instead of the usual
`.github/workflows/test.yml`. GitHub rejects pushes from this
execution's credentials that create or modify files under
`.github/workflows/` (that requires a separate `workflows` OAuth
scope this run's token doesn't have) -- the push was tried and
explicitly rejected with `refusing to allow a GitHub App to create or
update workflow ".github/workflows/test.yml" without "workflows"
permission`. The workflow content itself is complete and ready to run
as-is; a human with the right permissions needs to copy this file to
`.github/workflows/test.yml` (a plain file copy, no edits needed) to
activate it on GitHub Actions.

## Known follow-up (not this run's scope)

The active "Migrate Node Cellar to TypeScript" plan touches the same
files this suite tests against (`server.js`, `routes/wines.js`, the
models). This suite is meant to be the safety net that migration runs
against; once it lands, this suite's `require` paths and the
`global.window`/`global.Backbone`/`global._` shim in
`test/unit/wine-model.js` will need re-porting to whatever module
system the migration introduces. That re-porting is out of scope here.
