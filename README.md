<div align="center">

# honeyglass skills

**Agent skills that put an AI agent and a deterministic tool to work together.**

[Quickstart](#quickstart) · [Skills](#skills) · [Development](#development) · [Report an issue](https://github.com/honeyglass/skills/issues)

[![skills.sh](https://skills.sh/b/honeyglass/skills?label=skills.sh&labelColor=2b2d42&color=5cc9a7)](https://skills.sh/honeyglass/skills)
![Agent Driven](https://img.shields.io/badge/Agent_Driven-purple.svg)
![License](https://img.shields.io/github/license/honeyglass/skills?color=green)
![Node](https://img.shields.io/badge/node-24+-brightgreen.svg)
[![CI](https://github.com/honeyglass/skills/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/honeyglass/skills/actions/workflows/ci.yml)

</div>

---

## What is this?

A skill is a folder of instructions that an AI agent, such as Claude Code, loads when a task
needs it. This repository holds skills that each serve one family of work. A skill lives in a
folder named by its family and its kind, such as `adx/cli`, and an install copies only that folder.

### Why these skills?

- 🤝 **Agent and tool together**: the agent judges free text, the tool checks every step it takes.
- 🔁 **Bounded loops**: after a refusal the agent fixes its input at most three times, then asks.
- 🧭 **State machines**: each skill is a table of states and moves, so every step is visible.
- ✅ **Checked in CI**: links, the skill folder, the flow table and a real install, without a model.

## Quickstart

```bash
# One skill, for every agent the skills CLI finds on this machine
npx skills add honeyglass/skills --skill adx-cli -g -y

# Every skill of this repository listed, without installing
npx skills add honeyglass/skills --list
```

The [skills CLI](https://skills.sh) copies the skill folder into the folder of each agent, such as
`~/.claude/skills/adx-cli/`, and a later run updates it. To install by hand, copy the skill folder,
such as [adx/cli/](adx/cli/), into `.claude/skills/adx-cli/` of a project or of your home folder.

## Skills

| Skill | Folder | What it does |
| :--- | :--- | :--- |
| adx-cli | [adx/cli/](adx/cli/README.md) | builds, reviews and fixes a command-line tool that an AI agent drives, against 15 Agent DX rules |
| docs-readme | [docs/readme/](docs/readme/README.md) | writes the README of a repository in one fixed look, with icons in the project's colours |

ADX stands for Agent Developer eXperience: how easy a tool is for an AI agent to use.

## Roadmap

- [ ] A base CLI that adx-cli brings along: a tool built with the skill extends it, so the ADX
      principles hold by construction and a program can check them
- [ ] adx-cli follows the refusal library of `@honeyglass/utils`, and the rules a project may
      override, such as its error format, without depending on either
- [ ] An MCP extension around an ADX tool, `adx/mcp`, beside `adx/cli`
- [ ] Publish on npm as `@honeyglass/skills`

## Development

How to set up, test and propose a change: [CONTRIBUTING.md](CONTRIBUTING.md). Everyone here
follows the [Code of Conduct](CODE_OF_CONDUCT.md). The rules CI follows against supply chain
attacks: [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
