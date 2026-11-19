#!/usr/bin/env node
/**
 * A task list CLI for an eval, built to meet the 15 Agent DX rules.
 *
 * It reads and writes only inside its data folder ('--dir', else TASKS_DIR, else the working
 * directory): tasks.json, and the Markdown file that export names. AGENT.md is its manual for agents.
 * Every answer is one object: { ok, result, next } or { ok: false, kind, state, issues }.
 * Exit code 2 shows when a built-in breaks before the tool starts, as in the example.
 *
 * @example node --import 'data:text/javascript,Object.fromEntries=()=>{throw new TypeError("x")}' tasks.mjs schema
 */
import fs from 'node:fs';
import path from 'node:path';

const MAX_INPUT = 64 * 1024; // bytes of '--json', from its value or from stdin
const MAX_STORE = 1024 * 1024; // bytes of tasks.json
const MAX_TASKS = 100;
const STORE = 'tasks.json';
const TASK_KEYS = ['id', 'title', 'priority', 'due', 'status'];
const OUTPUTS = ['json', 'text'];
const SWITCHES = ['--dry-run', '--replace'];
const ASK = ['DATA_INVALID', 'NOT_A_FILE', 'STORE_TOO_LARGE', 'TOO_MANY_TASKS']; // only the person can solve these
const RETRY = ['EBUSY', 'EAGAIN']; // a later call may pass; any other system error goes to the person

/** Every input field, its rule and its hint; the checks and the schema command read this table. */
const FIELDS = {
  id: { pattern: /^t[0-9]{1,6}$/, about: 'a task id such as t1' },
  title: {
    pattern: /^[^\p{Cc}\p{Cf}\p{Zl}\p{Zp}]{1,120}$/u,
    about: 'one line, 1 to 120 characters',
  },
  priority: { values: ['low', 'normal', 'high'] },
  due: { pattern: /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, about: 'a date such as 2026-12-31' },
  status: { values: ['open', 'done'] },
  file: { pattern: /^[a-z0-9][a-z0-9_-]{0,40}\.md$/, about: 'a file name such as tasks.md' },
  command: { values: ['add', 'list', 'done', 'export', 'schema'] },
};

/** Every command; the parser, the schema command and the option lists read this table. */
const COMMANDS = {
  add: {
    does: 'adds a task',
    fields: ['title', 'priority', 'due'],
    required: ['title'],
    writes: true,
  },
  list: { does: 'lists the tasks', fields: ['status'], required: [] },
  done: { does: 'marks an open task done', fields: ['id'], required: ['id'], writes: true },
  export: {
    does: 'writes the tasks as Markdown',
    fields: ['file'],
    required: ['file'],
    writes: true,
  },
  schema: { does: 'prints every command and its input', fields: ['command'], required: [] },
};

