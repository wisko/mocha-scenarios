# AGENTS - mocha-scenarios

## What this is

`mocha-scenarios` is an npm package providing a mocha UI (`--ui mocha-scenarios`) that adds Gherkin vocabulary (`Feature` / `Scenario` / `Given` / `When` / `Then` / `And` / `But`, lower-case aliases, and `beforeEachFeature` / `afterEachFeature` / `beforeEachScenario` / `afterEachScenario`) on top of mocha's `bdd` interface. `README.md` is the behavioral specification; keep code, `src/globals.ts`, tests and README in sync.

## Layout

- `src/index.ts` - the UI; registers itself in `Mocha.interfaces`; default export + `'module.exports'` export; `declare global` block with the ambient typings of the globals
- `src/globals.ts` - ESLint globals object; same dual export; keyed by the UI's `ScenarioGlobals` interface
- `test/*.test.js` - plain ESM JavaScript, run by mocha with the built package as its own UI
- `test/features/<name>/` - behavioral fixtures: `*.feature.js` written with the UI + `expected.txt` (+ `options.json`)
- `test/helpers/` - child-process runner, API entry point and the transcript reporter for the fixtures
- `test/tsconfig.json` - editor-only: puts the test files and `src/index.ts` in one program so the ambient globals resolve in the tests; `checkJs` is off and no script uses it
- `scripts/pack-test.js` - packs the tarball, installs it into a temp project with mocha and runs a spec there
- `scripts/changelog-section.js` - prints one version's `CHANGELOG.md` section; the publish workflow's check and Release text
- `dist/` - tsc output (gitignored, published; the only thing in `files`)
- `.mocharc.json` - `require ./dist/index.js`, `ui mocha-scenarios`, `spec test/**/*.test.js`

## Tests

Three layers, all run by `npm test`:

- `test/package.test.js` checks the entry points and library interfaces in-process.
- `test/features.test.js` runs every directory under `test/features/` twice in a child process: through the mocha CLI and through the programmatic API (`test/helpers/run-api.js`). Both use `test/helpers/reporter.js`, which prints the suite tree without colors, durations or stack traces, so `console.log` calls in the fixture interleave with it in event order. The whole run (reporter output, exit code, `Error: message` lines from stderr) is compared verbatim to the directory's `expected.txt`. A directory may hold several `*.feature.js` files and an `options.json` (`{ "delay": true }`).
- `scripts/pack-test.js` is the only test that exercises `files`, the `exports` map, mocha's `require(id)` lookup of `--ui mocha-scenarios` through a real `node_modules`, and the ambient typings (a consumer `tsc` run with `types: ["mocha-scenarios"]`). It installs the tarball plus the mocha and `@types/mocha` versions from the repo's `node_modules`, so the CI matrix's mocha override carries over.

## Module format and loading constraints (do not break)

- The package is **ESM** (`"type": "module"`, tsconfig `module: nodenext`). Mocha's CLI loads a `--ui` plugin with CommonJS `require()` (`Mocha.interfaces[id]` lookup, else `require(id)`, else `require(path.resolve(id))`). This works because Node `>= 20.19 / 22.12` supports `require(esm)`, which is why `engines` is `^20.19.0 || >=22.12.0` and `.npmrc` has `engine-strict=true`. Never lower the floor.
- Every entry point must keep **both** `export default x` and `export { x as 'module.exports' }`. The latter makes `require()` return the function/object itself rather than a namespace. Mocha 12's `Mocha.prototype.ui` unwraps `.default`; mocha 11 does not, so dropping the `'module.exports'` export breaks mocha 11.
- The module must register itself at load time: `Mocha.interfaces['mocha-scenarios'] = ui`. That is what makes `--ui mocha-scenarios`, `"ui"` in `.mocharc`, `new Mocha({ ui: 'mocha-scenarios' })` and `mocha.ui('…')` resolve by name. `@types/mocha` has no index signature on `interfaces`, hence the cast in `src/index.ts`.
- `package.json` `exports` has exactly `"."` and `"./globals"`. Tests import the package by its own name (`import ui from 'mocha-scenarios'`), which relies on this map; adding a subpath means adding it there.
- Use **only mocha's public API** (`Mocha.interfaces.bdd`, `Mocha.Suite`, `Mocha.Suite.constants.EVENT_FILE_PRE_REQUIRE`, `suite.beforeAll/afterAll`, `suite.parent`, …). Internals vary across versions.
- `peerDependencies.mocha` is `>=11`; both majors must keep passing (CI matrix). Mocha 11 is CJS and mocha 12 is ESM; in tests use `const Mocha = mocha.default ?? mocha` after `import * as mocha from 'mocha'`.
- Reporter labels are part of the contract: suites `Feature: <title>` / `Scenario: <title>`, tests `Given <title>`, `When <title>`, etc.
- Keep the package dependency-free at runtime (`mocha` is a peer dependency only).

## TypeScript

`tsconfig.json` is maximal-strict and the build fails on any error (`noEmitOnError`):

