beforeEachFeature(() => console.log('beforeEachFeature (a.js)'));
beforeEachScenario(() => console.log('beforeEachScenario (a.js)'));

Feature('Feature in a.js', () => {
  Scenario('a', () => {
    Given('a step', () => {});
  });
});
