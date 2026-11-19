---
reference:
  reads-in: 2 Tool
  before: the first contract of a run
  return-to: 2 Tool
---

# The tool contract

Part of state 2 Tool in `../SKILL.md`.

**A deterministic tool checks every input, refuses what does not fit, changes nothing on a refusal,
and never guesses.**

The contract of one command names five things: its input, its checks, its refusals, its exit
codes and its next steps.
The sections below describe each one.
Many of these rules come from Justin Poehnelt's article 'Rewrite your CLI for AI agents' (2026):
https://justin.poehnelt.com/posts/rewrite-your-cli-for-ai-agents/

## Input

**The tool takes structured input and can describe that input itself.**

- Take the whole input as one JSON object, so the agent passes data as it is.
- Answer the accepted shape at runtime, for example with a 'schema' command.
- An option given without a value lists the values it accepts.
- Keep paths inside the folders the tool owns: an allow-list of folders, everything else refused.

## Checks in layers

**Check shape first, then rules, then limits, and list every issue of a layer at once.**

| Layer | Question | Example |
| :--- | :--- | :--- |
| shape | does the input have the right fields and types? | 'net' is a number, 'date' is a date |
| rules | do the values agree with each other and with the stored data? | gross equals net plus tax, the invoice number is new |
| limits | does the result fit the bounds? | the text fits on two pages, at most 50 rows |

A later layer runs only when the earlier one passed, because its checks need a valid shape.
One answer lists every issue of the failing layer, so the agent fixes them in one round.

## All or nothing

**A refused call changes nothing.**
Write to a temporary file and rename it at the end, or use a transaction.
A half-written file makes the next call fail for a reason the agent cannot see.

## Refusals

**A refusal tells the agent where the input is wrong and what to change.**

```json
{
  "ok": false,
  "kind": "fix",
  "issues": [
    {
      "code": "UNKNOWN_SUPPLIER",
      "path": "supplier",
      "message": "No supplier is named Acme Ltd",
      "hint": "Run the command and use one of the supplier names it lists",
      "command": "ledger suppliers"
    }
  ]
}
```

| Field | Purpose |
| :--- | :--- |
| 'code' | a stable name the skill can map to a change |
| 'path' | where in the input the wrong value sits |
| 'message' | the problem in words for a person |
| 'hint' | what to change |
| 'command' | an optional call that lists the valid values |

The 'kind' tells the agent its next move:

| Kind | Meaning | The agent |
| :--- | :--- | :--- |
| 'fix' | the input is wrong and the agent can correct it | goes back to the state that made the input and fixes it |
| 'ask' | only the person can solve it, such as a full disk or a missing right | stops and asks the person |
| 'retry' | a later call may pass, such as after a lost connection | calls again later, at most three times |
| 'bug' | the tool itself is wrong | stops and tells the person, and does not work around it |

A 'retry' needs care when the call has an effect.
Before the next try, the tool must answer whether the first try took effect, so nothing runs twice.

## Exit codes

**A few exit codes, each with one meaning.**
One working scheme: 0 for success, 1 for a refusal (the 'kind' says which), 2 for a bug in the tool.
The agent then knows the next step from one number, before it reads the answer.

## Never guess

**An input the tool does not know is refused, never matched to the closest known one.**

- An unknown command, option, field or value is refused.
- A required value has no silent default.
- A group of commands without an action lists its actions.

A guess turns a typo into a wrong result that looks right.

## Next steps

**A success names the commands that can follow, and what each one still needs.**
The agent then finds its way without a manual.
A dry run, such as a '--dry-run' option, lets the agent see what a call would do before it does it.

## Output for two readers

Answer JSON when the output goes to a program, and plain lines when it goes to a terminal.
Both say the same thing.

## A tool the person cannot change

When the tool belongs to someone else and lacks a check the flow needs, the run stops and asks.
Two common answers:

| Choice | Trade-off |
| :--- | :--- |
| a thin wrapper that adds the missing check and the refusal format | more code to keep, but the flow stays fully checked |
| an approval step where the person checks before the call | no code, but the person must read every call |

## In a review

Write the contract the tool has now, from its code, its help or its output.
Each rule above the tool breaks is a finding.
Run a call only when the tool's code or docs show it changes nothing; a tool under review may ignore '--help' or '--dry-run' and run for real.

Then return to state 2 Tool in `../SKILL.md`.
