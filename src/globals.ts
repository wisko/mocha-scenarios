type ScenarioGlobal =
  | 'Feature'
  | 'Scenario'
  | 'Given'
  | 'When'
  | 'Then'
  | 'And'
  | 'But'
  | 'feature'
  | 'scenario'
  | 'given'
  | 'when'
  | 'then'
  | 'and'
  | 'but'
  | 'beforeEachFeature'
  | 'afterEachFeature'
  | 'beforeEachScenario'
  | 'afterEachScenario';

type ScenarioGlobals = Readonly<Record<ScenarioGlobal, 'readonly'>>;

/**
 * ESLint `languageOptions.globals` entry for spec files written with this UI.
 * Combine with `globals.mocha` for `describe`, `it` and the standard hooks:
 *
 * ```js
 * import globals from 'globals';
 * import scenarioGlobals from 'mocha-scenarios/globals';
 * export default [{ languageOptions: { globals: { ...globals.mocha, ...scenarioGlobals } } }];
 * ```
 */
const globals: ScenarioGlobals = Object.freeze({
  Feature: 'readonly',
  Scenario: 'readonly',
  Given: 'readonly',
  When: 'readonly',
  Then: 'readonly',
  And: 'readonly',
  But: 'readonly',
  feature: 'readonly',
  scenario: 'readonly',
  given: 'readonly',
  when: 'readonly',
  then: 'readonly',
  and: 'readonly',
  but: 'readonly',
  beforeEachFeature: 'readonly',
  afterEachFeature: 'readonly',
  beforeEachScenario: 'readonly',
  afterEachScenario: 'readonly',
});

export default globals;
export { globals as 'module.exports' };
