#!/usr/bin/env node
// Fixture for an eval: a release notes CLI with typical gaps for an agent. It reads and writes
// only the file notes.json in the working directory, and the file that 'export --file' names.
const fs = require('node:fs');

const FILE = 'notes.json';
const COMMANDS = ['add', 'list', 'remove', 'export'];

function load() {
  return fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : [];
}

function save(notes) {
  fs.writeFileSync(FILE, JSON.stringify(notes, null, 2));
}

function fail() {
  console.log('Error: something is wrong with the input');
  process.exit(1);
}

const args = process.argv.slice(2).filter(arg => !arg.startsWith('--') || arg === '--file');
const typed = args[0] || 'list';
const command = COMMANDS.find(known => known.startsWith(typed));

console.log('release-notes 1.2.0');

try {
  if (command === 'add') {
    const [, version, ...words] = args;
    const notes = load();
    notes.push({ version, text: words.join(' ') });
    save(notes);
    if (!/^\d+\.\d+\.\d+$/.test(version)) fail();
    if (words.length === 0) fail();
    console.log(`Added ${version}`);
  } else if (command === 'list') {
    for (const note of load()) console.log(`${note.version}  ${note.text}`);
  } else if (command === 'remove') {
    save(load().filter(note => note.version !== args[1]));
    console.log('Removed');
  } else if (command === 'export') {
    const target = args[args.indexOf('--file') + 1] || 'NOTES.md';
    const lines = load().map(note => `## ${note.version}\n\n${note.text}\n`);
    fs.writeFileSync(target, lines.join('\n'));
    console.log(`Wrote ${target}`);
  } else {
    fail();
  }
} catch (error) {
  console.log(String(error.stack));
  process.exit(1);
}
