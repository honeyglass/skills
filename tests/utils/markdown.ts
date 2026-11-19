/**
 * What a Markdown file holds, read by micromark, the reference parser of CommonMark, with GFM.
 *
 * Page, pageOf: the headings, links, code spans and tables of a file, and its anchors.
 * frontmatterOf: the lines between the two '---' fences at the top of a file.
 *
 * The only file that imports micromark. A link in an HTML attribute is invisible to it, so the
 * page reads href, src and srcset itself when their value stands in quotes; a value without quotes
 * has no end this file can trust, so the page tells of it and the caller refuses the page.
 *
 * @example const { links, tables } = pageOf(readFileSync(path, 'utf8'));
 */
import { parse, postprocess, preprocess } from 'micromark';
import { gfm } from 'micromark-extension-gfm';

/** A table: its rows in order, the header first; each cell is its raw text, trimmed. */
export type Table = { line: number; rows: { cells: string[]; line: number }[] };

/** Lines count from 1, as an editor shows them. */
export type Page = {
  headings: { depth: number; text: string; line: number }[];
  links: { destination: string; line: number }[];
  codes: { text: string; line: number }[];
  tables: Table[];
  slugs: Set<string>;
  unquotedHtmlLinks: boolean;
};

type Event = ReturnType<typeof postprocess>[number];
type Token = Event[1];
type Block = { token: Token; children: Token[] };
type HtmlLink = { destination: string | undefined; line: number };

const DESTINATIONS = new Set(['resourceDestinationString', 'definitionDestinationString']);
const HTML = new Set(['htmlFlow', 'htmlText']);
// The attributes of HTML that point to a file or a page, with a value in quotes or without.
const HTML_LINK = /\b(href|src|srcset)\s*=\s*(?:"([^"]*)"|'([^']*)'|(?=[^\s"'>]))/gi;
const CELLS = new Set(['tableHeader', 'tableData']);
const LINE_ENDINGS = new Set(['lineEnding', 'lineEndingBlank']);
const FENCE = '---';

/**
 * @param file - the whole text of a Markdown file
 * @returns what the file holds, read without its frontmatter
 */
export function pageOf(file: string): Page {
  const text = withoutFrontmatter(file);
  const events = eventsOf(text);
  const tokens = events.flatMap(([kind, token]) => (kind === 'enter' ? [token] : []));
  const headings = blocksOf(events).flatMap(block => headingOf(block, text));
  const html = tokens
    .filter(token => HTML.has(token.type))
    .flatMap(token => htmlLinksOf(text, token));
  return {
    headings,
    links: [
      ...tokens
        .filter(token => DESTINATIONS.has(token.type))
        .map(token => ({ destination: sliceOf(text, token), line: token.start.line })),
      ...html.flatMap(({ destination, line }) =>
        destination === undefined ? [] : [{ destination, line }],
      ),
    ].sort((a, b) => a.line - b.line),
    codes: tokens
      .filter(token => token.type === 'codeText')
      .map(token => ({
        text: sliceOf(text, token).replace(/^`+|`+$/g, ''),
        line: token.start.line,
      })),
    tables: tablesOf(events, text),
    slugs: slugsOf(headings.map(heading => heading.text)),
    unquotedHtmlLinks: html.some(link => link.destination === undefined),
  };
}

// Each URL of an attribute; a srcset lists one or more, each before its optional size, such as '2x'.
// A value without quotes gives an undefined destination.
function htmlLinksOf(text: string, token: Token): HtmlLink[] {
  const html = sliceOf(text, token);
  return [...html.matchAll(HTML_LINK)].flatMap<HtmlLink>(match => {
    const line = token.start.line + (html.slice(0, match.index).match(/\n/g)?.length ?? 0);
    const value = match[2] ?? match[3];
    if (value === undefined) return [{ destination: undefined, line }];
    const urls = match[1]?.toLowerCase() === 'srcset' ? value.split(',') : [value];
    return urls.map(url => ({ destination: url.trim().split(/\s+/)[0] ?? '', line }));
  });
}

