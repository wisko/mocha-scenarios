import assert from 'node:assert/strict';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { interfaces, runFeature } from './helpers/run-feature.js';

const featuresDir = fileURLToPath(new URL('./features/', import.meta.url));
const names = (await readdir(featuresDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

// UPDATE_FEATURES=1 rewrites each expected.txt from the CLI run; the API run still has to match it.
const update = Boolean(process.env.UPDATE_FEATURES);

describe('features', () => {
  for (const name of names) {
    const dir = path.join(featuresDir, name);
    const expectedFile = path.join(dir, 'expected.txt');

    describe(name, () => {
      for (const via of interfaces) {
        it(`via ${via}`, async function () {
          this.timeout(10000);
          const actual = await runFeature(dir, via);
          if (update && via === 'cli') {
            await writeFile(expectedFile, actual);
          }
          assert.equal(actual, await readFile(expectedFile, 'utf8'));
        });
      }
    });
  }
});
