# adx-cli

ADX stands for Agent Developer eXperience: how easy a tool is for an AI agent to use.
adx-cli is a skill for Claude Code that builds, reviews and fixes a command-line tool (CLI)
that an agent drives, including the agent skill the CLI ships.

This README is for people. Claude Code reads [SKILL.md](SKILL.md) and the files in
[references/](references/).

## Agentic meets deterministic

An agent alone can be wrong without noticing. A tool alone cannot read free text, such as an
email, a job posting or a wish. Put the two together, and each one does what the other cannot.

- **The agent** judges: it reads free text, chooses, words and asks.
- **The tool** checks every step the agent takes. It refuses what does not fit, writes nothing
  on a refusal and never guesses. Its refusal says where the input is wrong and what to change.
- **The agent skill** is the agent's manual, written as a state machine: numbered states and one
  table of the moves between them. After a refusal the agent goes back and fixes its input, at
  most three times. Then it stops and asks the person.

The agent's mistakes turn into refusals the agent can read and fix. The bound keeps a loop from
running forever, and the stop gives the person the last word.

## Who owns which step

Each step of the work has exactly one owner.

| Owner | Sign | Examples |
| :--- | :--- | :--- |
| agent | the input is free text, or the answer has more than one good form | read an email, pick the relevant lines, word a summary |
| tool | a written rule gives one answer for one input | a date format, a sum, a length limit, a unique number |
| person | only the person knows the fact, or the step cannot be undone | a fact about the person, a payment, a deploy to production |

A question that helps: would two careful people, given the same rule, always give the same
answer? Then the step belongs to the tool. A step that needs both judgment and a rule splits in
two: the agent proposes, the tool checks. A rule that stands only in the agent's prompt is a
wish; a rule in the tool is a fact the agent cannot skip.

## The 15 rules

A CLI meets the Agent DX rules when every answer tells the agent what happened and what it can
do next. The six rules marked 'article' come from Justin Poehnelt's article
[Rewrite your CLI for AI agents](https://justin.poehnelt.com/posts/rewrite-your-cli-for-ai-agents/)
(2026). The nine marked 'addition' came from building tools for agents; they were first written
down for [oriko](https://github.com/honeyglass/oriko), a CV tool, and hold for any CLI.

| # | Rule | What the tool does | Source |
| :--- | :--- | :--- | :--- |
| 1 | Raw JSON input | takes the whole input of a command as one JSON object | article |
| 2 | Schema at runtime | prints every command and the exact input each one accepts | article |
| 3 | JSON when piped | answers text at a terminal and JSON when a program reads it | article |
| 4 | Input hardening | keeps every path inside an allowed folder and every id within allowed characters | article |
| 5 | Dry runs | a command that writes or sends says what it would do, and does nothing | article |
| 6 | Agent skill | ships a manual for agents with the code; a state machine is its strong form | article |
| 7 | Checks in layers | checks shape, then meaning, then the costly checks; answers all errors of a layer at once | addition |
| 8 | Errors with a hint | each error says where it is and what to change | addition |
| 9 | All or nothing | a refused or failed command writes nothing | addition |
| 10 | Exit codes 0, 1, 2 | 0 success, 1 a refusal, 2 the tool broke | addition |
| 11 | Plan before the file | shows the plan of the result before it writes the result | addition |
| 12 | Hints that run | a refusal names the command that lists the fitting values | addition |
| 13 | Options that list | an option given without its value lists the values it accepts | addition |
| 14 | Next steps | the tool alone says where to start; a success names the commands that can follow | addition |
| 15 | Nothing passes silently | refuses an unknown command, option, word or input field | addition |

Each rule, its probe and the lessons behind it stand in [references/rules.md](references/rules.md).

## How to use it

Copy the folder into the `.claude/skills/` folder of a project, or into `~/.claude/skills/`.
Then type `/adx-cli` in Claude Code, or just ask; the skill also starts when you talk about a CLI
for agents. It works in one of three modes, taken from your words:

| Mode | You say, for example | The skill |
| :--- | :--- | :--- |
| review | 'review my CLI for agents, change nothing' | runs the tool in a scratch folder and reports each rule as met or not, with evidence |
| fix | 'make this CLI agent friendly' | reviews, designs a change per gap, asks before a change that breaks callers, then changes and checks again |
| build | 'build a CLI for agents that manages bookmarks' | designs all 15 rules, builds the tool and its agent skill, and proves each rule with a test |

The skill never runs the tool against your real data or a paid service without asking, and it
commits nothing unless you ask.

## What is inside

| Path | Holds |
| :--- | :--- |
| [SKILL.md](SKILL.md) | the flow of the skill itself, as a state machine |
| [references/rules.md](references/rules.md) | the 15 rules and their probes |
| [references/design.md](references/design.md) | the shapes that close several rules at once |
| [references/agent-skill.md](references/agent-skill.md) | how to write the agent skill as a state machine |
| [evals/](evals/evals.json) | test prompts, with sample CLIs in `evals/files/` |
