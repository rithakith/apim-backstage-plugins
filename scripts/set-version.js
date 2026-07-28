#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const DEP_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
];

const VERSION = process.argv[2];
if (!VERSION || !/^\d+\.\d+\.\d+(-[A-Za-z0-9.-]+)?$/.test(VERSION)) {
  console.error(`ERROR: invalid or missing version argument: "${VERSION}"`);
  console.error('Usage: node scripts/set-version.js <version>');
  process.exit(1);
}

function findPackageJsonFiles() {
  const files = [path.join(ROOT_DIR, 'package.json')];
  const dirs = ['packages', 'plugins'];
  for (const dir of dirs) {
    const dirPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(dirPath)) {
      const subdirs = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const subdir of subdirs) {
        if (subdir.isDirectory()) {
          const pkgPath = path.join(dirPath, subdir.name, 'package.json');
          if (fs.existsSync(pkgPath)) {
            files.push(pkgPath);
          }
        }
      }
    }
  }
  return files;
}

function main() {
  console.log(`Set Version to ${VERSION}\n`);
  const packageFiles = findPackageJsonFiles();
  console.log(`Found ${packageFiles.length} package.json files\n`);

  let changed = 0;
  for (const pkgPath of packageFiles) {
    const relativePath = path.relative(ROOT_DIR, pkgPath);
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    let dirty = false;

    if (pkg.version !== VERSION) {
      pkg.version = VERSION;
      dirty = true;
    }

    // Rewrite internal @rithakith/* deps to ^VERSION
    for (const field of DEP_FIELDS) {
      const deps = pkg[field];
      if (!deps) continue;
      for (const [name, range] of Object.entries(deps)) {
        if (!name.startsWith('@rithakith/')) continue;
        if (range.startsWith('workspace:') || range.startsWith('link:'))
          continue;
        const next = `^${VERSION}`;
        if (deps[name] !== next) {
          deps[name] = next;
          dirty = true;
        }
      }
    }

    if (dirty) {
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
      changed++;
      console.log(`   set ${relativePath} -> ${VERSION}`);
    }
  }

  console.log(
    `\nset-version: updated ${changed} package.json file(s) to ${VERSION}`,
  );
}

main();
