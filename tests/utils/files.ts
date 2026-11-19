/**
 * The files the tests read: every Markdown file of the repository, and every skill folder.
 *
 * ROOT: the repository root.
 * markdownFiles: every '.md' file outside node_modules and .git, which CI fills.
 * skillFolders: every folder two levels down that holds a SKILL.md, such as 'adx/cli'.
 * filesIn: every file below a folder, as paths relative to it.
 *
 * @example for (const skill of skillFolders()) assert.deepEqual(filesIn(skill), […]);
 */
import { existsSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

export const ROOT = join(import.meta.dirname, '..', '..');

const SKIPPED = new Set(['node_modules', '.git']);

export function filesIn(folder: string) {
  return readdirSync(folder, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => relative(folder, join(entry.parentPath, entry.name)))
    .filter(path => path.split('/').some(part => SKIPPED.has(part)) === false)
    .sort();
}

export function markdownFiles() {
  return filesIn(ROOT)
    .filter(path => path.endsWith('.md'))
    .map(path => join(ROOT, path));
}

export function skillFolders() {
  return filesIn(ROOT)
    .filter(path => path.split('/').length === 3 && path.endsWith('/SKILL.md'))
    .map(path => join(ROOT, path, '..'))
    .filter(folder => existsSync(join(folder, 'SKILL.md')));
}