/** Every refusal's message and hint by code; a system error code without a row uses SYSTEM. */
const TEXTS = {
  SWITCH_WITH_VALUE: n => [`${n} takes no value`, `Write ${n} alone`],
  OPTION_TWICE: n => [`${n} is given twice`, `Give ${n} once`],
  EXTRA_WORD: w => [
    `${show(w)} is not expected`,
    'Remove it, or give it as the value of an option',
  ],
  UNKNOWN_COMMAND: c => [`${show(c)} is not a command`, 'Use a command the schema lists'],
  UNKNOWN_OPTION: o => [
    `${show(o)} is not an option of this command`,
    'Use an option the schema lists',
  ],
  VALUE_MISSING: o => [
    `${o} needs a value`,
    `Add ${FIELDS[o.slice(2)]?.about ?? (o === '--dir' ? 'an existing folder' : 'a JSON object, or -')}`,
  ],
  TWO_LISTS: () => ['Two options without a value', 'Leave one option empty per call'],
  DIR_EMPTY: () => ['TASKS_DIR is empty', 'Set TASKS_DIR to an existing folder, or unset it'],
  DIR_NOT_FOUND: d => [`${show(d)} does not exist`, 'Name an existing folder'],
  DIR_NOT_FOLDER: d => [`${show(d)} is not a folder`, 'Name a folder, not a file'],
  TOO_LARGE: n => [`More than ${n} bytes`, 'Give a smaller input'],
  STORE_TOO_LARGE: n => [
    `${STORE} holds more than ${n} bytes`,
    `Ask the person to shrink ${STORE}`,
  ],
  BAD_JSON: e => [`Not a JSON object: ${e}`, `Pass an object such as '{"title":"Buy milk"}'`],
  SELECTORS_DISAGREE: k => [`--${k} and the JSON field ${k} differ`, `Give ${k} once`],
  MISSING_FIELD: k => [`${k} is missing`, `Add ${k}: ${about(k)}`],
  UNKNOWN_FIELD: k => [`${show(k)} is not a field of this command`, 'Use a field the schema lists'],
  NOT_ALLOWED: v => [`${show(v)} is not allowed`, 'Use a value the command lists'],
  WRONG_TYPE: ([k, v]) => [`${k} is ${show(v)}, not a string`, `Give ${about(k)} as a string`],
  BAD_FORMAT: ([k, v]) => [`${show(v)} is not ${about(k)}`, `Give ${about(k)}`],
  UNKNOWN_ID: id => [`No task has the id ${id}`, 'Use an id the command lists'],
  ALREADY_DONE: id => [`${id} is already done`, 'Use an id the command lists'],
  TOO_MANY_TASKS: () => [`The list holds ${MAX_TASKS} tasks`, 'Ask the person which tasks to drop'],
  FILE_EXISTS: f => [`${f} exists`, 'Choose another name, or add --replace to write over it'],
  TARGET_IS_FOLDER: f => [`A folder stands at ${f}`, 'Choose another file name'],
  NOT_A_FILE: f => [`${f} is not a file`, `Ask the person to move what stands at ${f}`],
  DATA_INVALID: at => [`${STORE} is broken at ${at}`, `Ask the person to repair or move ${STORE}`],
  EACCES: p => [`No right to use ${p}`, 'Ask the person for the right to read and write it'],
  ELOOP: p => [`${p} is a link`, 'Ask the person to replace the link with a plain file'],
  SYSTEM: p => [`The system refused ${p}`, 'Ask the person to check this path'],
  BUG: e => [`${e}`, 'Stop and report this answer to the person'],
};

class Refusal extends Error {
  constructor(issues) {
    super('refused');
    this.issues = issues;
  }
}

const HANDLERS = { add, list, done, export: exportTasks, schema };
const program = `node ${quote(process.argv[1])}`;
let output = null;
try {
  const call = parseArgs(process.argv.slice(2));
  output = call.output;
  answer(run(call), output);
} catch (error) {
  answer(refusalBody(error), output);
}

/** Layer 1 checked the whole call at once; the command then checks meaning, then the limit. */
function run(call) {
  if (call.issues.length > 0) throw new Refusal(call.issues);
  if (call.lists.length === 1) return listValues(call, call.lists[0]);
  if (call.command === undefined) return start(call);
  return HANDLERS[call.command](call);
}

function start(call) {
  const commands = Object.fromEntries(Object.entries(COMMANDS).map(([name, c]) => [name, c.does]));
  const next = [step('shows every command and its input', command(call, 'schema'))];
  next.push(step('lists the tasks', command(call, 'list')));
  return { ok: true, result: { tool: 'tasks', dataFolder: call.dir, commands }, next };
}

function schema(call) {
  const names = call.input.command ? [call.input.command] : Object.keys(COMMANDS);
  const commands = Object.fromEntries(names.map(name => [name, describe(name)]));
  const global = { '--dir': 'the data folder', '--output': OUTPUTS, '--json': 'the input, or -' };
  const exitCodes = { 0: 'success', 1: 'a refusal', 2: 'the tool broke' };
  const kinds = { fix: 'fix the input', ask: 'ask the person', retry: 'call again', bug: 'stop' };
  return { ok: true, result: { commands, global, exitCodes, kinds } };
}

function describe(name) {
  const { does, fields, required } = COMMANDS[name];
  const input = {};
  for (const key of fields) input[key] = { ...FIELDS[key], pattern: FIELDS[key].pattern?.source };
  const options = [...fields.map(key => `--${key}`), ...allowedSwitches(name)];
  return { does, input, required, unknownFields: 'refused', options };
}

