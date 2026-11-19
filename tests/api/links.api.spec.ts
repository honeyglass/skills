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
import { pageOf } from '../utils/markdown.ts';

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

test('a link inside HTML resolves like any link, and one without quotes is refused', () => {
  const path = join(ROOT, 'sample.md');
  const icon = '<picture><source srcset="./LICENSE 2x"><img src="./README.md" alt=""></picture>\n';
  assert.deepEqual(linkProblems(path, '<div align="center">\n\n[ok](./README.md)\n\n</div>\n'), []);
  assert.deepEqual(linkProblems(path, icon), []);
  assert.deepEqual(
    linkProblems(path, '<a href="./gone.md">gone</a>\n').map(problem =>
      problem.replace(/^.*: /, ''),
    ),
    ['./gone.md leads to no file'],
  );
  assert.deepEqual(linkProblems(path, '<img src=README.md alt=x>\n'), [
    `${path}: holds a link in HTML without quotes, which these tests cannot read`,
  ]);
});

test('a heading that opens with an icon gets the anchor GitHub gives it, with a leading dash', () => {
  const { slugs } = pageOf('## <img src="./icon.svg" alt=""> Quick start\n');
  assert.deepEqual([...slugs], ['-quick-start']);
});
