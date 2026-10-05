import assert from 'node:assert/strict';

Feature('Mocha Scenarios', () => {
  Scenario('all keywords', () => {
    Given('that 1 + 1 is 2', () => assert.equal(1 + 1, 2));
    And('2 + 2 is 4', () => assert.equal(2 + 2, 4));
    But('2 + 3 is not 4', () => assert.notEqual(2 + 3, 4));
    When('something is true', () => assert.ok(true));
    Then('everything should be ok', () => assert.ok(true));
  });
});