function list(call) {
  const tasks = readStore(call.dir).tasks;
  const open = tasks.filter(task => task.status === 'open');
  const next = [];
  if (tasks.length === 0) next.push(addStep(call));
  if (open.length === 1)
    next.push(step('marks it done', command(call, 'done', opt('--id', open[0].id))));
  if (open.length > 1)
    next.push(step('lists the open ids for done', command(call, 'done', ['--id'])));
  if (tasks.length > 0) next.push(exportStep(call));
  const shown = tasks.filter(
    task => call.input.status === undefined || task.status === call.input.status,
  );
  return { ok: true, result: { tasks: shown }, ...(next.length > 0 && { next }) };
}

function add(call) {
  const store = readStore(call.dir);
  if (store.tasks.length >= MAX_TASKS)
    throw refuse('TOO_MANY_TASKS', 'tasks', command(call, 'list'));
  const id = `t${Math.max(0, ...store.tasks.map(task => Number(task.id.slice(1)))) + 1}`;
  const { title, priority = 'normal', due } = call.input;
  const task = { id, title, priority, ...(due && { due }), status: 'open' };
  store.tasks.push(task);
  const next = [step('marks the task done', command(call, 'done', opt('--id', id)))];
  next.push(step('lists the tasks', command(call, 'list')));
  return write(call, { task }, next, STORE, JSON.stringify(store, null, 2) + '\n');
}

function done(call) {
  const store = readStore(call.dir);
  const task = store.tasks.find(item => item.id === call.input.id);
  const ids = command(call, 'done', ['--id']);
  if (task === undefined) throw refuse('UNKNOWN_ID', 'id', ids, call.input.id);
  if (task.status === 'done') throw refuse('ALREADY_DONE', 'id', ids, task.id);
  task.status = 'done';
  const next = [step('lists the tasks', command(call, 'list')), exportStep(call)];
  return write(call, { task }, next, STORE, JSON.stringify(store, null, 2) + '\n');
}

/** The plan passes the same checks as the file, so a dry run answers it without the write. */
function exportTasks(call) {
  const { file } = call.input;
  const tasks = readStore(call.dir).tasks;
  const target = lstatOrNull(path.join(call.dir, file), file);
  if (target?.isDirectory()) throw refuse('TARGET_IS_FOLDER', 'file', '', file);
  const replace = command(call, 'export', [...opt('--file', file), '--replace', '--dry-run']);
  if (target && call.switches.has('--replace') === false)
    throw refuse('FILE_EXISTS', 'file', replace, file);
  const sections = ['Open', 'Done'].map(heading => {
    return { heading, tasks: tasks.filter(task => task.status === heading.toLowerCase()) };
  });
  const lines = ['# Tasks'];
  for (const section of sections)
    lines.push('', `## ${section.heading}`, '', ...section.tasks.map(taskLine));
  const plan = sections.map(section => ({ ...section, tasks: section.tasks.map(task => task.id) }));
  const result = { file, replaces: target !== null, sections: plan, lines: lines.length };
  return write(call, result, [], file, lines.join('\n') + '\n');
}

function taskLine(task) {
  const about = [task.priority, task.due].filter(Boolean).join(', ');
  return `- [${task.status === 'done' ? 'x' : ' '}] ${task.id} ${task.title} (${about})`;
}

/** A dry run answers the same result with written: false, and the same call without the flag. */
function write(call, result, next, name, text) {
  if (call.switches.has('--dry-run')) {
    const args = Object.entries(call.input).flatMap(([key, value]) => opt(`--${key}`, value));
    if (call.switches.has('--replace')) args.push('--replace');
    const real = step('runs the same call for real', command(call, call.command, args));
    return { ok: true, result: { ...result, written: false }, next: [real] };
  }
  writeFile(call.dir, name, text);
  return { ok: true, result: { ...result, written: true }, ...(next.length > 0 && { next }) };
}

function listValues(call, option) {
  if (option === '--output') return { ok: true, result: { option, values: OUTPUTS } };
  if (option !== '--id')
    return { ok: true, result: { option, values: FIELDS[option.slice(2)].values } };
  const tasks = readStore(call.dir).tasks.filter(
    t => call.command !== 'done' || t.status === 'open',
  );
  const next = tasks.length === 0 ? { next: [addStep(call)] } : {};
  return { ok: true, result: { option, values: tasks.map(task => task.id) }, ...next };
}

