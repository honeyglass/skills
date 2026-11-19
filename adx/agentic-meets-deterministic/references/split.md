---
reference:
  reads-in: 1 Split
  before: the first split of a run
  return-to: 1 Split
---

# Splitting the work

Part of state 1 Split in `../SKILL.md`.

**Each step gets exactly one owner: the agent, the tool or the person.**

## How to tell the owners apart

| Owner | Sign | Examples |
| :--- | :--- | :--- |
| agent | the input is free text, or the answer has more than one good form | read an email, pick the relevant lines, word a summary, ask a question |
| tool | a written rule gives one answer for one input | a date format, a sum, a length limit, a unique number, a file that fits its pages |
| person | only the person knows the fact, or the step cannot be undone | a fact about the person, a payment, sending a message, deleting data, raising a limit |

A question that helps: would two careful people, given the same rule, always give the same answer?
When yes, the step belongs to the tool.
When the answer depends on reading or taste, the step belongs to the agent.
When the answer depends on what the person wants or knows, the step belongs to the person.

## Mixed steps

**A step that needs both judgment and a rule splits into two steps: the agent proposes, the tool checks.**

| Mixed step | Agent proposes | Tool checks |
| :--- | :--- | :--- |
| book an invoice | reads the PDF and fills the fields | gross equals net plus tax, the tax rate is allowed, the invoice number is new |
| shorten a text to fit a page | picks what to cut and rewords | the text fits, every kept fact stands in the source |
| plan a database change | writes the migration | the migration parses, has not run yet, and has a way back |
| triage a support ticket | picks the category and the urgency | the category exists, the urgency is one of the allowed values |
| tailor a version of a source text | picks what to keep, reorders and shortens | every list item of the version stands in the source, and the version fits its limit |
| keep docs in step with the code | writes one sentence per file | the file names and links come from the code; a missing sentence or a dead link fails the check |

The tool check after an agent step is what turns a silent mistake into a refusal the agent sees.

## A version may only select from its source

**When the agent derives a version from a source the person owns, the tool checks that the version adds nothing.**

A summary, a tailored copy or a shortened report is a version of a source.
The agent's typical mistake is to add what the task asks for and the source does not hold.

- Where the source holds a closed list (names, skills, line items), the tool lets the version keep, drop and reorder items.
  An item the source does not hold is refused, with the item named.
- Adding the item is a change to the source, and the source belongs to the person: the flow stops and asks.
- Where the version may reword free text, no rule can tell a rewording from a new claim.
  That part stays with the agent as a prohibition with a test the agent can apply
  (a verb, a duty or a name that only the outside text uses is a new claim),
  and with the person, who reads the result at the end.
- Name the cause, then check every field the cause covers.
  A check on one list leaves the same mistake open in the list next to it.

Example: a tailored copy lists a skill the source never names; the tool refuses the item and names it.

## From free text to a fixed value

When the agent must turn the person's words into a fixed value, such as a level from 1 to 5, give it a table from words to values.
A word outside the table gives no value; the agent leaves the field open or asks.
The agent reports each value it derived, with the word it came from, so the person can correct it.

## Facts from the code, prose from the agent

A fact that stands in the code, such as a file name, an option or a link between two modules, is written into a doc by a program.
The agent writes only the sentences, and a check fails when the two drift apart.
The program hands each gap to the writer as data: the file that lacks a sentence, with its comments.

## Common mistakes

| Mistake | Why it fails | Better |
| :--- | :--- | :--- |
| the agent checks its own work, for example with 'double check your answer' | the same model repeats the same blind spot | a tool checks by rule |
| a rule stands only in the agent's prompt | the agent can skip or misread the rule, and nothing notices | the rule moves into the tool |
| the tool guesses, for example a closest match or a default | a wrong input passes as a right one | the tool refuses and lists the valid values |
| the person is asked about everything | the person stops reading the questions | ask only what only the person can decide, one decision per question |
| a step that sends or deletes runs without the person | the step cannot be undone | the person approves the step, or the tool makes it reversible |
| a rule is checked for one field, and the fields beside it stay open | the same mistake moves to the open field | name the cause and check every field it covers |
| the agent runs an installer or a download the tool's hint names | code from the network runs without the person's decision | the agent passes the hint on; the person installs |

## In a review

Take the split from what the skill tells the agent to do and what the tool does now.
Mark a step as a finding when its owner breaks one of the signs above.
A rule that only the prompt states, and no tool checks, is the most common finding.

Then return to state 1 Split in `../SKILL.md`.
