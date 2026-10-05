Feature('Nesting', () => {
  beforeEachScenario(() => console.log('beforeEachScenario (Feature)'));

  Scenario('outer', () => {
    beforeEachScenario(() => console.log('beforeEachScenario (outer Scenario)'));

    Given('a step in the outer scenario', () => {});

    Scenario('inner', () => {
      Then('a step in the inner scenario', () => {});
    });
  });

  Feature('nested feature', () => {
    Scenario('inside', () => {
      Given('a step', () => {});
    });
  });
});
