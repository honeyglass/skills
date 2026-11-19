# docs-readme

docs-readme is a skill for Claude Code that writes or rewrites the README of a repository in one
fixed look: a centred header, a short tagline, a line of links, the badges, and a small icon in a
light and a dark version before each section.

This README is for people. Claude Code reads [SKILL.md](SKILL.md) and the files in
[references/](references/).

## What it does

- **Facts, not guesses**: every sentence rests on a file of the repository or on your answer.
  What no file says, the skill asks you.
- **Your colours**: you name one colour, and the skill writes the icons and the header into
  `brand/` in that colour, light and dark.
- **Scales to many parts**: a repository of several skills or packages gets one line per part
  in its root README, and each part keeps the details in its own README.
- **Front page, not diary**: no todo numbers, plans or decision logs in the README.

## How a run goes

The skill surveys the repository, asks you in short rounds for what is open (the tagline, the
colour, a logo, the principles, the roadmap), writes the brand files, drafts the README, checks
its links, anchors, icons and facts, and hands it to you to read. Nothing is replaced without
your word, and nothing is committed.

## Files

| Path | Holds |
| :--- | :--- |
| [SKILL.md](SKILL.md) | the flow of the skill itself, as a state machine |
| [references/layout.md](references/layout.md) | the header, the sections and their order |
| [references/icons.md](references/icons.md) | the icons, their colours, the header and the license of the icons |

The icons are drawings of [Lucide](https://lucide.dev) under the ISC license; the skill writes
that license beside them.
