import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminDist = path.resolve(__dirname, '..', '..', '..', '..', 'Admin UI', 'dist');
const dest = path.resolve(__dirname, '..', 'dist', 'admin');

async function copy() {
  try {
    await mkdir(dest, { recursive: true });
    await cp(adminDist, dest, { recursive: true });
    console.log(`Copied Admin UI dist from ${adminDist} to ${dest}`);
  } catch (err) {
    console.error('Failed to copy Admin UI dist:', err);
    process.exit(1);
  }
}

copy();
