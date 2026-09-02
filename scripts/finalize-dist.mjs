import { copyFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const distDir = 'dist';

copyFileSync('src/tailwind-bridge.css', join(distDir, 'tailwind.css'));

function removeMacMetadata(dir) {
  if (!existsSync(dir)) return;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entryPath = join(dir, entry.name);
    if (entry.name === '.DS_Store') {
      rmSync(entryPath, { force: true });
    } else if (entry.isDirectory()) {
      removeMacMetadata(entryPath);
    }
  }
}

removeMacMetadata(distDir);
