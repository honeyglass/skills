/**
 * The flow of an agent skill, checked against the format of references/agent-skill.md.
 *
 * flowTables: the tables with the columns From, To and When.
 * rowProblems: the rules every flow table follows, row by row, an example as much as a skill.
 * flowProblems: those rules and the ones that tie a skill's table to its state sections.
 * mentionProblems: a state named in prose or in a reference that the skill does not have.
 *
 * Each rule quotes the line of agent-skill.md it comes from, so a change of the format shows
 * which check to change with it.
 *
 * @example assert.deepEqual(flowProblems(readFileSync(skillPath, 'utf8')), []);
 */
import type { Table } from './markdown.ts';
import { pageOf } from './markdown.ts';

type Row = { from: string; to: string; when: string; line: number };

const HEADER = 'From,To,When';
const STOP = 'STOP';
const DONE = 'done';
const LEFT = 'the state it left';
const NUMBERED = /^(\d+) \S/;
// "Keep a When cell at most 60 characters, with no angle brackets and no double quotes."
const WHEN_LIMIT = 60;
const WHEN_FORBIDDEN = /[<>"]/;
// "A row back to an earlier state, or to the same state, is a back edge: mark it and bound it."
const MARKER = /\(\*\*back edge\*\*, bound (\d+)\)$/;
const OUTCOME = '**Outcome:';

export function flowTables(text: string) {
  return pageOf(text).tables.filter(table => table.rows[0]?.cells.join() === HEADER);
}

/**
 * @param table - a flow table
 * @returns one line per problem, empty when every row follows the format
 */
export function rowProblems(table: Table) {
  const rows = rowsOf(table);
  const froms = new Set(rows.map(row => row.from));
  return rows.flatMap(row => [
    ...[row.from, row.to].filter(notAName).map(name => `${row.line}: ${name} is no state name`),
    ...(row.when.length <= WHEN_LIMIT ? [] : [`${row.line}: the When cell is over ${WHEN_LIMIT}`]),
    ...(WHEN_FORBIDDEN.test(row.when) ? [`${row.line}: the When cell holds < > or "`] : []),
    ...backEdgeProblems(row, rows),
    ...(reachable(row.to, froms) ? [] : [`${row.line}: ${row.to} has no row out of it`]),
  ]);
}

/**
 * @param text - the text of a SKILL.md
 * @returns one line per problem, empty when its flow follows the format
 */
export function flowProblems(text: string) {
  const tables = flowTables(text);
  // "One table with the columns From, To and When stands before the first state."
  const [table] = tables;
  if (tables.length !== 1 || table === undefined) return [`${tables.length} flow tables, not 1`];
  const headings = pageOf(text).headings.filter(heading => isState(heading.text));
  const rows = rowsOf(table);
  return [
    ...rowProblems(table),
    ...(headings[0] !== undefined && headings[0].line < table.line
      ? ['the flow table stands after the first state']
      : []),
    ...namingProblems(
      headings.map(heading => heading.text),
      rows,
    ),
    ...stopProblems(rows),
    ...headings.flatMap(heading =>
      firstLineAfter(text, heading.line).startsWith(OUTCOME)
        ? []
        : [`${heading.line}: ${heading.text} opens with no ${OUTCOME} line`],
    ),
  ];
}

/**
 * @param text - a text that names states, such as a SKILL.md or a reference
 * @param states - the states of the skill, such as '0 Scope'
 * @returns one line per numbered name that is no state, such as '3 Check' where 3 is 'Report'
 */
export function mentionProblems(text: string, states: string[]) {
  return [...text.matchAll(/\b(\d) (?=[A-Z])/g)].flatMap(match => {
    const state = states.find(name => name.startsWith(`${match[1]} `));
    if (state !== undefined && text.startsWith(state, match.index)) return [];
    return [`${text.slice(match.index, match.index + 20)}… names no state`];
  });
}

function rowsOf(table: Table): Row[] {
  return table.rows
    .slice(1)
    .map(({ cells: [from = '', to = '', when = ''], line }) => ({ from, to, when, line }));
}

const isState = (name: string) => NUMBERED.test(name) || name === STOP;
const notAName = (name: string) => (isState(name) || name === DONE || name === LEFT) === false;
const numberOf = (name: string) => Number(NUMBERED.exec(name)?.[1] ?? Number.NaN);
const reachable = (to: string, froms: Set<string>) =>
  froms.has(to) || to === STOP || to === DONE || to === LEFT;

// "Every back edge ... with a STOP when the bound is reached"; STOP itself bounds into done.
function backEdgeProblems(row: Row, rows: Row[]) {
  const back = row.to === LEFT || numberOf(row.to) <= numberOf(row.from);
  const marked = MARKER.test(row.when);
  if (back && marked === false) return [`${row.line}: a back edge without its marker and bound`];
  if (back === false) return [];
  const exit = row.from === STOP ? DONE : STOP;
  if (rows.some(other => other.from === row.from && other.to === exit)) return [];
  return [`${row.line}: ${row.from} has a back edge but no row to ${exit}`];
}

// "a state has one name in the table, in the text and in every question"; every state is reached.
function namingProblems(headings: string[], rows: Row[]) {
  const named = new Set(rows.flatMap(row => [row.from, row.to]).filter(isState));
  const numbers = headings.filter(name => name !== STOP).map(numberOf);
  const reached = new Set(rows.map(row => row.to));
  return [
    ...[...named].filter(name => headings.includes(name) === false).map(n => `${n} has no section`),
    ...headings.filter(name => named.has(name) === false).map(n => `${n} is not in the table`),
    ...(new Set(numbers).size === numbers.length ? [] : ['two states share a number']),
    ...headings
      .slice(1)
      .filter(name => reached.has(name) === false)
      .map(n => `${n} is never reached`),
  ];
}

// "STOP has rows out of it: one back to the state it left (marked and bounded), and one to done."
function stopProblems(rows: Row[]) {
  const out = rows.filter(row => row.from === STOP);
  const back = out.filter(row => row.to === LEFT && MARKER.test(row.when));
  return [
    ...(back.length === 1 ? [] : [`STOP has ${back.length} marked rows to ${LEFT}, not 1`]),
    ...(out.some(row => row.to === DONE) ? [] : [`STOP has no row to ${DONE}`]),
  ];
}

function firstLineAfter(text: string, line: number) {
  return (
    text
      .split('\n')
      .slice(line)
      .find(next => next.trim() !== '') ?? ''
  );
}
