import Mocha from 'mocha';

type UiInterface = (rootSuite: Mocha.Suite) => void;
type Callback = Mocha.Func | Mocha.AsyncFunc;
type SuiteBody = (this: Mocha.Suite) => void;
type BlockKind = 'Feature' | 'Scenario';
type HookName = `${'before' | 'after'}Each${BlockKind}`;
type Hooks = Partial<Record<HookName, { title: string; fn: Callback | undefined }[]>>;
// Hooks and declarations are scoped to the suite they were made in, except at the top level of a
// spec file: there the suite is the root suite shared by every file, so the file path is used instead.
type Scope = Mocha.Suite | string;

interface Block {
  kind: BlockKind;
  title: string;
}

/**
 * `Given` / `When` / `Then` / `And` / `But`: mocha's `it` with the keyword prefixed to the title.
 */
export interface StepFunction {
  (title: string, fn?: Mocha.Func): Mocha.Test;
  (title: string, fn?: Mocha.AsyncFunc): Mocha.Test;
  only(title: string, fn?: Mocha.Func): Mocha.Test;
  only(title: string, fn?: Mocha.AsyncFunc): Mocha.Test;
  skip(title: string, fn?: Mocha.Func): Mocha.Test;
  skip(title: string, fn?: Mocha.AsyncFunc): Mocha.Test;
}

/**
 * The globals this UI installs in every spec file, in addition to mocha's `bdd` ones.
 */
export interface ScenarioGlobals {
  Feature: Mocha.SuiteFunction;
  Scenario: Mocha.SuiteFunction;
  Given: StepFunction;
  When: StepFunction;
  Then: StepFunction;
  And: StepFunction;
  But: StepFunction;
  feature: Mocha.SuiteFunction;
  scenario: Mocha.SuiteFunction;
  given: StepFunction;
  when: StepFunction;
  then: StepFunction;
  and: StepFunction;
  but: StepFunction;
  beforeEachFeature: Mocha.HookFunction;
  afterEachFeature: Mocha.HookFunction;
  beforeEachScenario: Mocha.HookFunction;
  afterEachScenario: Mocha.HookFunction;
}

