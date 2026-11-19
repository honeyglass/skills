---
reference:
  reads-in: 0 Scope, 4 Draft, 5 Check
  before: the first line of a README that is written or rewritten
  return-to: the state that read it
---

# The layout of the README

Part of states 0 Scope, 4 Draft and 5 Check in `../SKILL.md`.

**The README opens with a centred header and then gives each section one icon, one heading and only the facts it needs.**

## The header

The header is one centred block, then a rule:

```markdown
<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="brand/header-dark.svg">
  <img src="brand/header.svg" alt="NAME" width="520">
</picture>

**TAGLINE**

[Quickstart](#-quickstart) · [Docs](#-docs) · [Report an issue](https://github.com/OWNER/REPO/issues)

BADGES

</div>

---
```

- The tagline is one sentence in bold that says what the project gives a person, not how it works.
- The link line holds three to five links: sections of the README, a main docs page, the issues.
  A heading that opens with an icon gets the anchor '#-' and its words, such as '#-quickstart'.
- A badge stands only for a fact of the fact sheet:

| Badge | Only when |
| :--- | :--- |
| skills.sh | the repository holds an agent skill |
| Agent Driven | an agent skill or an agent drives the project |
| Version | the package file names a version |
| License | a LICENSE file exists |
| Node, Python or another runtime | the project declares the version it needs |
| Coverage | a check in CI enforces the number |
| CI | a CI workflow file exists, linked to its runs |

## A heading

Every section heading is level two and opens with its icon, light and dark:

```markdown
## <picture><source media="(prefers-color-scheme: dark)" srcset="brand/icons/ICON-dark.svg"><img src="brand/icons/ICON.svg" width="24" height="24" alt=""></picture> TITLE
```

A subheading, such as 'Why NAME?', is level three and has no icon.

## The sections

The sections stand in this order. A section without facts stays out; the order of the rest holds.

| Section | Icon | Holds |
| :--- | :--- | :--- |
| What is NAME? | file-text | one paragraph in plain words on what the project does for a person, then 'Why NAME?' |
| Quickstart | terminal | one bash block, each command under a comment line, then at most two short paragraphs |
| The recommended way | star | how a person gets the best result, when the project has one way that works best |
| Your data | folder-lock | where the project keeps a person's files, when it keeps any |
| Compatibility | plug | the platforms, versions and agents the project declares |
| Principles | puzzle | two to four lines, each a bold link to where the principle is explained |
| Docs | book-open | one bold link per docs page, with no sentence after it |
| Roadmap | map | a checkbox list of what comes next, in plain words |
| Development | wrench | one paragraph that links the contributing guide, the code of conduct and the security policy |
| License | scale | the license, linked to the LICENSE file, and who holds the rights to the brand folder |

'Why NAME?' is a list of four to six lines, each an emoji, a bold claim of two to five words, a
colon and one short reason:

```markdown
- 🤖 **Built for AI assistants**: an agent drives the tool on its own, from the input to the file.
```

## Several parts

A repository that holds several skills or packages gives each one line in the root README:

```markdown
## <picture>…</picture> Skills

| Skill | Folder | What it does |
| :--- | :--- | :--- |
| NAME | [FOLDER/](FOLDER/README.md) | one line on what it does for a person |
```

- The heading names the kind of part, such as Skills or Packages, with the icon puzzle.
- The root README says nothing else about one part; its README holds the rest.
- The README of a part holds its own install line, such as
  'npx skills add https://github.com/OWNER/REPO --skill NAME' for a skill, its own sections in
  the order above, and a last line that links back to the root README.
- The root Quickstart shows the one way to install a part, with one part as the example.

## How it reads

- Short sentences, plain words, one term per concept; a term is explained at its first use.
- A sentence a reader cannot act on or check goes.
- A command stands in a code block, never in a sentence.
- No planning history: no todo number, no plan name, no date of a decision.

Then return to the state that sent you here: 0 Scope, 4 Draft or 5 Check.
