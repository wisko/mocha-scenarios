Feature('Login', () => {
  beforeEachScenario(() => console.log('beforeEachScenario (Feature)'));

  describe('with a password', () => {
    beforeEachScenario(() => console.log('beforeEachScenario (describe)'));

    context('for a registered user', () => {
      Scenario('valid credentials', () => {
        Given('a registered user', () => {});
        Then('they see their profile page', () => {});
      });
    });

    it('allows plain it inside the group', () => {});
  });

  Scenario('with groups inside', () => {
    describe('first attempt', () => {
      Given('a step grouped by describe', () => {});
    });
    context('second attempt', () => {
      Given('a step grouped by context', () => {});
    });
  });

  describe.skip('with a one-time code', () => {
    Scenario('is pending', () => {
      Given('a step', () => {});
    });
  });
});
