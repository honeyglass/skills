# TODO

Open work on the skills of honeyglass and their package @honeyglass/skills.
<!-- last item number: 3 -->

## Next

## Package

- [ ] #1 Publish @honeyglass/skills on npm: drop "private", add version, files ["adx"], repository and publishConfig to package.json, a test that pins the files of the tarball, and a release workflow that publishes from a tag through npm's trusted publishing with id-token: write on that job only and no secret; the first publish waits for the person's word (added 2026-11-19)
      'package.json', '.github/workflows/'

## adx

- [ ] #2 Settle how adx-cli points to the refusal library of @honeyglass/utils, and to rules a project or the user's agent setup may override, such as error formats or retry bounds, without depending on either: the kinds become an open set with a floor of fix, retry, ask and bug, a project rule that adds a kind or a bound is followed and named in its design line, one that takes away what a probe needs goes to STOP, and the README names @honeyglass/utils as one implementation (added 2026-11-19, from oriko's #18)
      'adx/cli/SKILL.md', 'adx/cli/references/design.md', 'adx/cli/references/rules.md', 'adx/cli/references/agent-skill.md'
- [ ] #3 Work out how best to build an MCP extension as a wrapper around an ADX tool, such as adx/mcp beside adx/cli; start only once #2 is fully done (added 2026-11-19, from oriko's #19)
      after:#2
