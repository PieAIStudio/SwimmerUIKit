#!/usr/bin/env node
/**
 * Rewrite a consumer's UIKit 3.x names to the 4.0 alpha.2 names.
 * This directory is deliberately outside package.json#files and never ships.
 * Run with --write to edit files; without it the command is a dry run.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const map = JSON.parse(
  readFileSync(path.join(root, 'migration/uikit-4-alpha-2/name-map.json'), 'utf8'),
);
const write = process.argv.includes('--write');
const check = process.argv.includes('--check');
if (write && check) throw new Error('Choose --write or --check, not both');
const targets = process.argv.slice(2).filter((argument) => !argument.startsWith('--'));
const ignored = new Set([
  '.git',
  'node_modules',
  'dist',
  '.next',
  '.scratch',
  '.reports',
  'migration',
]);
const textExtensions = new Set([
  '.cjs',
  '.css',
  '.html',
  '.js',
  '.jsx',
  '.mjs',
  '.md',
  '.scss',
  '.ts',
  '.tsx',
  '.vue',
]);
const files = [];
const collect = (target) => {
  const absolute = path.resolve(target);
  const stat = statSync(absolute);
  if (stat.isFile()) {
    if (textExtensions.has(path.extname(absolute))) files.push(absolute);
    return;
  }
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    collect(path.join(absolute, entry.name));
  }
};
for (const target of targets.length ? targets : ['.']) collect(target);

const replacements = [
  ...map.publicNames
    .sort((a, b) => b.old.length - a.old.length)
    .map(({ old, new: next }) => ({ old, next, pattern: new RegExp(`\\b${old}\\b`, 'g') })),
  ...[...(map.tokens ?? []), ...(map.localTokens ?? [])]
    .sort((a, b) => b.old.length - a.old.length)
    .map(({ old, new: next }) => ({ old, next, pattern: new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g') })),
];

let changedFiles = 0;
let replacementCount = 0;
for (const file of files) {
  const before = readFileSync(file, 'utf8');
  let after = before;
  for (const replacement of replacements) {
    const matches = after.match(replacement.pattern);
    if (!matches) continue;
    replacementCount += matches.length;
    after = after.replace(replacement.pattern, replacement.next);
  }
  if (after === before) continue;
  changedFiles += 1;
  if (write) writeFileSync(file, after);
}

const mode = write ? 'wrote' : 'would rewrite';
console.log(JSON.stringify({ mode, files: files.length, changedFiles, replacements: replacementCount }, null, 2));
if (check && replacementCount > 0) process.exitCode = 1;
