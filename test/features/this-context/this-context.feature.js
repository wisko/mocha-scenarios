import assert from 'node:assert/strict';

Feature('Suite context', () => {
  beforeEachScenario(function () {
    this.timeout(1234);
    console.log(`beforeEachScenario hook has a mocha context: timeout ${this.timeout()}`);
  });

  Scenario('as this in steps and hooks', () => {
    Given('a step can change its timeout', function () {
      this.timeout(4321);
      assert.equal(this.timeout(), 4321);
    });
    Then('a step sees its own title', function () {
      assert.equal(this.test.title, 'Then a step sees its own title');
    });
    And('a step can use done', (done) => {
      setTimeout(done, 1);
    });
    And('a step can return a promise', async () => {
      await new Promise((resolve) => setTimeout(resolve, 1));
    });
  });
});
