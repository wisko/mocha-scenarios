Feature('Exclusive blocks', () => {
  Scenario('not selected', () => {
    Given('a step', () => {});
  });

  Scenario.only('selected (with regex chars like * and ?)', () => {
    Given('a step', () => {});
    Then('another step', () => {});
  });

  Scenario.only('also selected [0-9]+', () => {
    Given.only('only this step', () => {});
    Then('not this one', () => {});
  });
});
