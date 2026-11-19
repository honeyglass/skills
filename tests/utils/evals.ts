/**
 * The evals of a skill, as the skill-creator's runner reads them from evals/<family>/<kind>/.
 *
 * evalProblems: an eval the runner would reject, or one that points to a file that is gone.
 *
 * The evals run by hand with a model, so a broken path or id shows only on that run; this check
 * finds it in CI, such as a prompt that still names the old folder after a move.
 *
 * @example assert.deepEqual(evalProblems(JSON.parse(text), 'adx-cli', ROOT), []);
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

// A path in a prompt or an expected output, such as 'evals/adx/cli/files/notes-cli'.
const EVAL_PATH = /\bevals\/[\w./-]*\w/g;

/**
 * @param data - the parsed evals.json
 * @param skill - the name of the skill the evals belong to, such as 'adx-cli'
 * @param root - the repository root, which every path is relative to
 * @returns one line per problem, empty when every eval is sound
 */
export function evalProblems(data: unknown, skill: string, root: string) {
  if (isRecord(data) === false || Array.isArray(data.evals) === false)
    return ['evals.json is no object with an evals list'];
  const evals: unknown[] = data.evals;
  const ids = evals.map(item => (isRecord(item) ? item.id : undefined));
  return [
    ...(data.skill_name === skill
      ? []
      : [`skill_name is ${String(data.skill_name)}, not ${skill}`]),
    ...(evals.length === 0 ? ['the evals list is empty'] : []),
    ...(new Set(ids).size === ids.length ? [] : ['two evals share an id']),
    ...evals.flatMap((item, index) => itemProblems(item, index, root)),
  ];
}

function itemProblems(item: unknown, index: number, root: string) {
  const where = `eval ${index + 1}`;
  if (isRecord(item) === false) return [`${where} is no object`];
  const { id, prompt, expected_output: expected, files } = item;
  const texts = [prompt, expected].filter(text => typeof text === 'string');
  const paths = Array.isArray(files) ? files : [];
  const named = texts.flatMap(text => text.match(EVAL_PATH) ?? []);
  return [
    ...(Number.isInteger(id) ? [] : [`${where} has no whole number id`]),
    ...(texts.length === 2 && texts.every(text => text !== '')
      ? []
      : [`${where} lacks a prompt or an expected_output`]),
    ...(Array.isArray(files) ? [] : [`${where} has no files list`]),
    ...[...paths, ...named]
      .filter(path => typeof path !== 'string' || existsSync(join(root, path)) === false)
      .map(path => `${where} names ${String(path)}, which does not exist`),
  ];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && Array.isArray(value) === false;
