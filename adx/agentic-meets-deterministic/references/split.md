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

The tool check after an agent step is what turns a silent mistake into a refusal the agent sees.

## Common mistakes

| Mistake | Why it fails | Better |
| :--- | :--- | :--- |
| the agent checks its own work, for example with 'double check your answer' | the same model repeats the same blind spot | a tool checks by rule |
| a rule stands only in the agent's prompt | the agent can skip or misread the rule, and nothing notices | the rule moves into the tool |
| the tool guesses, for example a closest match or a default | a wrong input passes as a right one | the tool refuses and lists the valid values |
| the person is asked about everything | the person stops reading the questions | ask only what only the person can decide, one decision per question |
| a step that sends or deletes runs without the person | the step cannot be undone | the person approves the step, or the tool makes it reversible |

## In a review

Take the split from what the skill tells the agent to do and what the tool does now.
Mark a step as a finding when its owner breaks one of the signs above.
A rule that only the prompt states, and no tool checks, is the most common finding.

Then return to state 1 Split in `../SKILL.md`.
