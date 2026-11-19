---
reference:
  reads-in: 4 Design, 5 Change
  before: the first design line
  return-to: the state that read it
---

# Shapes that close several rules at once

Part of states 4 Design and 5 Change in `../SKILL.md`.

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
  After a 'bug' the tool cannot know what it left: 'state' says so and names a call that shows what is stored.
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

## A version may only select from its source (7)

**When the agent derives a version from a source the person owns, the tool checks that the version adds nothing.**

A summary, a tailored copy or a shortened report is a version of a source.
The agent's typical mistake is to add what the task asks for and the source does not hold.

- Where the source holds a closed list (names, skills, line items), the tool lets the version keep, drop and reorder items.
  An item the source does not hold is refused, with the item named.
- Adding the item is a change to the source, and the source belongs to the person: the agent skill stops and asks.
- Where the version may reword free text, no rule can tell a rewording from a new claim.
  That part stays with the agent as a prohibition with a test the agent can apply
  (a verb, a duty or a name that only the outside text uses is a new claim),
  and with the person, who reads the result at the end.
- Name the cause, then check every field the cause covers.
  A check on one list leaves the same mistake open in the list next to it.

Example: a tailored copy lists a skill the source never names; the tool refuses the item and names it.

## A strict parser (15)

- An unknown command, an unknown option, an extra word or an option of another command is an issue, never ignored.
- So is an option given twice, a value on a switch, and two selectors that name different things.
- All mistakes of one call go into one answer.
  The strict mode of most parsers stops at the first one, so parse in the lenient mode and check every argument yourself.
- A default applies only when exactly one candidate exists; with several, the tool refuses and names the list command.
- A command group without its action lists its actions; the tool alone answers where to start.

## The agent skill (6)

The agent skill ships with the tool and holds:

- when to use the tool, and how to run it
- a table that maps each answer (exit code and kind) to what the agent does
- the flow of a typical task, with the points where the agent stops and asks the person

Write the flow as a state machine, as `./agent-skill.md` describes:
numbered states, a transition table before the first state, back edges bounded at 3, and STOP as a state of its own.

## The contract and the agent skill stay in step (6)

The agent skill names commands, options and refusal codes of the tool.
A test fails when the agent skill names one the tool lacks, or when a refusal code the tool can answer has no row in the agent skill.
Without the test, the agent skill drifts with every change of the tool, and the agent follows a manual that is no longer true.

## Facts from the code, prose from the agent (6)

A fact that stands in the code, such as a command, an option or a link between two modules, is written into a doc by a program.
The agent writes only the sentences, and a check fails when the two drift apart.
The program hands each gap to the writer as data: the file that lacks a sentence, with its comments.

## A tool the user cannot change

When the tool belongs to someone else, a gap cannot be closed in its code.
State 4 Design stops and asks the user; two common answers:

| Choice | Trade-off |
| :--- | :--- |
| a thin wrapper that adds the missing check and the error shape | more code to keep, but every call stays checked |
| an approval step in the agent skill, where the person checks each call before it runs | no code, but the person must read every call |

## Where the errors live

- Keep the issues of one module in one file, one function per issue, so every text and code of that module reads in one place.
- An issue function takes what it names as parameters, such as the list of commands or the schema command.
  The issue file then imports no command code, and no import cycle forms.
- Make a code a shared constant only where other code compares it.

## Tests that earn their place

State 5 Change writes a test per rule. Each test below caught a real gap in a real tool; plan the ones that fit the tool.

- every example the tool ships passes its checks
- one call with several mistakes answers all of them
- a refused write leaves none of the files of the command; a write that fails halfway names what it wrote
- a write never follows a link out of the allowed folder
- every command in a hint or a next step is a call the tool knows, and keeps the data folder of the call
- a value with a space, a quote or a leading dash comes back from the shell as itself
- an option without a value answers its list; an option with a free value is refused by name
- piped input is read only to one byte past the limit
- a system error on a path the caller gave answers a refusal with exit code 1, never a crash with exit code 2

Then return to the state that sent you here: 4 Design or 5 Change.
