---
reference:
  reads-in: 2 Check, 6 Verify
  before: the first verdict, and again before the probes of 6 Verify
  return-to: the state that read it
---

# The 15 Agent DX rules and their probes

Part of states 2 Check and 6 Verify in `../SKILL.md`.

**Each rule says what the tool does; its probe says how to see whether the tool does it.**

The six rules marked 'article' come from Justin Poehnelt's article
[Rewrite your CLI for AI agents](https://justin.poehnelt.com/posts/rewrite-your-cli-for-ai-agents/) (2026).
The nine marked 'oriko' are additions by the author of [oriko](https://github.com/honeyglass/oriko),
a CV tool built to be driven by agents, from building tools for agents.
The lines marked 'Lesson' under a probe come from oriko's fixes: each one closed a gap a run had shown.

## The rules

| # | Rule | What the tool does | Why it helps the agent | Source |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Raw JSON input | takes the whole input of a command as one JSON object | passes the data as it is, without mapping it to many flags | article |
| 2 | Schema at runtime | prints every command and the exact input each one accepts | looks the format up in the tool itself, not in old docs | article |
| 3 | JSON when piped | answers text at a terminal and JSON when a program reads it | each reader gets what it can read | article |
| 4 | Input hardening | keeps every path inside an allowed folder and every id within allowed characters | a wrong or invented value never reads or writes elsewhere | article |
| 5 | Dry runs | a command that writes or sends says what it would do, and does nothing | tries a command safely first | article |
| 6 | Agent skill | ships a manual for agents with the code | knows the flow, and when to stop and ask the person | article |
| 7 | Checks in layers | checks shape, then meaning, then the costly checks; answers all errors of a layer at once | fixes every real error in one round | oriko |
| 8 | Errors with a hint | each error says where it is and what to change | fixes the input on its own | oriko |
| 9 | All or nothing | a refused or failed command writes nothing | no file is left half changed | oriko |
| 10 | Exit codes 0, 1, 2 | 0 success, 1 a refusal, 2 the tool broke | knows the next step from one number | oriko |
| 11 | Plan before the file | shows the plan of the result before it writes the result | fixes a problem before the costly step | oriko |
| 12 | Hints that run | a refusal names the command that lists the fitting values | runs it and picks a real value, not a guess | oriko |
| 13 | Options that list | an option given without its value lists the values it accepts | finds names and ids in one call | oriko |
| 14 | Next steps | the tool alone says where to start; a success names the commands that can follow, and what each still needs | always knows where to go on | oriko |
| 15 | Nothing passes silently | refuses an unknown command, option, word or input field; a command group alone lists its actions | never acts on a typo | oriko |

## The probes

Run every probe that writes in the scratch folder, and compare the folder before and after.
In the commands below, 'tool' stands for the tool's command and 'cmd' for one of its commands.
Run every command an answer names (in a hint, or as a next step) exactly as it stands; a named command that fails is a gap of its rule.

### 1 Raw JSON input

- Probe: take the command with the most input fields. Pass its whole input as one JSON object,
  through a flag such as '--json', a file, or stdin.
- Met: every command with structured input accepts one JSON object; any flags are shortcuts into the same schema.
- n/a: every command takes at most one or two plain values, such as a single name.

### 2 Schema at runtime

- Probe: run the schema command ('tool schema', 'tool describe', or a JSON form of help).
  Build the input of one command only from that answer, and call the command with it.
- Met: the tool prints every command and its input as data a program can read, and an input
  built only from it is accepted.
- Strong form: the printed schema is the same object the tool validates against, so the two never drift apart.

### 3 JSON when piped

- Probe: run a success and a refusal once at a terminal and once piped ('tool cmd | cat').
  Parse the piped stdout as JSON.
- Met: piped stdout is one JSON document (or one per line for a stream) for successes and refusals alike;
  a flag such as '--output json' forces either form.
- Fails when: banners, progress, color codes or log lines reach stdout; they belong on stderr.
- Lesson: stdout carries the whole answer, also when the tool breaks; a caller never needs stderr to know what happened.
- Lesson: an unknown value of the output flag is refused; the tool never falls back to the other form without saying so.

### 4 Input hardening

- Probe: pass a path that leaves the allowed folder: '../x', an absolute path, a link that points outside.
  Pass an id with a control character, '..', '?', '#' or an encoded form such as '%2e'.
- Met: every path the tool opens or writes resolves, with links followed, inside an allowed folder;
  every id matches a list of allowed characters; anything else is refused with an error.
- Check after each probe that nothing outside the scratch folder changed.
- More probes: an input far larger than any real one, through a file and through stdin; a folder where a file belongs;
  a text field with a line break, a control character or an invisible character; an empty value for the data folder.
- Lesson: a name is looked up among the things that exist, never turned into a path, so no name leads out of the folder.
- Lesson: the kind and the size of a file come from the opened file, and the read stops at the limit;
  a check before the open can be passed by a file that is swapped afterwards.
- Lesson: every text field is one visible line, so no value hides text or forges a line of the tool's output.
- Lesson: a write never follows a link, and goes to the folder the check resolved, not again through the path as given.
- Lesson: a wrong or empty value for the data folder is refused; the tool never falls back to the default folder.

### 5 Dry runs

- Probe: list every command that writes, deletes or sends. Run each with the dry run flag.
- Met: every such command accepts a dry run, changes nothing, and answers what it would write or send,
  after the same checks as the real run.
- Lesson: the dry run answers in the shape of the real answer, with one field that says nothing was written,
  and its next step is the same call without the flag.
- Lesson: the same checks include the target: the folder exists, and no folder stands where the file will go.
- Lesson: a command that replaces stored data refuses unless a flag such as '--replace' is given,
  and answers what the replacement adds, changes and removes, in a dry run too.
- Fails when: a command that only reads accepts the dry run flag and ignores it; rule 15 refuses it.
- n/a: the tool only reads.

### 6 Agent skill

- Probe: look for a skill file (such as 'SKILL.md') or another manual for agents shipped with the tool, and read it.
- Met: the manual says when to use the tool, how to run it, what each answer asks the agent to do
  (by exit code or kind), the flow of a typical task, and when to stop and ask the person.
- Fails when: the manual names commands, options or error codes the tool no longer has.
- Strong form: a test or a generator keeps the manual in step with the tool.
  A program writes the facts that stand in the code (names, options, codes); a person or an agent writes only the prose.

### 7 Checks in layers

- Probe: send an input with two shape errors at once.
  Then an input with the right shape and a reference to something that does not exist.
  Then a valid input that fails the costly check, such as a size limit or a remote call.
- Met: one call answers every error of the first layer that fails, not only the first error;
  a later layer runs only when the earlier ones pass.
- More probes: two wrong option values in one call; a command with several inputs, each one wrong.
- Lesson: the arguments of the call are a layer too. A command that returns at its first wrong option costs one call per mistake.
- Lesson: a command with several inputs answers the issues of all of them, and then stores none.
- Lesson: the command that stores an input runs the same checks as the command that plans the result,
  so a refused input is never stored. One function is the gate; nothing else reads unchecked data.

### 8 Errors with a hint

- Probe: trigger three different refusals and read each error.
- Met: each error carries a stable code, the path to the wrong value, a message for people,
  and a hint that names what to change.
- Fails when: an error is a stack trace, a bare 'invalid input', or prose without a code.
- Lesson: the refusal also says what the failed call left, such as 'Nothing was written'.
  The agent then knows whether it may call again.
- Lesson: a missing value and an empty value of one option get the same hint, from one source.

### 9 All or nothing

- Probe: run a writing command that fails late, after some work: its last check fails, or the target folder is read only.
- Met: a refused or failed command leaves every file as it was.
- Look in the code for writes that happen before the last check; each one is a gap.
- More probes: a command that writes several files, with the last write failing.
- Lesson: all writes of one command go through one function: every file is written whole beside its place, then all are moved in.
- Lesson: two files cannot be moved in one step. When a later move fails, the answer names every file that is already written.
- Lesson: no temporary file is left after a failure.

### 10 Exit codes 0, 1, 2

- Probe: record the exit code of a success, a refusal of bad input, and a fault of the tool
  (an error the tool does not handle).
  Then trigger a failure of the system on a path the caller gave: a folder where a file belongs, a file without the right to read.
- Met: 0 means success, 1 means a refusal (the agent fixes the input, asks the person, or retries),
  2 means the tool broke; the codes never mix.
- Strong form: a refusal also names its kind: 'fix' (the agent can fix the input), 'ask' (only the person can solve it),
  'retry' (a later call may succeed).
- Lesson: a failure of the system on a path the caller gave is a refusal with exit code 1, not a crash with 2.
- Lesson: a missing program the person can install is a refusal of kind 'ask' with the install hint, not a fault of the tool.
- Lesson: one place decides the kind, from two short lists of codes ('ask', 'retry'); every other code is 'fix'.
  A system error nobody listed goes to the person, never to the agent.
- Lesson: one place catches every error nobody expected and answers it in the error shape, as JSON, with exit code 2.

### 11 Plan before the file

- Probe: find the command that writes the main result (a document, a deploy, a migration).
  Look for a command that answers the plan of that result without writing it.
- Met: the plan shows the structure of the result (what lands where, what changes), after the same checks as the write.
- n/a: the tool writes nothing whose result is hard to predict from the input.

### 12 Hints that run

- Probe: refer to a name that does not exist, and give a value outside a fixed set.
- Met: the error names, in a field of its own, a command that lists the fitting values; running that command answers them.
- Lesson: the named command runs as it stands: it carries the data folder and the names of the failed call.
- Lesson: every value in a named command is quoted for the shell, so a name with a space, a quote or a leading dash comes back as itself.
- Fails when: a hint says 'run the command' and the error carries no command, or the values stand only inside the hint's prose.

### 13 Options that list

- Probe: give each option that takes a name, an id or a fixed value without its value.
- Met: the tool answers the values the option accepts, instead of a parse error,
  from the same source its validation uses.
- Lesson: an option with a free value, such as a path, has no list. Given empty, it is refused by name, with a hint that says what to add.
- Lesson: an option that takes a new name answers the names already taken.
- Lesson: two list options left empty in one call are refused; one list per call keeps the answer clear.
- Lesson: a list that depends on another value, such as the parts of one item, names the missing value instead of guessing it.

### 14 Next steps

- Probe: run the tool with no arguments. Then run a success of each main command, and read the answer.
- Met: the tool alone answers where to start; a success names, in a field, the commands that can follow
  and what each one still needs.
- The tool only names a step and never runs one.
- Lesson: the steps follow from the facts of the answer, not only from the command:
  with no item yet the step creates one, and with exactly one item the step names it.
- Lesson: every named command is one the tool knows and carries the data folder and the names of the call. A test checks both.
- Lesson: a step without a command is for the person, such as an upload by hand.
- Lesson: an answer after which nothing follows names no step; an empty or invented step sends the agent in a circle.

### 15 Nothing passes silently

- Probe: call a misspelled command, an unknown option, an extra word, an option of another command,
  and a command group without its action.
  Then an unknown field in the JSON input, one option given twice, a value on a switch, and two selectors that disagree.
- Met: each mistake is refused, all mistakes of one call in one answer; a group alone lists its actions.
- Fails when: the tool ignores an unknown option, or guesses the nearest command and runs it.
- Lesson: the strict mode of many argument parsers stops at the first unknown option.
  To name every mistake, read all arguments in the lenient mode and check each one yourself.
- Lesson: a default is safe only when exactly one candidate exists. With several, refuse and list them.

Then return to the state that sent you here: 2 Check or 6 Verify.
