import Mocha from 'mocha';

type UiInterface = (rootSuite: Mocha.Suite) => void;

/**
 * BDD extension of mocha's `bdd` interface: adds the Gherkin vocabulary
 * `Feature` / `Scenario` / `Given` / `When` / `Then` / `And` / `But` on top of
 * `describe` / `it` and the standard hooks, which remain available.
 *
 * Loaded by mocha via `--ui mocha-scenarios` (or `"ui": "mocha-scenarios"` in `.mocharc`),
 * or passed directly as `new Mocha({ ui: mochaScenarios })`.
 */
const mochaScenarios: UiInterface = (rootSuite) => {
  Mocha.interfaces.bdd(rootSuite);
};

// Lets `--ui mocha-scenarios`, `.mocharc` `"ui"` and `new Mocha({ ui })` resolve the
// UI by name once the package has been loaded.
(Mocha.interfaces as Record<string, UiInterface>)['mocha-scenarios'] = mochaScenarios;

export default mochaScenarios;
// Mocha 11 does not unwrap `.default` from a required UI module; this makes
// `require()` of this ESM file return the function itself (Node >= 20.19 / 22.12).
export { mochaScenarios as 'module.exports' };
