/**
 * The evals of every skill are sound and name only files that exist.
 *
 * @example node --test tests/api/evals.api.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { test } from 'node:test';
import { ROOT, skillFolders } from '../utils/files.ts';
import { evalProblems } from '../utils/evals.ts';

test('every skill has evals beside it, sound and naming only files that exist', () => {
  const problems = skillFolders().flatMap(skill => {
    const path = relative(ROOT, skill);
    const text = readFileSync(join(ROOT, 'evals', path, 'evals.json'), 'utf8');
    const name = path.replace('/', '-');
    return evalProblems(JSON.parse(text), name, ROOT).map(problem => `${path}: ${problem}`);
  });
  assert.deepEqual(problems, []);
});

test('a wrong skill name, a shared id and a path that is gone are each reported', () => {
  const data = {
    skill_name: 'adx-old',
    evals: [
      { id: 1, prompt: 'Review evals/adx/cli/files/gone', expected_output: 'a table', files: [] },
      { id: 1, prompt: 'Review it', expected_output: 'a table', files: ['evals/adx/cli/x.md'] },
    ],
  };
  assert.deepEqual(evalProblems(data, 'adx-cli', ROOT), [
    'skill_name is adx-old, not adx-cli',
    'two evals share an id',
    'eval 1 names evals/adx/cli/files/gone, which does not exist',
    'eval 2 names evals/adx/cli/x.md, which does not exist',
  ]);
});
