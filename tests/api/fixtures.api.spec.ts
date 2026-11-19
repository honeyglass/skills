/**
 * The sample tools of the adx-cli evals still behave as the expected outputs describe.
 *
 * An eval expects the weak tools to show their gaps and the good tool to meet every rule; a change
 * to a sample that hides a gap, or opens one, would make an eval judge the skill wrongly.
 * Each run starts in a fresh temporary folder, since the weak tools write where they run.
 *
 * @example node --test tests/api/fixtures.api.spec.ts
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { ROOT } from '../utils/files.ts';

const FILES = join(ROOT, 'evals', 'adx', 'cli', 'files');
const NOTES = join(FILES, 'notes-cli', 'bin', 'notes.cjs');
const TASKS = join(FILES, 'tasks-cli', 'bin', 'tasks.mjs');
const DEPLOY = join(FILES, 'deploy', 'deploy.sh');
// The example of the header of tasks.mjs: a built-in that breaks before the tool starts.
const BROKEN_BUILTIN = 'data:text/javascript,Object.fromEntries=()=>{throw new TypeError("x")}';

const SCRATCH = mkdtempSync(join(tmpdir(), 'adx-fixtures-'));
after(() => rmSync(SCRATCH, { recursive: true, force: true }));

// A working folder inside a fresh parent, so a write to '..' stays in the parent and is seen.
function scratch() {
  const parent = mkdtempSync(join(SCRATCH, 'run-'));
  const work = join(parent, 'work');
  mkdirSync(work);
  return { parent, work };
}

function run(command: string, args: string[], cwd: string) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  return { code: result.status, out: result.stdout };
}

test('notes-cli writes before it checks, and fails with one plain sentence', () => {
  const { work } = scratch();
  const answer = run('node', [NOTES, 'add', 'one', 'text'], work);
  assert.equal(answer.code, 1);
  assert.equal(answer.out, 'release-notes 1.2.0\nError: something is wrong with the input\n');
  assert.deepEqual(readdirSync(work), ['notes.json']);
});

test('notes-cli guesses a command and writes outside its folder', () => {
  const { parent, work } = scratch();
  assert.equal(run('node', [NOTES, 'rem', '1.0.0'], work).out, 'release-notes 1.2.0\nRemoved\n');
  assert.equal(run('node', [NOTES, 'export', '--file', '../out.md'], work).code, 0);
  assert.equal(existsSync(join(parent, 'out.md')), true);
});

test('deploy.sh turns any env that starts with prod into production, and deploys half', () => {
  const { work } = scratch();
  assert.equal(
    run('sh', [DEPLOY, 'prodx', '1.0.0'], work).out.split('\n')[0],
    'copy app.js to production',
  );
  const half = run('sh', [DEPLOY, 'staging'], work);
  assert.equal(half.code, 1);
  assert.equal(
    half.out,
    'copy app.js to staging\ncopy app.css to staging\ncopy index.html to staging\nsomething went wrong\n',
  );
});

test('tasks-cli answers its schema, refuses a path out of its folder, and writes nothing on a dry run', () => {
  const { parent, work } = scratch();
  const schema = run('node', [TASKS, 'schema', '--dir', work], work);
  assert.equal(schema.code, 0);
  assert.equal(JSON.parse(schema.out).ok, true);
  const refused = run('node', [TASKS, 'export', '--file', '../x.md', '--dir', work], work);
  assert.equal(refused.code, 1);
  assert.deepEqual(
    [JSON.parse(refused.out).kind, JSON.parse(refused.out).issues[0].code],
    ['fix', 'BAD_FORMAT'],
  );
  const dry = run('node', [TASKS, 'add', '--title', 'Buy', '--dry-run', '--dir', work], work);
  assert.equal(JSON.parse(dry.out).result.written, false);
  assert.deepEqual([readdirSync(parent), readdirSync(work)], [['work'], []]);
});

test('tasks-cli refuses a blank or invisible title and a date that names no day', () => {
  const { work } = scratch();
  const inputs = [
    ['--title', '   '],
    ['--title', 'aㅤb'],
    ['--title', 'x', '--due', '2026-13-45'],
  ];
  const answers = inputs.map(input => run('node', [TASKS, 'add', ...input, '--dir', work], work));
  assert.deepEqual(
    answers.map(answer => [answer.code, JSON.parse(answer.out).issues[0].code]),
    [
      [1, 'BAD_FORMAT'],
      [1, 'BAD_FORMAT'],
      [1, 'BAD_FORMAT'],
    ],
  );
  assert.deepEqual(readdirSync(work), []);
});

test('tasks-cli asks the person about a broken entry and an id beyond its pattern', () => {
  const broken = scratch().work;
  const full = scratch().work;
  const last = '{"tasks":[{"id":"t999999","title":"x","priority":"normal","status":"open"}]}';
  writeFileSync(join(broken, 'tasks.json'), '{"tasks":[null]}');
  writeFileSync(join(full, 'tasks.json'), last);
  const listed = run('node', [TASKS, 'list', '--dir', broken], broken);
  const added = run('node', [TASKS, 'add', '--title', 'y', '--dir', full], full);
  assert.deepEqual(
    [listed, added].map(answer => [answer.code, JSON.parse(answer.out).kind]),
    [
      [1, 'ask'],
      [1, 'ask'],
    ],
  );
  assert.equal(readFileSync(join(full, 'tasks.json'), 'utf8'), last);
});

test('tasks-cli names an export step that runs once tasks.md exists', () => {
  const { work } = scratch();
  run('node', [TASKS, 'add', '--title', 'one', '--dir', work], work);
  run('node', [TASKS, 'export', '--file', 'tasks.md', '--dir', work], work);
  const next: { command: string }[] = JSON.parse(
    run('node', [TASKS, 'list', '--dir', work], work).out,
  ).next;
  const exported = next.find(step => step.command.includes(' export '));
  assert.equal(exported?.command.endsWith('--file tasks.md --replace --dry-run'), true);
  assert.equal(run('sh', ['-c', exported?.command ?? ''], work).code, 0);
});

test('tasks-cli exits 2 with kind bug when a built-in breaks, as its header shows', () => {
  const { work } = scratch();
  const answer = run('node', ['--import', BROKEN_BUILTIN, TASKS, 'schema'], work);
  assert.equal(answer.code, 2);
  assert.equal(JSON.parse(answer.out).kind, 'bug');
});
