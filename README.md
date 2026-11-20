<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="brand/header-dark.svg">
  <img src="brand/header.svg" alt="honeyglass skills" width="520">
</picture>

**Agent skills that each do one job, check every step and take every fact from you.**

[Quickstart](#-quickstart) · [Skills](#-skills) · [Development](#-development) · [Report an issue](https://github.com/honeyglass/skills/issues)

[![skills.sh](https://skills.sh/b/honeyglass/skills?label=skills.sh)](https://skills.sh/honeyglass/skills)
![Agent Driven](https://img.shields.io/badge/Agent_Driven-adbac7.svg)
![License](https://img.shields.io/github/license/honeyglass/skills)
![Node](https://img.shields.io/badge/node-24+-adbac7.svg)
[![CI](https://github.com/honeyglass/skills/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/honeyglass/skills/actions/workflows/ci.yml)

</div>

---

## <picture><source media="(prefers-color-scheme: dark)" srcset="brand/icons/file-text-dark.svg"><img src="brand/icons/file-text.svg" width="24" height="24" alt=""></picture> What is honeyglass skills?

A skill is a folder of instructions that an AI agent, such as Claude Code, loads when a task
needs it. This repository holds skills, each in a folder named by its family and its kind, such
as `adx/cli`. An install copies only the folder of the skill you pick.

### Why honeyglass skills?

- 🧭 **State machines**: each skill is a table of states and moves, so every step is visible.
- 🔁 **Bounded loops**: after a refusal the agent tries again at most three times, then asks you.
- 🙋 **Facts from you**: a skill asks for what no file says, and invents nothing.
- ✅ **Checked in CI**: links, the skill folder, the flow table and a real install, without a model.

## <picture><source media="(prefers-color-scheme: dark)" srcset="brand/icons/terminal-dark.svg"><img src="brand/icons/terminal.svg" width="24" height="24" alt=""></picture> Quickstart

```bash
# One skill, for the agents the skills CLI finds on this machine
npx skills add https://github.com/honeyglass/skills --skill adx-cli

# Every skill of this repository listed, without installing
npx skills add https://github.com/honeyglass/skills --list
```

The [skills CLI](https://skills.sh) asks for which agents to install, and whether for this project
or for your user. To install by hand, copy the skill folder, such as [adx/cli/](adx/cli/), into
`.claude/skills/adx-cli/` of a project or of your home folder.

## <picture><source media="(prefers-color-scheme: dark)" srcset="brand/icons/package-dark.svg"><img src="brand/icons/package.svg" width="24" height="24" alt=""></picture> Skills

| Skill | Folder | What it does |
| :--- | :--- | :--- |
| adx-cli | [adx/cli/](adx/cli/README.md) | builds, reviews and fixes a command-line tool that an AI agent drives, against 16 Agent DX rules |
| docs-readme | [docs/readme/](docs/readme/README.md) | writes the README of a repository in one fixed look, with icons in the project's colours |

## <picture><source media="(prefers-color-scheme: dark)" srcset="brand/icons/puzzle-dark.svg"><img src="brand/icons/puzzle.svg" width="24" height="24" alt=""></picture> Principles

- **[Agentic meets deterministic](adx/cli/README.md#agentic-meets-deterministic)**: the agent
  judges, the tool checks every step, and the skill fixes the order.
- **[State machines](adx/cli/references/agent-skill.md)**: numbered states, one table of moves,
  and a stop that asks the person.
- **[Safe dependencies](SECURITY.md)**: everything pinned to a full commit id, and a supply
  check before every install in CI.

## <picture><source media="(prefers-color-scheme: dark)" srcset="brand/icons/map-dark.svg"><img src="brand/icons/map.svg" width="24" height="24" alt=""></picture> Roadmap

- [ ] A base CLI that adx-cli brings along: a tool built with the skill extends it, so the ADX
      principles hold by construction and a program can check them
- [ ] adx-cli follows the refusal library of `@honeyglass/utils`, and the rules a project may
      override, such as its error format, without depending on either
- [ ] An MCP extension around an ADX tool, `adx/mcp`, beside `adx/cli`
- [ ] Publish on npm as `@honeyglass/skills`

## <picture><source media="(prefers-color-scheme: dark)" srcset="brand/icons/wrench-dark.svg"><img src="brand/icons/wrench.svg" width="24" height="24" alt=""></picture> Development

How to set up, test and propose a change: [CONTRIBUTING.md](CONTRIBUTING.md). Everyone here
follows the [Code of Conduct](CODE_OF_CONDUCT.md). The rules CI follows against supply chain
attacks: [SECURITY.md](SECURITY.md).

## <picture><source media="(prefers-color-scheme: dark)" srcset="brand/icons/scale-dark.svg"><img src="brand/icons/scale.svg" width="24" height="24" alt=""></picture> License

[MIT](LICENSE). The header and the icon tiles in [`brand/`](brand/) are not covered by this
license; all rights to them stay with Serkan Sipahi. The drawings on the tiles come from
[Lucide](https://lucide.dev) under the ISC license, some from Feather under the MIT license:
[brand/icons/LICENSE](brand/icons/LICENSE).
