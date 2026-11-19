---
reference:
  reads-in: 4 Check
  before: the check of the split, the contracts and the flow
  return-to: 4 Check
---

# The checklist

Part of state 4 Check in `../SKILL.md`.

**Every item is a yes or no question; a no is a finding in the part the item names.**
In a design, a finding goes back to the state that owns the part.
In a review, a finding goes into the result with what can go wrong and the change you propose.

## Split (owned by 1 Split)

| Item | Question |
| :--- | :--- |
| S1 | Does every step have exactly one owner: agent, tool or person? |
| S2 | Does every agent step that writes or sends end in a tool check? |
| S3 | Does every rule that gives one answer per input sit in the tool, not only in the prompt? |
| S4 | Does every step that sends, pays, deletes or states a fact about the person belong to the person or wait for the person's approval? |
| S5 | Does every harm named in 0 Scope have a step that prevents it? |
| S6 | Does the tool check that a version the agent derives holds only what its source holds, in every field with a closed set of values? |

## Tool contracts (owned by 2 Tool)

| Item | Question |
| :--- | :--- |
| T1 | Does every command check arguments, then shape, then meaning, then the costly checks, and list every issue of a layer at once? |
| T2 | Does a refused call change nothing? |
| T3 | Does every refusal carry a code, a path, a message and a hint, and a command where one lists the valid values? |
| T4 | Does every refusal carry a kind: fix, ask, retry or bug? |
| T5 | Does the tool refuse unknown commands, options, fields and values instead of guessing? |
| T6 | Can the agent learn the accepted input from the tool itself, such as a schema command? |
| T7 | Does a call with an effect tell, before a retry, whether the first try took effect? |
| T8 | Do the exit codes say success, refusal and bug apart? |
| T9 | Does a refusal say what the failed call left, and does every command it names run as it stands? |
| T10 | Does a call that replaces stored data need a flag, and answer what it adds, changes and removes? |

## Flow (owned by 3 Flow)

| Item | Question |
| :--- | :--- |
| F1 | Does every state have a number and a name, used the same way everywhere? |
| F2 | Is the transition table complete and placed before the first state? |
| F3 | Does every refusal of kind fix lead back to the state that made the input? |
| F4 | Is every back edge marked and bounded, with a STOP when the bound is reached? |
| F5 | Does every refusal of kind ask or bug, and every missing input, lead to STOP? |
| F6 | Does every state name the outcome at its exit? |
| F7 | Does every step the agent can take match a row of the table? |
| F8 | Is STOP its own state, which asks the person one question and continues only along the answer? |
| F9 | Does every refusal of kind retry return to its own state as a marked, bounded back edge? |
| F10 | Does every state that calls the tool have a row for a refusal of that call, in the state where the call is made? |
| F11 | Does the last state hand the result to the person to read, with every change and every derived value named? |
| F12 | Does every command, option and refusal code the skill names exist in the tool? |
| F13 | Is every When cell at most 60 characters, with no angle brackets and no double quotes? |

Then return to state 4 Check in `../SKILL.md`.
