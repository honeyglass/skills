# TODO

Open work on the skills of honeyglass and their package @honeyglass/skills.
<!-- last item number: 10 -->

## Next

## Package

- [ ] #1 Publish @honeyglass/skills on npm: drop "private", add version, files ["adx"], repository and publishConfig to package.json, a test that pins the files of the tarball, and a release workflow that publishes from a tag through npm's trusted publishing with id-token: write on that job only and no secret; the first publish waits for the person's word (added 2026-11-19)
      'package.json', '.github/workflows/'

## adx

- [ ] #2 Settle how adx-cli points to the refusal library of @honeyglass/utils, and to rules a project or the user's agent setup may override, such as error formats or retry bounds, without depending on either: the kinds become an open set with a floor of fix, retry, ask and bug, a project rule that adds a kind or a bound is followed and named in its design line, one that takes away what a probe needs goes to STOP, and the README names @honeyglass/utils as one implementation (added 2026-11-19, from oriko's #18)
      'adx/cli/SKILL.md', 'adx/cli/references/design.md', 'adx/cli/references/rules.md', 'adx/cli/references/agent-skill.md'
- [ ] #3 Work out how best to build an MCP extension as a wrapper around an ADX tool, such as adx/mcp beside adx/cli; start only once #2 is fully done (added 2026-11-19, from oriko's #19)
      after:#2
- [ ] #8 Work out a base CLI that adx-cli brings along, which a tool built with the skill extends: it fixes the ADX principles in code, such as the strict parser, one JSON answer, refusals with a kind and exit codes 0, 1 and 2, dry runs and the schema command, so they hold by construction and can be checked deterministically instead of by an agent probing each tool; weigh it against the refusal library of #2 (added 2026-11-19)
      'package.json', 'adx/'

## Docs

- [x] #9 Build a skill that writes a README in the style of oriko's: a centred header with the tagline, links and badges, a light and a dark icon before each section heading, and the sections What is it, Quickstart, Principles, Docs, Roadmap, Development and License; a repository that holds several skills or packages gets a short overview that names each one in a line and links to its own README (added 2026-11-19, done 2026-11-19)
      'docs/readme/'
- [ ] #10 Rewrite the README of this repository with the skill of #9: icons before the headings, text for every skill instead of adx-cli alone, and in each skill's README its install line, such as 'npx skills add https://github.com/honeyglass/skills --skill adx-cli' (added 2026-11-19)
      after:#9
      'README.md', 'adx/cli/README.md'
