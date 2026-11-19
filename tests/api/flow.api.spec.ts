/**
 * Each skill's flow follows the state machine format its references/agent-skill.md describes.
 *
 * @example node --test tests/api/flow.api.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { filesIn, skillFolders } from '../utils/files.ts';
import { flowProblems, flowTables, mentionProblems, rowProblems } from '../utils/flow.ts';
import { pageOf } from '../utils/markdown.ts';

const read = (path: string) => readFileSync(path, 'utf8');

// A small flow that meets every rule; each test below breaks one line of it.
const SAMPLE = `## Flow

| From | To | When |
| :--- | :--- | :--- |
| 0 Start | 1 End | ready |
| 0 Start | STOP | not ready |
| 1 End | done | finished |
| STOP | the state it left | answered (**back edge**, bound 3) |
| STOP | done | ended |

### 0 Start

**Outcome: started.**

### 1 End

**Outcome: ended.**

### STOP

**Outcome: answered.**
`;

test('the flow of every skill follows the format', () => {
  const problems = skillFolders().flatMap(skill =>
    flowProblems(read(join(skill, 'SKILL.md'))).map(problem => `${skill}: ${problem}`),
  );
  assert.deepEqual(problems, []);
});

test('every flow table in the references, such as an example, follows the row rules', () => {
  const problems = skillFolders().flatMap(skill =>
    filesIn(join(skill, 'references')).flatMap(file =>
      flowTables(read(join(skill, 'references', file))).flatMap(table =>
        rowProblems(table).map(problem => `${skill}/references/${file}: ${problem}`),
      ),
    ),
  );
  assert.deepEqual(problems, []);
});

test('every state the prose and the references name is a state of the skill', () => {
  const problems = skillFolders().flatMap(skill => {
    const text = read(join(skill, 'SKILL.md'));
    const states = pageOf(text)
      .headings.map(heading => heading.text)
      .filter(name => /^\d /.test(name));
    const references = filesIn(join(skill, 'references')).map(file =>
      read(join(skill, 'references', file))
        .split('\n')
        .filter(line => /^\s*reads-in:|^Part of states/.test(line))
        .join('\n'),
    );
    return [text, ...references].flatMap(part => mentionProblems(part, states));
  });
  assert.deepEqual(problems, []);
});

test('the sample flow passes, so each broken copy below fails for its own reason', () => {
  assert.deepEqual(flowProblems(SAMPLE), []);
});

test('a When cell over 60 characters or with a quote is reported', () => {
  const broken = SAMPLE.replace('| ready |', `| ${'a'.repeat(61)} "x" |`);
  assert.deepEqual(flowProblems(broken), [
    '5: the When cell is over 60',
    '5: the When cell holds < > or "',
  ]);
});

test('a back edge without its marker is reported', () => {
  const broken = SAMPLE.replace('| 1 End | done | finished |', '| 1 End | 0 Start | again |');
  assert.deepEqual(flowProblems(broken), ['7: a back edge without its marker and bound']);
});

test('a row to a state without a section, and a state without a row, are reported', () => {
  const broken = SAMPLE.replace('| 0 Start | 1 End |', '| 0 Start | 2 Gone |');
  assert.deepEqual(flowProblems(broken), [
    '5: 2 Gone has no row out of it',
    '2 Gone has no section',
    '1 End is never reached',
  ]);
});

test('a state without its outcome line is reported', () => {
  const broken = SAMPLE.replace('**Outcome: ended.**', 'Ends.');
  assert.deepEqual(flowProblems(broken), ['15: 1 End opens with no **Outcome: line']);
});

test('a skill without a flow table is reported', () => {
  assert.deepEqual(flowProblems('### 0 Start\n\n**Outcome: started.**\n'), [
    '0 flow tables, not 1',
  ]);
});

test('a numbered name that is no state is reported', () => {
  assert.deepEqual(mentionProblems('Go back to 1 Draft.', ['0 Start', '1 End']), [
    '1 Draft.… names no state',
  ]);
});
