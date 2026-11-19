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
- Progress and logs go to stderr, so stdout stays one document.

## One error shape (7, 8, 10, 12)

A refusal lists every issue of the first layer that failed.

```json
{
  "ok": false,
  "kind": "fix",
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

## One schema (1, 2, 13)

- Each command declares its input once, as one schema; the validator and the schema command read that same object.
- The whole input goes in as one JSON object; flags, if any, fill fields of the same schema.
- An option given without its value answers the values from the same source the validation uses.

## Writes and paths (4, 5, 9, 11)

- Every check runs before the first write. A write goes to a temporary file in the target folder, then a rename.
- Several files: write all temporary files first, then rename them all.
- The dry run and the plan follow the real path up to the write, then answer what would be written.
- Resolve every path, links included, and refuse it unless it lies inside an allowed folder.
- An id matches a list of allowed characters, such as lower-case letters, digits and hyphens; every other id is refused.

## A strict parser (15)

- An unknown command, an unknown option, an extra word or an option of another command is an issue, never ignored.
- All mistakes of one call go into one answer.
- A command group without its action lists its actions; the tool alone answers where to start.

## The agent skill (6)

The skill ships with the tool and holds:

- when to use the tool, and how to run it
- a table that maps each answer (exit code and kind) to what the agent does
- the flow of a typical task, with the points where the agent stops and asks the person

Then return to 4 Design.
