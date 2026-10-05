beforeEachScenario(() => console.log('beforeEachScenario (b.js)'));

Feature('Feature in b.js', () => {
  Scenario('b', () => {
    Given('a step', () => {});
  });
});
