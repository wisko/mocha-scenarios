beforeEachScenario(() => console.log('beforeEachScenario'));

setTimeout(() => {
  Feature('Delayed root suite', () => {
    Scenario('declared asynchronously', () => {
      Given('a step', () => {});
    });
  });
  run();
}, 10);
