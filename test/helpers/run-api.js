// Child-process entry for running a feature through mocha's programmatic API
import * as mocha from 'mocha';
import 'mocha-scenarios';
import TranscriptReporter from './reporter.js';

const Mocha = mocha.default ?? mocha;
const { files, delay } = JSON.parse(process.argv[2]);

const runner = new Mocha({ ui: 'mocha-scenarios', reporter: TranscriptReporter, delay, color: false });
for (const file of files) {
  runner.addFile(file);
}
await runner.loadFilesAsync();
runner.run((failures) => {
  // Same convention as the CLI: the exit code is the number of failures.
  process.exitCode = Math.min(failures, 255);
});