function addStep(call) {
  return step('adds a task', command(call, 'add', ['--title', 'First task', '--dry-run']), [
    'title',
  ]);
}

function exportStep(call) {
  return step(
    'shows the plan of tasks.md',
    command(call, 'export', ['--file', 'tasks.md', '--dry-run']),
  );
}

/** Reads every argument leniently, then checks the whole call, so one answer names every mistake. */
function parseArgs(argv) {
  const call = { words: [], options: new Map(), switches: new Set(), issues: [], input: {} };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--') === false) {
      call.words.push(argv[i]);
      continue;
    }
    const [name, ...rest] = argv[i].split('=');
    if (call.options.has(name) || call.switches.has(name))
      call.issues.push(issue('OPTION_TWICE', name));
    if (SWITCHES.includes(name)) {
      if (rest.length > 0) call.issues.push(issue('SWITCH_WITH_VALUE', name));
      call.switches.add(name);
      continue;
    }
    const takesNext = rest.length === 0 && argv[i + 1]?.startsWith('--') === false;
    const value = rest.length > 0 ? rest.join('=') : takesNext ? argv[++i] : '';
    call.options.set(name, value || null); // a missing and an empty value are one case
  }
  call.command = call.words[0];
  return checkCall(call);
}

function checkCall(call) {
  const { options, issues } = call;
  for (const word of call.words.slice(1)) issues.push(issue('EXTRA_WORD', word));
  Object.assign(call, dataFolder(options.get('--dir'), issues));
  call.output = outputOf(call);
  call.lists = [];
  if (call.command !== undefined && COMMANDS[call.command] === undefined) {
    issues.push(issue('UNKNOWN_COMMAND', call.command, command(call, 'schema')));
    return call;
  }
  const allowed = [
    '--dir',
    '--output',
    ...allowedOptions(call.command),
    ...allowedSwitches(call.command),
  ];
  const schemaCall = command(call, 'schema', call.command ? ['--command', call.command] : []);
  const unknown = [...options.keys(), ...call.switches].filter(
    name => allowed.includes(name) === false,
  );
  issues.push(...unknown.map(name => issue('UNKNOWN_OPTION', name, schemaCall)));
  const empty = [...options.keys()].filter(
    name => options.get(name) === null && allowed.includes(name),
  );
  call.lists = empty.filter(listsValues);
  if (call.lists.length > 1) issues.push(issue('TWO_LISTS', call.lists.join(' ')));
  const free = empty.filter(name => listsValues(name) === false);
  issues.push(...free.map(name => issue('VALUE_MISSING', name)));
  if (call.command !== undefined && call.lists.length === 0) issues.push(...readInput(call));
  return call;
}

function allowedOptions(name) {
  return name === undefined ? [] : ['--json', ...COMMANDS[name].fields.map(key => `--${key}`)];
}

function allowedSwitches(name) {
  return [
    ...(COMMANDS[name]?.writes ? ['--dry-run'] : []),
    ...(name === 'export' ? ['--replace'] : []),
  ];
}

function listsValues(option) {
  return (
    option === '--output' || option === '--id' || FIELDS[option.slice(2)]?.values !== undefined
  );
}

function outputOf(call) {
  const value = call.options.get('--output');
  if (value === undefined || value === null || OUTPUTS.includes(value)) return value ?? null;
  const lists = command(call, call.command ?? '', ['--output']);
  call.issues.push(issue('NOT_ALLOWED', '--output', lists, value));
  return null;
}

/** The data folder is resolved once; a given folder that is empty or wrong never falls back. */
function dataFolder(option, issues) {
  const given = option === undefined ? process.env.TASKS_DIR : option;
  if (given === undefined || given === null) return { dir: process.cwd(), dirGiven: false };
  if (given === '') issues.push(issue('DIR_EMPTY', 'TASKS_DIR'));
  if (given === '') return { dir: process.cwd(), dirGiven: false };
  try {
    const dir = fs.realpathSync(given);
    if (fs.statSync(dir).isDirectory() === false)
      issues.push(issue('DIR_NOT_FOLDER', '--dir', '', given));
    return { dir, dirGiven: true };
  } catch (error) {
    issues.push(issue(error.code === 'ENOENT' ? 'DIR_NOT_FOUND' : error.code, '--dir', '', given));
    return { dir: path.resolve(given), dirGiven: true };
  }
}

