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

  it('installs exactly the globals listed in mocha-scenarios/globals on top of bdd', () => {
    const installed = (bind) => {
      const root = new Mocha.Suite('', new Mocha.Context(), true);
      const context = {};
      bind(root);
      root.emit(Mocha.Suite.constants.EVENT_FILE_PRE_REQUIRE, context, '/spec.js', { options: {} });
      return Object.keys(context);
    };
    const bdd = installed(Mocha.interfaces.bdd);
    const added = installed(ui).filter((name) => !bdd.includes(name));
    assert.deepEqual(added.sort(), Object.keys(globals).sort());
  });
});

describe('several Mocha instances in one process', () => {
  // Watch mode applies the UI to a new root suite on every rerun and a parallel worker to one per
  // file, so nothing may carry over from one application of the UI to the next.
  it('runs the same declarations identically on consecutive instances', async () => {
    const { EVENT_SUITE_BEGIN, EVENT_TEST_PASS, EVENT_TEST_FAIL } = Mocha.Runner.constants;
    const transcript = async () => {
      const events = [];
      class Recorder {
        constructor(runner) {
          runner.on(EVENT_SUITE_BEGIN, (suite) => {
            if (!suite.root) {
              events.push(suite.title);
            }
          });
          runner.on(EVENT_TEST_PASS, (test) => events.push(`✔ ${test.title}`));
          runner.on(EVENT_TEST_FAIL, (test, err) => events.push(`✖ ${test.title}: ${err.message}`));
        }
      }
      const instance = new Mocha({ ui: 'mocha-scenarios', reporter: Recorder });
      const context = {};
      instance.suite.emit(Mocha.Suite.constants.EVENT_FILE_PRE_REQUIRE, context, '/spec.js', instance);
      context.beforeEachScenario(() => events.push('beforeEachScenario'));
      context.Feature('Reuse', () => {
        context.Scenario('rerun', () => {
          context.Given('a step', () => {});
        });
      });
      await new Promise((resolve) => instance.run(resolve));
      instance.dispose();
      return events;
    };
    const expected = ['Feature: Reuse', 'Scenario: rerun', 'beforeEachScenario', '✔ Given a step'];
    assert.deepEqual(await transcript(), expected);
    assert.deepEqual(await transcript(), expected);
  });
});
