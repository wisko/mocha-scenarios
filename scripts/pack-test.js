/**
 * Packs the package, installs the tarball together with mocha into a throwaway project and runs a
 * spec there. This is the only test that goes through `files`, the `exports` map and mocha's
 * `require(id)` lookup of `--ui mocha-scenarios` from a real node_modules.
 *
 * Run by `npm run test:packaging`, which is part of `npm test`.
 */
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const rootDir = fileURLToPath(new URL('../', import.meta.url));
const run = promisify(execFile);
// Under `npm test` the running npm is reused; otherwise the one on PATH.
const npm = (args, cwd) =>
  process.env.npm_execpath
    ? run(process.execPath, [process.env.npm_execpath, ...args], { cwd })
    : run('npm', args, { cwd });

const spec = `
import assert from 'node:assert/strict';
import ui from 'mocha-scenarios';
import globals from 'mocha-scenarios/globals';

Feature('Consuming the published package', () => {
  beforeEachScenario(() => {});

  Scenario('as a dependency', () => {
    Given('the package loaded as the mocha UI', () => assert.equal(typeof ui, 'function'));
    Then('its globals export lists Feature', () => assert.equal(globals.Feature, 'readonly'));
  });
});
`;

const typedSpec = `
Feature('Typed consumer', () => {
  beforeEachScenario(function () {
    this.timeout(1000);
  });
  Scenario('compiles', () => {
    Given('a step', async function () {
      this.timeout(1000);
    });
    Then.skip('a skipped step', (done) => done());
  });
});
`;

const projectDir = await mkdtemp(path.join(os.tmpdir(), 'mocha-scenarios-consumer-'));
try {
  const { stdout } = await npm(['pack', '--json', '--pack-destination', projectDir], rootDir);
  const [tarball] = JSON.parse(stdout);
  const packed = tarball.files.map((file) => file.path).sort();
  assert.deepEqual(packed, [
    'LICENSE',
    'README.md',
    'dist/globals.d.ts',
    'dist/globals.js',
    'dist/index.d.ts',
    'dist/index.js',
    'package.json',
  ]);
  console.log(`packed ${tarball.filename}: ${packed.join(', ')}`);

  const version = async (name) =>
    JSON.parse(await readFile(path.join(rootDir, 'node_modules', name, 'package.json'), 'utf8')).version;
  await writeFile(
    path.join(projectDir, 'package.json'),
    JSON.stringify({ name: 'consumer', private: true, type: 'module' }),
  );
  await writeFile(path.join(projectDir, 'spec.js'), spec);
  await writeFile(path.join(projectDir, 'typed.ts'), typedSpec);
  await writeFile(
    path.join(projectDir, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        noEmit: true,
        module: 'nodenext',
        target: 'es2023',
        types: ['mocha', 'mocha-scenarios'],
      },
      files: ['typed.ts'],
    }),
  );
  await npm(
    [
      'install',
      '--no-audit',
      '--no-fund',
      '--no-package-lock',
      '--prefer-offline',
      path.join(projectDir, tarball.filename),
      `mocha@${await version('mocha')}`,
      `@types/mocha@${await version('@types/mocha')}`,
    ],
    projectDir,
  );
  console.log(`installed into ${projectDir}`);

  const mochaDir = path.join(projectDir, 'node_modules/mocha');
  const mochaBin = path.join(
    mochaDir,
    JSON.parse(await readFile(path.join(mochaDir, 'package.json'), 'utf8')).bin.mocha,
  );
  const expectRun = async (label, args) => {
    const { stdout } = await run(process.execPath, [mochaBin, '--no-color', ...args, 'spec.js'], { cwd: projectDir });
    assert.match(stdout, /Feature: Consuming the published package/);
    assert.match(stdout, /Given the package loaded as the mocha UI/);
    assert.match(stdout, /2 passing/);
    console.log(`${label}: ok`);
  };
  await expectRun('mocha --ui mocha-scenarios', ['--no-config', '--ui', 'mocha-scenarios']);
  await writeFile(path.join(projectDir, '.mocharc.json'), JSON.stringify({ ui: 'mocha-scenarios' }));
  await expectRun('mocha with "ui" in .mocharc.json', []);

  await run(process.execPath, [path.join(rootDir, 'node_modules/typescript/bin/tsc'), '-p', 'tsconfig.json'], {
    cwd: projectDir,
  });
  console.log('tsc with types: ["mocha-scenarios"]: ok');
} finally {
  await rm(projectDir, { recursive: true, force: true });
}