/** Fills call.input from '--json' and the options, and answers every issue of its fields. */
function readInput(call) {
  const json = call.options.get('--json');
  if (typeof json === 'string') {
    const parsed = parseJson(
      json === '-' ? readLimited(0, MAX_INPUT, 'TOO_LARGE', '--json') : json,
    );
    if (parsed.issue) return [parsed.issue];
    call.input = parsed.value;
  }
  const issues = [];
  for (const key of COMMANDS[call.command].fields) {
    const value = call.options.get(`--${key}`);
    if (typeof value !== 'string') continue;
    if (key in call.input && call.input[key] !== value)
      issues.push(issue('SELECTORS_DISAGREE', key));
    call.input[key] = value;
  }
  return [...issues, ...checkFields(call)];
}

function parseJson(text) {
  if (Buffer.byteLength(text) > MAX_INPUT)
    return { issue: issue('TOO_LARGE', '--json', '', MAX_INPUT) };
  try {
    const value = JSON.parse(text);
    if (typeof value === 'object' && value !== null && Array.isArray(value) === false)
      return { value };
    return {
      issue: issue('BAD_JSON', '--json', '', Array.isArray(value) ? 'an array' : typeof value),
    };
  } catch (error) {
    return { issue: issue('BAD_JSON', '--json', '', error.message) };
  }
}

function checkFields(call) {
  const { fields, required } = COMMANDS[call.command];
  const schemaCall = command(call, 'schema', ['--command', call.command]);
  const missing = required.filter(
    key => call.input[key] === undefined && call.options.get(`--${key}`) !== null,
  );
  const issues = missing.map(key => issue('MISSING_FIELD', key, schemaCall));
  for (const [key, value] of Object.entries(call.input)) {
    const lists = listsValues(`--${key}`) ? command(call, call.command, [`--${key}`]) : '';
    if (fields.includes(key) === false) issues.push(issue('UNKNOWN_FIELD', key, schemaCall));
    else issues.push(fieldIssue(key, value, lists));
  }
  return issues.filter(Boolean);
}

/** The one check of a field value, for the input and for every stored task alike. */
function fieldIssue(key, value, lists = '') {
  const { values, pattern } = FIELDS[key];
  if (typeof value !== 'string') return issue('WRONG_TYPE', key, '', [key, value]);
  if (values && values.includes(value) === false) return issue('NOT_ALLOWED', key, lists, value);
  if (pattern && pattern.test(value) === false)
    return issue('BAD_FORMAT', key, lists, [key, value]);
  return null;
}

function about(key) {
  return FIELDS[key].about ?? `one of ${FIELDS[key].values.join(', ')}`;
}

/** A name is looked up in the store, never turned into a path; the store is read without links. */
function readStore(dir) {
  let fd;
  try {
    fd = fs.openSync(path.join(dir, STORE), fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
  } catch (error) {
    if (error.code === 'ENOENT') return { tasks: [] };
    throw refuse(error.code, STORE);
  }
  try {
    if (fs.fstatSync(fd).isFile() === false) throw refuse('NOT_A_FILE', STORE);
    return checkStore(readLimited(fd, MAX_STORE, 'STORE_TOO_LARGE', STORE));
  } finally {
    fs.closeSync(fd);
  }
}

function checkStore(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw refuse('DATA_INVALID', STORE, '', 'its JSON');
  }
  if (Array.isArray(data?.tasks) === false) throw refuse('DATA_INVALID', STORE, '', 'tasks');
  for (const [i, task] of data.tasks.entries()) {
    const unknown = Object.keys(task ?? {}).find(key => TASK_KEYS.includes(key) === false);
    const given = TASK_KEYS.filter(key => key !== 'due' || task?.due !== undefined);
    const bad = unknown ?? given.find(key => fieldIssue(key, task[key]) !== null);
    if (bad !== undefined) throw refuse('DATA_INVALID', STORE, '', `tasks[${i}].${bad}`);
  }
  return data;
}

