# tasks: a manual for agents

Use this tool when the person wants to add, list or finish tasks, or write them as a Markdown file.
The tasks live in one file, tasks.json, in the data folder.

## How to run it

```sh
node bin/tasks.mjs                 # where to start: the commands and the first steps
node bin/tasks.mjs schema          # every command, its input fields, options and switches
node bin/tasks.mjs add --json '{"title":"Buy milk","priority":"high","due":"2026-12-31"}'
```

- The data folder is '--dir PATH', else the environment variable TASKS_DIR, else the working directory.
  The tool never falls back to another folder when the one you name is empty or wrong.
- Pass the whole input as one JSON object with '--json', or '--json -' to read it from stdin.
  Every input field also has an option of its own, such as '--title'; give each field once.
- Piped, the tool answers one line of JSON; at a terminal, text. '--output json' or '--output text' forces either.
- Give an option such as '--id', '--status', '--priority', '--command' or '--output' without a value,
  and the tool lists the values it accepts.
- 'add', 'done' and 'export' take '--dry-run': the same checks, the same answer with '"written": false', and no write.
- 'export' writes only a plain file name inside the data folder, and writes over a file only with '--replace'.

## What each answer asks of you

| Exit code | Answer | What you do |
| :--- | :--- | :--- |
| 0 | '"ok": true' | read 'result'; pick the next call from 'next', each with what it does |
| 1 | '"kind": "fix"' | change the input as each issue's 'hint' says, or run its 'command' to see the fitting values; after three refusals of one call, stop and ask the person |
| 1 | '"kind": "ask"' | stop and ask the person; the issue says what they must decide or repair |
| 1 | '"kind": "retry"' | call again a little later, at most three times; then stop and ask the person |
| 2 | '"kind": "bug"' | stop and report the answer to the person; run 'list' before you call a writing command again |

A refusal lists every issue it found in one answer, and its 'state' says what the call left, such as 'Nothing was written.'
Each issue has 'code', 'path', 'message', 'hint' and, where one helps, a 'command' that runs as it stands.

## A typical task

1. Run 'list' to see what is there.
2. For a new task, run 'add' with '--dry-run' first, read the answer, then the same call without the flag
   (the answer's 'next' holds it).
3. To finish a task, run 'done --id' alone to list the open ids, then 'done --id ID'.
4. To write the Markdown file, run 'export --file tasks.md --dry-run', read the plan, then run it without the flag.

## When to stop and ask the person

- Every answer of kind 'ask': a broken or linked tasks.json, a folder without the right to write, a full list.
- Before 'export --replace': it writes over a file the person may want to keep.
- When the person's words fit more than one task, show the candidates and let them choose.
