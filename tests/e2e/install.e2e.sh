#!/bin/sh
# @file tests/e2e/install.e2e.sh
# @brief Installs each skill of the last commit through the skills CLI, in an empty home folder.
# @description The test copies the files git tracks or would track, so it sees the working tree
# without node_modules. The skills CLI runs with its telemetry off, so no test run counts as an
# install on skills.sh.
set -eu

ROOT=$(cd "$(dirname "$0")/../.." && pwd -P)
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
# The skills CLI of skills.sh, pinned to a version at least three days old.
SKILLS_CLI='skills@1.8.1'
# What an install of adx-cli must hold, and nothing else: no tests.
EXPECTED='README.md
SKILL.md
references/agent-skill.md
references/design.md
references/rules.md'

main() {
  mkdir "$WORK/source"
  (cd "$ROOT" && git ls-files -z --cached --others --exclude-standard | xargs -0 tar -cf -) |
    (cd "$WORK/source" && tar -xf -)
  lists_every_skill
  installs_only_the_skill_folder
  printf 'ok: the skills CLI finds and installs every skill\n'
}

# The run starts in the temporary folder with its own home, so pnpm's cache and store land there
# too and the checkout stays as it was.
skills() {
  (cd "$WORK" && HOME="$WORK/home" DISABLE_TELEMETRY=1 DO_NOT_TRACK=1 pnpm dlx "$SKILLS_CLI" "$@")
}

fail() {
  printf 'not ok: %s\n' "$1" >&2
  exit 1
}

# skills.sh.json names ./adx, so the CLI finds adx/cli although it is no standard location.
lists_every_skill() {
  skills add "$WORK/source" --list >"$WORK/list.log" 2>&1 || fail 'the skills CLI cannot list the skills'
  grep -qw 'adx-cli' "$WORK/list.log" || fail 'the skills CLI does not list adx-cli'
}

installs_only_the_skill_folder() {
  skills add "$WORK/source" --skill adx-cli -g -y >"$WORK/add.log" 2>&1 ||
    fail 'the skills CLI cannot add adx-cli'
  installed="$WORK/home/.agents/skills/adx-cli"
  grep -qx 'name: adx-cli' "$installed/SKILL.md" || fail 'the install holds no SKILL.md of adx-cli'
  [ "$(cd "$installed" && find . -type f | sed 's|^\./||' | sort)" = "$EXPECTED" ] ||
    fail 'the install holds other files than SKILL.md, README.md and references/'
}

main "$@"