/** Reads to one byte past the limit from the opened file, so an endless input stops there. */
function readLimited(fd, limit, code, where) {
  const buffer = Buffer.alloc(limit + 1);
  let size = 0;
  for (let n = 1; n > 0 && size <= limit; size += n)
    n = fs.readSync(fd, buffer, size, limit + 1 - size);
  if (size > limit) throw refuse(code, where, '', limit);
  return buffer.subarray(0, size).toString('utf8');
}

/** A new temporary file beside the target, then a rename: never half a file, never through a link. */
function writeFile(dir, name, text) {
  const temp = path.join(dir, `.${name}.${process.pid}.tmp`);
  try {
    fs.writeFileSync(temp, text, { flag: 'wx' });
    fs.renameSync(temp, path.join(dir, name));
  } catch (error) {
    fs.rmSync(temp, { force: true });
    throw refuse(error.code, name);
  }
}

function lstatOrNull(file, where) {
  try {
    return fs.lstatSync(file);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw refuse(error.code, where);
  }
}

function issue(code, where, run = '', detail = where) {
  const [message, hint] = (TEXTS[code] ?? TEXTS.SYSTEM)(detail);
  return { code, path: where, message, hint, ...(run && { command: run }) };
}

function refuse(...args) {
  return new Refusal([issue(...args)]);
}

/** The kind comes from two short lists of codes; a system error nobody listed goes to the person. */
function refusalBody(error) {
  if (error instanceof Refusal === false) {
    const state = 'Unknown: run list to see what is stored.';
    return {
      ok: false,
      kind: 'bug',
      state,
      issues: [issue('BUG', '', '', error?.message ?? error)],
    };
  }
  const codes = error.issues.map(item => item.code);
  const isSystem = code => /^E[A-Z0-9]+$/.test(code) && RETRY.includes(code) === false;
  const ask = codes.some(code => ASK.includes(code) || isSystem(code));
  const kind = ask ? 'ask' : codes.some(code => RETRY.includes(code)) ? 'retry' : 'fix';
  return { ok: false, kind, state: 'Nothing was written.', issues: error.issues };
}

function step(does, run, needs) {
  return { does, command: run, ...(needs && { needs }) };
}

/** A command the tool names runs as it stands: it carries the data folder of the call. */
function command(call, name, args = []) {
  const dir = call.dirGiven ? opt('--dir', call.dir) : [];
  return [program, ...[name, ...dir, ...args].filter(Boolean).map(quote)].join(' ');
}

/** A value that starts with a dash joins its option, so the parser never reads it as an option. */
function opt(name, value) {
  return value.startsWith('-') ? [`${name}=${value}`] : [name, value];
}

function quote(value) {
  return /^[A-Za-z0-9_./:@%+=,-]+$/.test(value) ? value : `'${value.replaceAll("'", `'\\''`)}'`;
}

/** A value from outside as one visible line, so it can neither hide text nor forge an output line. */
function show(value) {
  const text = JSON.stringify(value) ?? `${value}`;
  const short = text.length > 60 ? `${text.slice(0, 57)}...` : text;
  return short.replace(/[\p{Cf}\p{Zl}\p{Zp}]/gu, c => `\\u${c.codePointAt(0).toString(16)}`);
}

/** JSON when a program reads stdout, text at a terminal, unless '--output' says otherwise. */
function answer(body, output) {
  const json = output === 'json' || (output === null && process.stdout.isTTY !== true);
  process.stdout.write(json ? JSON.stringify(body) + '\n' : text(body));
  process.exitCode = body.ok ? 0 : body.kind === 'bug' ? 2 : 1;
}

function text(body) {
  const lines = [];
  if (body.ok === false) lines.push(`Refused (${body.kind}): ${body.state}`);
  for (const item of body.issues ?? []) {
    lines.push(`- ${item.code} at ${item.path}: ${item.message}`, `  Hint: ${item.hint}`);
    if (item.command) lines.push(`  Run: ${item.command}`);
  }
  const tasks = body.result?.tasks?.map(task => taskLine(task).slice(2));
  if (body.ok)
    lines.push(tasks ? tasks.join('\n') || 'No tasks.' : JSON.stringify(body.result, null, 2));
  if (body.next) lines.push('Next:', ...body.next.map(item => `- ${item.does}: ${item.command}`));
  return lines.join('\n') + '\n';
}