declare global {
  var Feature: Mocha.SuiteFunction;
  var Scenario: Mocha.SuiteFunction;
  var Given: StepFunction;
  var When: StepFunction;
  var Then: StepFunction;
  var And: StepFunction;
  var But: StepFunction;
  var feature: Mocha.SuiteFunction;
  var scenario: Mocha.SuiteFunction;
  var given: StepFunction;
  var when: StepFunction;
  var then: StepFunction;
  var and: StepFunction;
  var but: StepFunction;
  var beforeEachFeature: Mocha.HookFunction;
  var afterEachFeature: Mocha.HookFunction;
  var beforeEachScenario: Mocha.HookFunction;
  var afterEachScenario: Mocha.HookFunction;
}

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

  const hooks = new Map<Scope, Hooks>();
  // The first Feature/Scenario declared in a scope: registering a hook there afterwards throws,
  // because the hook could not apply to that block.
  const firstBlock = new Map<Scope, Block>();
  const blocks = new WeakMap<Mocha.Suite, Block>();

  rootSuite.on(Mocha.Suite.constants.EVENT_FILE_PRE_REQUIRE, (context, file) => {
    // Watch mode loads a file again on every run.
    hooks.delete(file);
    firstBlock.delete(file);

    const { describe, it } = context;
    // mocha accepts a skipped suite without a body; @types/mocha requires one.
    const describeSkip = describe.skip as (title: string, fn?: SuiteBody) => Mocha.Suite | void;
    // bdd calls a suite body with the new suite as `this` before any child is declared, so
    // wrapping every body keeps this in sync with bdd's own suite stack.
    let current: Mocha.Suite = rootSuite;

    const scopeOf = (suite: Mocha.Suite): Scope => (suite === rootSuite ? file : suite);

    const attachInherited = (suite: Mocha.Suite, name: HookName, method: 'beforeAll' | 'afterAll'): void => {
      const scopes: Scope[] = [];
      for (let ancestor = suite.parent; ancestor; ancestor = ancestor.parent) {
        scopes.push(scopeOf(ancestor));
      }
      // before hooks run outermost first; after hooks mirror that order.
      if (method === 'beforeAll') {
        scopes.reverse();
      }
      for (const scope of scopes) {
        for (const { title, fn } of hooks.get(scope)?.[name] ?? []) {
          if (method === 'beforeAll') {
            suite.beforeAll(title, fn);
          } else {
            suite.afterAll(title, fn);
          }
        }
      }
    };

    const within = <R>(suite: Mocha.Suite, fn: () => R): R => {
      const parent = current;
      current = suite;
      try {
        return fn();
      } finally {
        current = parent;
      }
    };

    const track = (fn: SuiteBody): SuiteBody =>
      function tracked(this: Mocha.Suite) {
        return within(this, () => fn.call(this));
      };

    const guarded =
      <R>(name: string, create: (title: string, fn?: SuiteBody) => R) =>
      (title: string, fn?: SuiteBody): R => {
        const block = blocks.get(current);
        if (block) {
          throw new Error(`${name}('${title}') is not allowed inside ${block.kind} '${block.title}'; use Scenario`);
        }
        return create(title, fn && track(fn));
      };

    const block = (kind: BlockKind): Mocha.SuiteFunction => {
      const declare =
        <R>(create: (title: string, fn?: SuiteBody) => R) =>
        (title: string, fn?: SuiteBody): R => {
          const scope = scopeOf(current);
          if (!firstBlock.has(scope)) {
            firstBlock.set(scope, { kind, title });
          }
          const body =
            fn &&
            function body(this: Mocha.Suite) {
              blocks.set(this, { kind, title });
              return within(this, () => {
                attachInherited(this, `beforeEach${kind}`, 'beforeAll');
                const result = fn.call(this);
                attachInherited(this, `afterEach${kind}`, 'afterAll');
                return result;
              });
            };
          return create(`${kind}: ${title}`, body);
        };
      return Object.assign(declare(describe), {
        only: declare(describe.only),
        skip: declare(describeSkip),
      });
    };

    const step = (keyword: string): StepFunction => {
      const label = (title: string) => `${keyword} ${title}`;
      return Object.assign((title: string, fn?: Callback) => it(label(title), fn), {
        only: (title: string, fn?: Callback) => it.only(label(title), fn),
        skip: (title: string, fn?: Callback) => it.skip(label(title), fn),
      });
    };

    const hook =
      (name: HookName): Mocha.HookFunction =>
      (titleOrFn: string | Callback, fn?: Callback) => {
        const scope = scopeOf(current);
        const first = firstBlock.get(scope);
        if (first) {
          throw new Error(`${name}() must be declared before ${first.kind} '${first.title}' in the same block`);
        }
        const entry =
          typeof titleOrFn === 'function' ? { title: titleOrFn.name, fn: titleOrFn } : { title: titleOrFn, fn };
        const scopeHooks = hooks.get(scope) ?? {};
        (scopeHooks[name] ??= []).push(entry);
        hooks.set(scope, scopeHooks);
      };

    context.describe = context.context = Object.assign(guarded('describe', describe), {
      only: guarded('describe.only', describe.only),
      skip: guarded('describe.skip', describeSkip),
    });
    context.xdescribe = context.xcontext = guarded('xdescribe', describeSkip);

    const Feature = block('Feature');
    const Scenario = block('Scenario');
    const Given = step('Given');
    const When = step('When');
    const Then = step('Then');
    const And = step('And');
    const But = step('But');
    const globals: ScenarioGlobals = {
      Feature,
      Scenario,
      Given,
      When,
      Then,
      And,
      But,
      feature: Feature,
      scenario: Scenario,
      given: Given,
      when: When,
      then: Then,
      and: And,
      but: But,
      beforeEachFeature: hook('beforeEachFeature'),
      afterEachFeature: hook('afterEachFeature'),
      beforeEachScenario: hook('beforeEachScenario'),
      afterEachScenario: hook('afterEachScenario'),
    };
    Object.assign(context, globals);
  });
};

// Lets `--ui mocha-scenarios`, `.mocharc` `"ui"` and `new Mocha({ ui })` resolve the
// UI by name once the package has been loaded.
(Mocha.interfaces as Record<string, UiInterface>)['mocha-scenarios'] = mochaScenarios;

export default mochaScenarios;
// Mocha 11 does not unwrap `.default` from a required UI module; this makes
// `require()` of this ESM file return the function itself (Node >= 20.19 / 22.12).
export { mochaScenarios as 'module.exports' };
