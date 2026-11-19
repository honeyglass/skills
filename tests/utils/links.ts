/**
 * The links of a Markdown file that lead nowhere, or out of the skill folder that holds them.
 *
 * linkProblems: one line per link, anchor or path that does not resolve.
 *
 * An install copies one skill folder and nothing beside it, so inside a skill a link or a
 * backticked './' or '../' path must stay inside that folder, or it breaks once installed.
 *
 * @example assert.deepEqual(linkProblems(path, readFileSync(path, 'utf8'), skill), []);
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { pageOf } from './markdown.ts';

// A scheme such as 'https:' or 'mailto:' leads off the repository, which these tests do not reach.
const EXTERNAL = /^[a-z][a-z0-9+.-]*:/i;
const RELATIVE_PATH = /^\.\.?\//;

/**
 * @param path - the absolute path of the file
 * @param text - its text
 * @param skill - the skill folder that holds the file, if one does
 * @returns one line per problem, empty when every link resolves
 */
export function linkProblems(path: string, text: string, skill?: string) {
  const page = pageOf(text);
  if (page.html) return [`${path}: holds HTML, whose links these tests cannot read`];
  const links = page.links.filter(link => EXTERNAL.test(link.destination) === false);
  // A code span outside a skill is often a command, such as './deploy.sh <env>', not a path.
  const codes = skill === undefined ? [] : page.codes;
  const paths = codes
    .filter(code => RELATIVE_PATH.test(code.text))
    .map(code => ({ destination: code.text, line: code.line }));
  return [...links, ...paths].flatMap(({ destination, line }) => {
    const [file = '', anchor] = destination.split('#');
    const target = file === '' ? path : join(dirname(path), file);
    const where = `${path}:${line}: ${destination}`;
    if (skill !== undefined && relative(skill, target).startsWith('..'))
      return [`${where} leaves the skill folder`];
    if (existsSync(target) === false) return [`${where} leads to no file`];
    if (anchor === undefined || target.endsWith('.md') === false) return [];
    if (pageOf(readFileSync(target, 'utf8')).slugs.has(anchor)) return [];
    return [`${where} names no heading of its file`];
  });
}
