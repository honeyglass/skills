/**
 * What a skill folder must hold so a skills loader reads it and an install copies only the skill.
 *
 * frontmatterProblems: a name or description that a loader would misread or refuse.
 * folderProblems: a file an install would copy without need, or a reference SKILL.md never names.
 *
 * @example assert.deepEqual(frontmatterProblems(readFileSync(path, 'utf8'), 'adx-cli'), []);
 */
import { frontmatterOf } from './markdown.ts';

const NAME = /^[a-z0-9-]{1,64}$/;
const DESCRIPTION_LIMIT = 1024;
const FIELD = /^(name|description): (.+)$/;
// A plain YAML scalar ends its value at ': ' and starts a comment at ' #'.
const YAML_BREAKERS = [': ', ' #'];
const REFERENCE = /^references\/[^/]+\.md$/;
const FIXED = new Set(['SKILL.md', 'README.md']);

/**
 * @param text - the text of a SKILL.md
 * @param name - the name the folder's path gives, such as 'adx-cli' for 'adx/cli'
 * @returns one line per problem, empty when the frontmatter is sound
 */
export function frontmatterProblems(text: string, name: string) {
  const lines = frontmatterOf(text);
  if (lines === undefined) return ['no frontmatter between two --- lines'];
  const fields = lines.map(line => FIELD.exec(line));
  const keys = fields.map(field => field?.[1]);
  if (keys.join() !== 'name,description')
    return ['the frontmatter is not exactly a name line and a description line'];
  const [given = '', description = ''] = fields.map(field => field?.[2] ?? '');
  return [
    ...(given === name ? [] : [`the name ${given} is not ${name}, from the folder's path`]),
    ...(NAME.test(given) ? [] : [`the name ${given} is not 1 to 64 of a-z, 0-9 and -`]),
    ...(description.length <= DESCRIPTION_LIMIT
      ? []
      : [`the description has ${description.length} characters, over ${DESCRIPTION_LIMIT}`]),
    ...(/[<>]/.test(description) ? ['the description holds < or >'] : []),
    ...YAML_BREAKERS.filter(breaker => description.includes(breaker)).map(
      breaker => `the description holds '${breaker}', which YAML reads apart`,
    ),
  ];
}

/**
 * @param files - every file of the skill folder, relative to it
 * @param skill - the text of its SKILL.md
 * @returns one line per problem, empty when the folder holds only what an install needs
 */
export function folderProblems(files: string[], skill: string) {
  const extra = files.filter(file => FIXED.has(file) === false && REFERENCE.test(file) === false);
  const missing = [...FIXED].filter(file => files.includes(file) === false);
  const unnamed = files.filter(file => REFERENCE.test(file) && skill.includes(file) === false);
  return [
    ...extra.map(file => `${file} is no SKILL.md, README.md or references/*.md`),
    ...missing.map(file => `${file} is missing`),
    ...unnamed.map(file => `${file} is named nowhere in SKILL.md`),
  ];
}
