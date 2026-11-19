# honeyglass skills

Agent skills, one folder per skill, installed through the skills CLI of skills.sh.

## Folders

- A skill lives in `<family>/<kind>/`, such as `adx/cli/`; its frontmatter name joins both parts,
  `adx-cli`, since a skill name holds no `/`. `skills.sh.json` names each family folder, so the
  skills CLI finds the skills there.
- An install copies the whole skill folder, so it holds only `SKILL.md`, `README.md` and the
  `references/` its `SKILL.md` names.
- A skill reads only files inside its own folder: no link or path in it leads out of the folder.
- `tests/` holds the checks; none of it is part of a skill.

## Writing a skill

- `SKILL.md` is a state machine in the format of `adx/cli/references/agent-skill.md`: one table of
  From, To and When before the first state, numbered states with an outcome line, bounded back
  edges and a STOP that asks the person.
- The writing rules that hold for `SKILL.md` hold for every file in its `references/` too.
- `README.md` of a skill is for people; the agent reads `SKILL.md` and `references/`.
- A skill names no tool, library or file of one machine or one project as a dependency; it may
  name one as an example.

## Checks

Run `pnpm test`, `pnpm run typecheck`, `pnpm run format:check` and `sh tests/e2e/install.e2e.sh`
before a commit.