/**
 * @param text - the whole text of a Markdown file
 * @returns the lines between the fences, or undefined when the file opens without one
 */
export function frontmatterOf(text: string) {
  const lines = text.split('\n');
  const end = lines.indexOf(FENCE, 1);
  if (lines[0] !== FENCE || end === -1) return undefined;
  return lines.slice(1, end);
}

// micromark reads '---' after a line as the underline of a heading, so the frontmatter turns into
// spaces first; every offset and line number of the rest stays as it is.
function withoutFrontmatter(text: string) {
  const front = frontmatterOf(text);
  if (front === undefined) return text;
  const end = front.join('\n').length + 2 * (FENCE.length + 1);
  return text.slice(0, end).replace(/[^\n]/g, ' ') + text.slice(end);
}

function eventsOf(text: string) {
  return postprocess(
    parse({ extensions: [gfm()] })
      .document()
      .write(preprocess()(text, undefined, true)),
  );
}

// The top-level blocks of the document, each with every token inside it.
function blocksOf(events: Event[]) {
  const blocks: Block[] = [];
  let depth = 0;
  for (const [kind, token] of events) {
    if (kind === 'exit') depth--;
    if (kind === 'exit') continue;
    if (depth === 0) blocks.push({ token, children: [] });
    if (depth > 0) blocks.at(-1)?.children.push(token);
    depth++;
  }
  return blocks.filter(block => LINE_ENDINGS.has(block.token.type) === false);
}

// '## x' has depth 2; a heading underlined with '=' has depth 1, one underlined with '-' depth 2.
function headingOf(block: Block, text: string) {
  const atx = block.children.find(token => token.type === 'atxHeadingSequence');
  const underline = block.children.find(token => token.type === 'setextHeadingLineSequence');
  const line = block.token.start.line;
  const words = block.children
    .filter(token => token.type === 'data' || token.type === 'codeTextData')
    .map(token => sliceOf(text, token))
    .join('')
    // An icon before the words leaves their leading space, and GitHub's anchor keeps it as '-'.
    .trimEnd();
  if (block.token.type === 'atxHeading' && atx !== undefined)
    return [{ depth: atx.end.offset - atx.start.offset, text: words, line }];
  if (block.token.type === 'setextHeading' && underline !== undefined)
    return [{ depth: text[underline.start.offset] === '=' ? 1 : 2, text: words, line }];
  return [];
}

// micromark's own type map lacks the table tokens of GFM, so their type is read as a string.
function tablesOf(events: Event[], text: string) {
  const tables: Table[] = [];
  for (const [kind, token] of events) {
    const type: string = token.type;
    if (kind === 'exit') continue;
    if (type === 'table') tables.push({ line: token.start.line, rows: [] });
    if (type === 'tableRow') tables.at(-1)?.rows.push({ cells: [], line: token.start.line });
    if (CELLS.has(type)) tables.at(-1)?.rows.at(-1)?.cells.push(cellOf(text, token));
  }
  return tables;
}

// A cell's raw text keeps its leading '|' and its spaces, so both go.
const cellOf = (text: string, token: Token) =>
  sliceOf(text, token)
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .trim();

/**
 * GitHub's anchor of each heading, which GitHub documents only by its behavior.
 *
 * Lower case, every character but letters, marks, digits, '_', '-' and spaces dropped, spaces
 * turned into '-', and a heading seen before gets '-1', '-2' and so on.
 *
 * @param texts - the text of every heading, in order
 * @returns every anchor a link to this page may name
 */
function slugsOf(texts: string[]) {
  const slugs = new Set<string>();
  for (const text of texts) {
    const base = text
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, '')
      .replace(/ /g, '-');
    let slug = base;
    for (let count = 1; slugs.has(slug); count++) slug = `${base}-${count}`;
    slugs.add(slug);
  }
  return slugs;
}

const sliceOf = (text: string, token: Token) => text.slice(token.start.offset, token.end.offset);
