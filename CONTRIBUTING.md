# Contributing

Pull requests and ideas are welcome. Before you add a skill or change how one behaves,
[open an issue](https://github.com/honeyglass/skills/issues/new) so we can talk it through first.
Everyone here follows the [Code of Conduct](CODE_OF_CONDUCT.md).

## Prerequisites

- **Node 24** or newer.
- **pnpm**, in the version `packageManager` in [package.json](package.json) pins.

Then install:

```sh
pnpm install --frozen-lockfile
```

## How the repository is laid out

Each skill lives in a folder named by its family and its kind, such as [adx/cli/](adx/cli/), and
that folder is what an install copies into a project: its `SKILL.md`, its `README.md` and its
`references/`. The name in the frontmatter of `SKILL.md` joins both parts, such as `adx-cli`,
since a skill name holds no `/`. A skill reads only files inside its own folder.

## Development

```sh
pnpm test                                  # links, skill folders and flow format, no model call
node --test tests/api/flow.api.spec.ts     # one test file
pnpm run typecheck
pnpm run format:check
```

The tests read every skill folder two levels down, such as `adx/cli/`. They check that its links
and its backticked `./` and `../` paths resolve inside the folder, that it holds only `SKILL.md`,
`README.md` and the `references/` its `SKILL.md` names, and that its flow table follows the format
of [agent-skill.md](adx/cli/references/agent-skill.md). They also check that the evals of a skill,
in `evals/<family>/<kind>/`, name only files that exist, and that the sample tools of the evals
still behave as the expected outputs describe.

The evals of a skill, in its `evals/` folder, run by hand with a model and never in CI, since CI
makes no model call. Run them once after a change to `SKILL.md` or its references, and say in the
pull request what they showed.

## Before you open a pull request

Make sure these pass:

```sh
pnpm test
pnpm run typecheck
pnpm run format:check
```

Write each commit message as a [Conventional Commit](https://www.conventionalcommits.org), such as
`fix(adx-cli): bound the retries of a refusal`. The description of a pull request is its commit
message, so it says what changes and why.

## License

By contributing, you agree that your contribution is licensed under the [MIT License](LICENSE),
the license of this repository.
