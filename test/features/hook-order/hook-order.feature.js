beforeEachFeature(function resetWorld() {
  console.log('beforeEachFeature (file, named by function)');
});
afterEachFeature('tear down world', () => console.log('afterEachFeature (file, named by title)'));
beforeEachScenario(() => console.log('beforeEachScenario (file)'));
afterEachScenario(() => console.log('afterEachScenario (file)'));

Feature('Hook ordering', () => {
  before(() => console.log('before (Feature)'));
  after(() => console.log('after (Feature)'));
  beforeEachScenario(() => console.log('beforeEachScenario (Feature)'));
  afterEachScenario(() => console.log('afterEachScenario (Feature)'));

  Scenario('first', () => {
    before(() => console.log('before (Scenario first)'));
    after(() => console.log('after (Scenario first)'));
    beforeEach(() => console.log('beforeEach (Scenario first)'));

    Given('a step', () => {});
    Then('another step', () => {});
  });

  Scenario('second', () => {
    Given('a step', () => {});
  });
});

Feature('Another feature', () => {
  Scenario('third', () => {
    Given('a step', () => {});
  });
});
