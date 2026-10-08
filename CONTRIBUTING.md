# Contributing

## Setup

```sh
nvm use
npm install
npm test
```

`npm test` builds `dist/`, runs the test suite, packs the tarball and installs it into a scratch project, then lints. The tests run against `dist/`, so always go through `npm test` rather than `mocha` alone.

## Tests

- `test/package.test.js` checks the entry points and library interfaces in-process.
- `test/features/<name>/` holds behavioral fixtures: `*.feature.js` files written with the UI and an `expected.txt` with the exact reporter transcript. Each directory runs twice, through the mocha CLI and through the programmatic API.
- `scripts/pack-test.js` exercises the published tarball, including the ambient typings, in a consumer project.

To add a behavior, add a directory under `test/features/` with a `*.feature.js` file, run `UPDATE_FEATURES=1 npm test` to write its `expected.txt` from the CLI run, and review the transcript before keeping it.

## Adding a global

A new global must be added to the `ScenarioGlobals` interface and the `declare global` block in `src/index.ts`, to `src/globals.ts`, covered by a fixture under `test/features/`, and documented in `README.md`. The interface key type and the globals test in `test/package.test.js` catch a missing entry.

## Pull requests

- `README.md` is the behavioral specification; a change in behavior changes the README too.
- Add a line under `## [Unreleased]` in `CHANGELOG.md` for anything a user of the package would notice.
- CI runs the suite on every supported Node line against mocha 11 and 12. Both majors must pass.
- `AGENTS.md` holds the repository conventions, including the module format and loading constraints that must not break. Keep it consistent with the change.

Releases are made by the maintainer.
