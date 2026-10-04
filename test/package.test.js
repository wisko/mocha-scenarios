import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import * as mocha from 'mocha';
import ui from 'mocha-scenarios';
import globals from 'mocha-scenarios/globals';

const require = createRequire(import.meta.url);
const Mocha = mocha.default ?? mocha;

describe('package entry points', () => {
  it('exports the UI function as the default export', () => {
    assert.equal(typeof ui, 'function');
  });

  it('registers itself as a named mocha interface', () => {
    assert.equal(Mocha.interfaces['mocha-scenarios'], ui);
  });

  it('returns the UI function itself from require()', () => {
    assert.equal(require('mocha-scenarios'), ui);
  });

  it('exposes the ESLint globals to both import and require()', () => {
    assert.equal(require('mocha-scenarios/globals'), globals);
    assert.equal(globals.Feature, 'readonly');
    assert.equal(globals.beforeEachScenario, 'readonly');
  });
});
