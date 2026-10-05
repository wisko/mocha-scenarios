Feature('Skipping', () => {
  Scenario('runs normally', () => {
    Given('a step', () => {});
    Given.skip('a skipped step', () => {
      throw new Error('skipped steps must not run');
    });
    xit('an xit step', () => {
      throw new Error('xit steps must not run');
    });
    When('a step skips itself', function () {
      this.skip();
    });
    Then('a pending step without a body');
  });

  Scenario.skip('is skipped entirely', () => {
    before(() => console.log('before in skipped Scenario must not run'));
    Given('a step that becomes pending', () => {
      throw new Error('must not run');
    });
    Then('another one', () => {});
  });
});

Feature.skip('A skipped feature', () => {
  beforeEachScenario(() => console.log('beforeEachScenario in skipped Feature must not run'));

  Scenario('with a scenario', () => {
    Given('a step', () => {});
    Then('another step', () => {});
  });
});
