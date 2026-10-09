/**
 * Prints the `CHANGELOG.md` section of one version, without its heading, and exits with 1 when the
 * section is missing or empty. The version is the first argument, or the `package.json` version.
 *
 * The publish workflow uses it as a check before publishing and as the GitHub Release text.
 */
import { readFile } from 'node:fs/promises';

const rootDir = new URL('../', import.meta.url);
const version = process.argv[2] ?? JSON.parse(await readFile(new URL('package.json', rootDir), 'utf8')).version;
const changelog = await readFile(new URL('CHANGELOG.md', rootDir), 'utf8');

// Keep a Changelog headings are `## [X.Y.Z] - YYYY-MM-DD`; the section runs to the next `## ` heading.
const heading = `## [${version}]`;
const lines = changelog.split('\n');
const start = lines.findIndex((line) => line.startsWith(heading));
const end = start === -1 ? -1 : lines.findIndex((line, i) => i > start && line.startsWith('## '));
const section = start === -1 ? [] : lines.slice(start + 1, end === -1 ? lines.length : end);
const text = section.join('\n').trim();

if (text === '') {
  console.error(`CHANGELOG.md has no entries under "${heading}"`);
  process.exit(1);
}
console.log(text);
