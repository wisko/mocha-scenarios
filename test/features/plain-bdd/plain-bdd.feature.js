describe('A plain describe', () => {
  beforeEachScenario(() => console.log('beforeEachScenario (describe)'));

  it('still works as in bdd', () => {});

  context('with a nested context', () => {
    specify('specify works too', () => {});
  });

  Feature('declared inside describe', () => {
    Scenario('inherits hooks from the describe', () => {
      it('allows plain it inside a Scenario', () => {});
      Given('a step', () => {});
    });
  });
});

xdescribe('A pending describe', () => {
  it('is pending', () => {});
});

describe.skip('A skipped describe', () => {
  Feature('inside it', () => {
    beforeEachScenario(() => console.log('must not run'));
    Scenario('is pending too', () => {
      Given('a step', () => {});
    });
  });
});
