---
reference:
  reads-in: 4 Design
  before: the first design line
  return-to: 4 Design
---

# Shapes that close several rules at once

Part of state 4 Design in `../SKILL.md`.

**Build one shape for every answer, one for every error and one schema, and most rules follow from them.**

A tool that answers in one shape lets the agent learn the shape once.
The numbers in brackets name the rules from `./rules.md` that each shape closes.

## One answer shape (3, 10, 14)

Every command answers one JSON object on stdout, success or refusal.

```json
{
  "ok": true,
  "result": {},
  "next": [
    { "does": "shows the plan of the result", "command": "tool plan --name demo" },
    { "does": "writes the result", "command": "tool build --name demo", "needs": ["out"] }
  ]
}
```

- At a terminal the same answer prints as readable text; piped, as one line of JSON; '--output json' or '--output text' forces either.
- 'next' names what can follow and what each step still needs. The tool never runs a step itself.
- Work 'next' out from the facts of the answer: with no item yet, the step creates one; with one item, the step names it.
  Leave 'next' out when nothing follows. A step without 'command' is for the person.
- A dry run answers the same object with a field such as '"written": false'; its one next step is the call without the flag.
- Progress and logs go to stderr, so stdout stays one document.

## One error shape (7, 8, 10, 12)

A refusal lists every issue of the first layer that failed.

```json
{
  "ok": false,
  "kind": "fix",
  "state": "Nothing was written.",
  "issues": [
    {
      "code": "UNKNOWN_NAME",
      "path": "name",
      "message": "No item is named demmo",
      "hint": "Run the command and use one of the names it lists",
      "command": "tool show --name"
    }
  ]
}
```

| Kind | Exit code | Meaning for the agent |
| :--- | :--- | :--- |
| 'fix' | 1 | the agent can fix the input and call again |
| 'ask' | 1 | only the person can solve it, such as a full disk |
| 'retry' | 1 | a later call may succeed, such as after a failed connection |
| 'bug' | 2 | the tool broke; the agent stops and reports |

The layers run in order: arguments, then shape (the schema), then meaning (do the names exist), then the costly checks.
A layer runs only when the layers before it passed.

- 'state' says what the failed call left. It is 'Nothing was written' unless a write failed halfway; then it names the files written.
- One function builds every refusal and decides the kind from two short lists of codes, one for 'ask' and one for 'retry'.
  Every other code is 'fix'. A system error nobody listed is 'ask': a case nobody planned goes to the person.
- A failure of the system on a path the caller gave is a refusal. A missing program the person can install is 'ask', with the install hint.
- One catch at the entry point turns every unexpected error into this shape with the kind 'bug' and exit code 2.
- Collect inside a layer: a command that returns at its first wrong option gives the agent one mistake per call.

## Commands that run as they stand (12, 14)

An agent runs a command the tool names without reading it twice, so the command must be complete.

- The 'command' of an issue and of a next step carries the data folder and the names of the call that produced it.
- The layer that knows the call completes the command. A check deep in the code names the list command;
  the entry point adds the data folder and the name the check does not know.
- Quote every value for the shell: bare only for letters, digits and a few safe signs, single quotes for the rest,
  and '--name=value' for a value that starts with a dash.
- A test runs every command the tool names and expects the tool to know it.

## One schema, one table of commands (1, 2, 13, 15)

- One table lists every command with what it does, its options, its words and its input schema.
  The parser, the checks, the schema command, the option lists and the next steps all read this table.
- Each command declares its input once, as one schema; the validator and the schema command read that same object.
- The schema refuses unknown fields. A limit the schema uses, such as the most items, stands in the schema command's answer too.
- Mark in the table which options take their values from a list. Let the type checker fail until each such option has its list.
- The whole input goes in as one JSON object; flags, if any, fill fields of the same schema.
- An option given without its value answers the values from the same source the validation uses.

## Writes and paths (4, 5, 9, 11)

- Every check runs before the first write. A write goes to a temporary file in the target folder, then a rename.
- Several files: write all temporary files first, then rename them all.
- The dry run and the plan follow the real path up to the write, then answer what would be written.
- Resolve every path, links included, and refuse it unless it lies inside an allowed folder.
- An id matches a list of allowed characters, such as lower-case letters, digits and hyphens; every other id is refused.
- Find a stored item by its name among the files that exist. Never build the path from the name alone.
- Read every file through one function: open it, then take its kind and size from the opened file, and stop the read at the limit.
  The same limit holds for stdin and for a download.
- Write every file through one function: create the temporary file as a new file, so a link left there is never followed;
  the rename then replaces a link at the target and never writes through it.
- When a later rename fails, remove the temporary files and name in 'state' what is already written.
- A command that replaces stored data needs a flag, and answers what it adds, changes and removes.

## A strict parser (15)

- An unknown command, an unknown option, an extra word or an option of another command is an issue, never ignored.
- So is an option given twice, a value on a switch, and two selectors that name different things.
- All mistakes of one call go into one answer.
  The strict mode of most parsers stops at the first one, so parse in the lenient mode and check every argument yourself.
- A default applies only when exactly one candidate exists; with several, the tool refuses and names the list command.
- A command group without its action lists its actions; the tool alone answers where to start.

## The agent skill (6)

The skill ships with the tool and holds:

- when to use the tool, and how to run it
- a table that maps each answer (exit code and kind) to what the agent does
- the flow of a typical task, with the points where the agent stops and asks the person

Keep the skill in step with the tool: a test fails when the skill names a command, an option or an error code the tool lacks.
The facts that stand in the code are written and checked by a program; the agent writes only the prose around them.

## Where the errors live

- Keep the issues of one module in one file, one function per issue, so every text and code of that module reads in one place.
- An issue function takes what it names as parameters, such as the list of commands or the schema command.
  The issue file then imports no command code, and no import cycle forms.
- Make a code a shared constant only where other code compares it.

## Tests that earn their place

State 5 Change writes a test per rule. Each test below caught a real gap in oriko; plan the ones that fit the tool.

- every example the tool ships passes its checks and builds
- one call with several mistakes answers all of them
- a refused write leaves none of the files of the command; a write that fails halfway names what it wrote
- a write never follows a link out of the allowed folder
- every command in a hint or a next step is a call the tool knows, and keeps the data folder of the call
- a value with a space, a quote or a leading dash comes back from the shell as itself
- an option without a value answers its list; an option with a free value is refused by name
- piped input is read only to one byte past the limit
- a system error goes to the caller for a path the caller gave, and to the person for anything else

Then return to 4 Design.
