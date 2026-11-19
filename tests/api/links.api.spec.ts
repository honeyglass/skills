/**
 * Every link of the repository resolves, and no path inside a skill leaves its folder.
 *
 * @example node --test tests/api/links.api.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { markdownFiles, ROOT, skillFolders } from '../utils/files.ts';
import { linkProblems } from '../utils/links.ts';

const read = (path: string) => readFileSync(path, 'utf8');

test('every link and anchor of a Markdown file resolves', () => {
  const skills = skillFolders();
  const outside = markdownFiles().filter(path =>
    skills.every(skill => path.startsWith(`${skill}/`) === false),
  );
  assert.deepEqual(
    outside.flatMap(path => linkProblems(path, read(path))),
    [],
  );
});

test('every link and backticked path of a skill resolves inside its folder', () => {
  const problems = skillFolders().flatMap(skill =>
    markdownFiles()
      .filter(path => path.startsWith(`${skill}/`))
      .flatMap(path => linkProblems(path, read(path), skill)),
  );
  assert.deepEqual(problems, []);
});

test('a missing file, a missing heading and a path out of the skill are each reported', () => {
  const [skill = ''] = skillFolders();
  const sample = [
    '[gone](./gone.md)',
    '[heading](../SKILL.md#no-such-heading)',
    'Read `../../../outside.md` first.',
  ].join('\n\n');
  const problems = linkProblems(join(skill, 'references', 'sample.md'), sample, skill);
  assert.deepEqual(
    problems.map(problem => problem.replace(/^.*: /, '')),
    [
      './gone.md leads to no file',
      '../SKILL.md#no-such-heading names no heading of its file',
      '../../../outside.md leaves the skill folder',
    ],
  );
});

test('a link inside HTML is refused, while HTML without a link reads as it is', () => {
  const path = join(ROOT, 'sample.md');
  assert.deepEqual(linkProblems(path, '<div align="center">\n\n[ok](./README.md)\n\n</div>\n'), []);
  assert.deepEqual(linkProblems(path, '<a href="./gone.md">gone</a>\n'), [
    `${path}: holds a link in HTML, which these tests cannot read`,
  ]);
});