- `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`.
- `isolatedDeclarations`: every exported value needs an explicit type annotation.
- `verbatimModuleSyntax`: use `import type` for type-only imports; imports are emitted as written.
- `skipLibCheck: false`, `declaration: true`, `rootDir: src`, `outDir: dist`, target/lib `es2023`.
- `@types/node` is pinned `~20.19.0` on purpose: it is the API ceiling that tracks the lowest version in `engines.node`, so a compatibility break is a compile error. Move the two together. `typescript` stays `<6.1` while `typescript-eslint` requires it (TypeScript 7 has no JS API for the parser). Do not bump either casually.
- Only `/** JSDoc */` comments reach the emitted `.d.ts`; `//` comments stay in the source. Exported symbols get a short JSDoc; internal constraints get `//`.

## Tooling and scripts

Use Node 26 (`.nvmrc`; `nvm use`). The devDependencies (mocha 12, TS 6, ESLint 10) need Node `>= 20.19 / 22.12`; older Node fails `npm install` because of `engine-strict`.

| Command                  | Does                                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| `npm test`               | `pretest` builds → `mocha` → `npm run test:packaging` → `posttest` runs `npm run lint`              |
| `npm run test:packaging` | pack, install the tarball into a temp project with mocha, run a spec there (`scripts/pack-test.js`) |
| `npm run build`          | clean `dist/` and compile                                                                           |
| `npm run typecheck`      | `tsc --noEmit`                                                                                      |
| `npm run lint`           | `eslint --cache .` then `prettier --check .`                                                        |
| `npm run lint:fix`       | eslint `--fix` then `prettier --write .`                                                            |

Tests run against `dist/`, so a code change without a rebuild is not tested; always go through `npm test`. `prepack` builds and `prepublishOnly` runs the full test; never run `npm publish` yourself.

`.mocharc.json` preloads `./dist/index.js` with `require` and then sets `"ui": "mocha-scenarios"` by name. The package is not in its own `node_modules`, so the preload is what registers the interface; keeping the by-name lookup exercises the same path consumers use. Do not simplify it to `"ui": "./dist/index.js"`.

Local runs use mocha 12 from the lockfile; CI (`.github/workflows/ci.yml`) also runs the suite against mocha 11, so there is no need to test both majors locally.

## Lint and formatting rules

- ESLint flat config (`eslint.config.js`): `@eslint/js` recommended everywhere, `typescript-eslint` `recommendedTypeChecked` on `src/**/*.ts` (type-aware via `projectService`), Node globals for `*.js`, Node + mocha globals for `test/**/*.js`, the package's own `mocha-scenarios/globals` for `test/features/**/*.feature.js` (imported from `dist/`, so lint needs a build; `npm test` guarantees one), `eslint-config-prettier` after the presets. A few extra rules apply everywhere (`curly`, `eqeqeq`, `no-console`, `no-eval`, `no-nested-ternary`, `no-var`, `prefer-const`, `prefer-arrow-callback`); `no-console` is off where printing is the purpose: `scripts/`, the transcript reporter and the fixtures. `dist/` is ignored.
- Prettier: 120 columns, single quotes, 2 spaces, LF. `prettier --check .` covers **everything** not in `.prettierignore`, so Markdown, JSON and YAML must be prettier-clean too. Hand-formatted blocks (e.g. tables) can be excluded with `<!-- prettier-ignore -->` on the line above.
- `README.md` opens with a list of its `##` sections; update it when adding, removing or renaming one.

## Code style

- Comments explain non-obvious constraints and the reason for them (see the comments in `src/index.ts`); do not add narrative comments, restate the code, or leave change-history notes.
- Style rules (unused variables, unreachable code, import order) belong in ESLint, not in `tsconfig.json`.

## Workflow

- Anything a user of the package would notice gets a line under `## [Unreleased]` in `CHANGELOG.md` (Keep a Changelog format). The release moves that section under the version heading.
- The maintainer reviews and verifies every change before it is committed. Do not commit, push, tag or publish unless asked; leave changes in the working tree and report what was verified.
- CI runs `npm test` on Node 26 for mocha 11 and 12 on push to `main` and on pull requests.
- Releases: the maintainer moves the `Unreleased` changelog section under the new version, sets the
  version in `package.json` and `package-lock.json`, commits "Release X.Y.Z" on `main` and pushes
  the tag `vX.Y.Z`. The tag push runs `.github/workflows/publish.yml`: it verifies that the tag
  matches the package version, that the commit is on `main` and that the changelog section exists,
  then, after approval of the `npm` environment, publishes with npm trusted publishing (provenance
  is automatic) and creates the GitHub Release from the changelog section.
- Any new global must be added to the `ScenarioGlobals` interface and the `declare global` block in `src/index.ts`, to `src/globals.ts`, covered by a fixture under `test/features/`, and documented in `README.md`. The interface key type and the globals test in `test/package.test.js` catch a missing entry.
