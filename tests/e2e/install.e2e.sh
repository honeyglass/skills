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
# What an install of each skill must hold, and nothing else: no tests.
ADX_CLI='README.md
SKILL.md
references/agent-skill.md
references/design.md
references/rules.md'
DOCS_README='README.md
SKILL.md
references/icons.md
references/layout.md'

main() {
  mkdir "$WORK/source"
  (cd "$ROOT" && git ls-files -z --cached --others --exclude-standard | xargs -0 tar -cf -) |
    (cd "$WORK/source" && tar -xf -)
  lists_every_skill adx-cli docs-readme
  installs_only_the_skill_folder adx-cli "$ADX_CLI"
  installs_only_the_skill_folder docs-readme "$DOCS_README"
  printf 'ok: the skills CLI finds and installs every skill\n'
}

# The run starts in the temporary folder with its own home, so pnpm's cache and store land there
# too and the checkout stays as it was. NO_COLOR keeps the output plain: in CI the CLI colours it,
# and a colour code glued to a skill name hides the name from grep.
skills() {
  (cd "$WORK" && HOME="$WORK/home" NO_COLOR=1 DISABLE_TELEMETRY=1 DO_NOT_TRACK=1 \
    pnpm dlx "$SKILLS_CLI" "$@")
}

fail() {
  printf 'not ok: %s\n' "$1" >&2
  exit 1
}

# skills.sh.json names each family folder, such as ./adx, so the CLI finds adx/cli although it is
# no standard location.
# @arg $@ the names of the skills the list must hold
lists_every_skill() {
  skills add "$WORK/source" --list >"$WORK/list.log" 2>&1 || fail 'the skills CLI cannot list the skills'
  for name in "$@"; do
    grep -qw "$name" "$WORK/list.log" || fail "the skills CLI does not list $name"
  done
}

# @arg $1 the name of the skill
# @arg $2 the files its install must hold, one per line, sorted
installs_only_the_skill_folder() {
  skills add "$WORK/source" --skill "$1" -g -y >"$WORK/add.log" 2>&1 ||
    fail "the skills CLI cannot add $1"
  installed="$WORK/home/.agents/skills/$1"
  grep -qx "name: $1" "$installed/SKILL.md" || fail "the install holds no SKILL.md of $1"
  [ "$(cd "$installed" && find . -type f | sed 's|^\./||' | sort)" = "$2" ] ||
    fail "the install of $1 holds other files than SKILL.md, README.md and references/"
}

main "$@"
