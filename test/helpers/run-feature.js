import { execFile } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(import.meta.url);
const mochaPackage = require.resolve('mocha/package.json');
const mochaBin = path.join(path.dirname(mochaPackage), require(mochaPackage).bin.mocha);
const ui = path.join(rootDir, 'dist/index.js');
const reporter = path.join(rootDir, 'test/helpers/reporter.js');
const runApi = path.join(rootDir, 'test/helpers/run-api.js');

export const interfaces = ['cli', 'api'];

/**
 * Runs the spec files of a feature directory in a child process, through the mocha CLI or the
 * programmatic API, and returns a normalized transcript: the reporter output, then the exit code,
 * then every error reported on stderr, reduced to `<Name>: <message>`.
 */
export async function runFeature(dir, via) {
  const options = await readOptions(dir);
  const files = (await readdir(dir))
    .filter((name) => name.endsWith('.feature.js'))
    .sort()
    .map((name) => path.join(dir, name));
  const args =
    via === 'cli'
      ? [mochaBin, '--no-config', '--no-package', '--no-color', '--require', ui, '--ui', 'mocha-scenarios']
          .concat('--reporter', reporter)
          .concat(options.delay ? ['--delay'] : [])
          .concat(files)
      : [runApi, JSON.stringify({ files, delay: Boolean(options.delay) })];
  const { stdout, stderr, code } = await run(process.execPath, args);
  return normalize(stdout, stderr, code);
}

async function readOptions(dir) {
  try {
    return JSON.parse(await readFile(path.join(dir, 'options.json'), 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

function run(file, args) {
  return new Promise((resolve, reject) => {
    execFile(
      file,
      args,
      { cwd: rootDir, env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' } },
      (error, stdout, stderr) => {
        if (error && typeof error.code !== 'number') {
          reject(error);
        } else {
          resolve({ stdout, stderr, code: error ? error.code : 0 });
        }
      },
    );
  });
}

// The CLI prefixes a load error with "Exception during run:" while the API surfaces it as an uncaught
// exception with a source excerpt and stack; only the `<Name>: <message>` part is common to both.
function normalize(stdout, stderr, code) {
  const errors = stderr
    .split('\n')
    .map((line) => /^.*?\b(\w*Error: .*)$/.exec(line)?.[1])
    .filter(Boolean)
    .map((line) => line.replaceAll(rootDir, '<root>/'));
  return [stdout.trimEnd(), `exit code: ${code}`, ...errors].join('\n') + '\n';
}
