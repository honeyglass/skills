/**
 * Every skill folder holds only what an install needs, under a name a loader reads as written.
 *
 * @example node --test tests/api/skill.api.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { test } from 'node:test';
import { filesIn, ROOT, skillFolders } from '../utils/files.ts';
import { folderProblems, frontmatterProblems } from '../utils/skill.ts';

const skillText = (skill: string) => readFileSync(join(skill, 'SKILL.md'), 'utf8');

test('the repository holds at least one skill, so the other checks never pass on nothing', () => {
  assert.notEqual(skillFolders().length, 0);
});

test('each skill folder holds SKILL.md, README.md and the references SKILL.md names', () => {
  const problems = skillFolders().flatMap(skill =>
    folderProblems(filesIn(skill), skillText(skill)).map(problem => `${skill}: ${problem}`),
  );
  assert.deepEqual(problems, []);
});

test('each frontmatter holds the name of its path and a description a loader reads whole', () => {
  const problems = skillFolders().flatMap(skill => {
    const name = relative(ROOT, skill).replace('/', '-');
    return frontmatterProblems(skillText(skill), name).map(problem => `${skill}: ${problem}`);
  });
  assert.deepEqual(problems, []);
});

test('an extra file, an unnamed reference and a broken frontmatter are each reported', () => {
  const files = ['README.md', 'SKILL.md', 'evals/evals.json', 'references/rules.md'];
  assert.deepEqual(folderProblems(files, 'no reference named'), [
    'evals/evals.json is no SKILL.md, README.md or references/*.md',
    'references/rules.md is named nowhere in SKILL.md',
  ]);
  const front = '---\nname: adx-CLI\ndescription: Builds <tools>: fast\n---\n';
  assert.deepEqual(frontmatterProblems(front, 'adx-cli'), [
    "the name adx-CLI is not adx-cli, from the folder's path",
    'the name adx-CLI is not 1 to 64 of a-z, 0-9 and -',
    'the description holds < or >',
    "the description holds ': ', which YAML reads apart",
  ]);
});
