# Changelog

All notable changes to this project are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- README section on watch and parallel mode: both work as is, and mocha's own restrictions on ES module spec files in watch mode and on `.only` in parallel mode are linked.

## [1.0.0] - 2026-10-10

### Added

- JSDoc on the globals, shown by editors on hover and in completions.

### Changed

- `describe` and `context` are allowed inside a `Feature` or `Scenario` as plain grouping suites, and the `beforeEach*`/`afterEach*` hooks apply through them. Declaring such a hook after a `describe` or `context` in the same block throws, as it already does after a `Feature` or `Scenario`.

## [0.1.0] - 2026-10-08

### Added

- Mocha UI `mocha-scenarios` with the `Feature`, `Scenario`, `Given`, `When`, `Then`, `And` and `But` globals, their lower-case aliases, and the `beforeEachFeature`, `afterEachFeature`, `beforeEachScenario` and `afterEachScenario` hooks.
- `mocha-scenarios/globals` with the ESLint globals of the UI.
- Ambient TypeScript typings for the globals.
