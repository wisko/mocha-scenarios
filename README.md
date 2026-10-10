# Mocha Scenarios

[![CI](https://github.com/wisko/mocha-scenarios/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/wisko/mocha-scenarios/actions/workflows/ci.yml?query=branch%3Amain)
[![npm version](https://img.shields.io/npm/v/mocha-scenarios?logo=npm&color=387ED1&logoColor=BBB)](https://www.npmjs.com/package/mocha-scenarios)
[![Node version](https://img.shields.io/node/v/mocha-scenarios?logo=nodedotjs&color=5FA04E&logoColor=BBB)](https://www.npmjs.com/package/mocha-scenarios)
[![License](https://img.shields.io/npm/l/mocha-scenarios)](LICENSE)

Feature-style testing for the [mocha](https://mochajs.org) testing framework.

These tests describe your application's behavior in plain language, creating feature documentation that will never drift from your code.

- [Install](#install)
- [Setup](#setup)
- [Usage](#usage)
- [Migrating from mocha-cakes-2](#migrating-from-mocha-cakes-2)
- [Versioning and support](#versioning-and-support)
- [Development](#development)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Install

```sh
npm install --save-dev mocha-scenarios
```

Requires mocha `>=11` and Node `^20.19.0 || >=22.12.0`.

## Setup

You enable the `mocha-scenarios` integration by specifying the `ui` option of mocha, which can be done in a number of ways.

### CLI

```sh
mocha --ui mocha-scenarios 'tests/**/*.test.js'
```

### Mocha config file

Add the following to the [`.mocharc.json`](https://mochajs.org/running/configuring/) file:

```json
{ "ui": "mocha-scenarios" }
```

### Mocha API

Either pass it into the constructor options:

```js
const mocha = new Mocha({
  ui: 'mocha-scenarios',
});
```

or set it up on an existing instance:

```js
const mocha = new Mocha();
mocha.ui('mocha-scenarios');
```

### TypeScript

The package ships ambient declarations for its globals. Add it to `types` in the `tsconfig.json` that covers your spec files, next to mocha's own types from `@types/mocha`:

```json
{ "compilerOptions": { "types": ["mocha", "mocha-scenarios"] } }
```

### ESLint

You can use the exported globals to let ESLint know about the globals this package adds, combined with the mocha globals from the [`globals`](https://www.npmjs.com/package/globals) package:

```js
// eslint.config.js
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import scenarioGlobals from 'mocha-scenarios/globals';

export default defineConfig([
  {
    files: ['tests/**'],
    languageOptions: {
      globals: {
        ...globals.mocha,
        ...scenarioGlobals,
      },
    },
  },
]);
```

## Usage

The integration adds the following globals:

- `Feature`
  - `Scenario`
    - `Given`
    - `When`
    - `Then`
    - `And`
    - `But`

along with lowercase aliases (`feature`, `scenario`, …). All of them support mocha's `.only` and `.skip` functionality.

Setup and teardown functions are also provided:

- `beforeEachFeature`
- `afterEachFeature`
- `beforeEachScenario`
- `afterEachScenario`

Each runs once before (or after) every `Feature` or `Scenario` declared beneath it, and accepts either `(fn)` or `(name, fn)` as parameters. Declare them above the blocks they apply to. When declared at the top level of a file they apply to that file only.

Mocha's standard `before`, `after`, `beforeEach` and `afterEach` hooks can also be used. Note that `beforeEach` runs before every single step of a scenario.

Mocha's `describe` and `context` can group Features, Scenarios and steps at any level. They are reported with their plain title, and the hooks above apply through them.

### Basic test structure

```js
Feature('Login', () => {
  afterEachScenario(resetDatabase);

  Scenario('valid credentials', () => {
    let page;

    Given('a registered user', async () => {
      await createUser('alice', 'secret');
    });
    When('they log in', async () => {
      page = await login('alice', 'secret');
    });
    Then('they see their profile page', () => {
      assert.equal(page.title, 'Profile');
    });
  });
});
```

Reporter output reads like the specification:

```
Feature: Login
  Scenario: valid credentials
    ✔ Given a registered user
    ✔ When they log in
    ✔ Then they see their profile page
```

### Rules

- Declaring a `beforeEach*`/`afterEach*` hook after a `Feature`, `Scenario`, `describe` or `context` in the same block throws, since it would otherwise silently skip the earlier ones.
- Everything inside a skipped `Feature` or `Scenario` is reported as pending.

## Migrating from mocha-cakes-2

The vocabulary, labels and reporter output are the same, so most suites run unchanged. The differences are:

- Inherited hooks run **outermost first**: a `beforeEachScenario` on the `Feature` runs before one declared in a nested `Scenario`, and before the Scenario's own `before` hooks. The `after` hooks run in reverse order, innermost first.
- Hooks declared at the top level of a file no longer leak into other files. For truly global hooks, use mocha's [root hook plugin](https://mochajs.org/features/root-hook-plugins/).
- `.only` uses mocha's native mechanism, so several `.only` blocks and titles with regex characters work.
- Works on mocha 12.

## Versioning and support

This package follows [semantic versioning](https://semver.org). The public API is the globals and hooks described under [Usage](#usage), the reporter labels, the `mocha-scenarios` and `mocha-scenarios/globals` entry points, and the ambient typings. Dropping a Node or mocha version is a major release. Changes are listed in [CHANGELOG.md](CHANGELOG.md).

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, the test layers and how to add a behavior, and `AGENTS.md` for repository conventions.

## License

This project is licensed under the MIT License.

## Acknowledgements

This package is heavily influenced by [mocha-cakes-2](https://github.com/iensu/mocha-cakes-2).
