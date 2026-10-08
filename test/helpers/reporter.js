import * as mocha from 'mocha';

const Mocha = mocha.default ?? mocha;
const { EVENT_RUN_END, EVENT_SUITE_BEGIN, EVENT_SUITE_END, EVENT_TEST_FAIL, EVENT_TEST_PASS, EVENT_TEST_PENDING } =
  Mocha.Runner.constants;

/**
 * Prints the suite tree without colors, durations or stack traces, so a run's transcript can be
 * compared verbatim. Fixture output written to stdout interleaves with it in event order.
 */
class TranscriptReporter extends Mocha.reporters.Base {
  constructor(runner, options) {
    super(runner, options);
    let depth = 0;
    const line = (text) => console.log(`${'  '.repeat(depth)}${text}`);

    runner.on(EVENT_SUITE_BEGIN, (suite) => {
      if (suite.root) {
        return;
      }
      line(suite.title);
      depth += 1;
    });
    runner.on(EVENT_SUITE_END, (suite) => {
      if (!suite.root) {
        depth -= 1;
      }
    });
    runner.on(EVENT_TEST_PASS, (test) => line(`✔ ${test.title}`));
    runner.on(EVENT_TEST_PENDING, (test) => line(`- ${test.title}`));
    runner.on(EVENT_TEST_FAIL, (test, err) => {
      line(`✖ ${test.title}`);
      for (const text of String(err.message).split('\n')) {
        line(`  ${text}`);
      }
    });
    runner.once(EVENT_RUN_END, () => {
      const { passes, pending, failures } = this.stats;
      console.log(`\n${passes} passing, ${pending} pending, ${failures} failing`);
    });
  }
}

export default TranscriptReporter;
// Mocha loads `--reporter <path>` with require(); this makes it return the class itself.
export { TranscriptReporter as 'module.exports' };
