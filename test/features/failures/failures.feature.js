Feature('Failing steps and hooks', () => {
  Scenario('with a failing step', () => {
    Given('a passing step', () => {});
    When('a step fails', () => {
      throw new Error('step failed');
    });
    Then('later steps still run', () => {});
  });
});

Feature('With a failing inherited hook', () => {
  beforeEachScenario('seed data', () => {
    throw new Error('seeding failed');
  });

  Scenario('whose steps are not reached', () => {
    Given('a step', () => {});
  });
});
