import fs from 'fs';
import path from 'path';

export function generateFolderTree(dir, depth = 2, indent = '') {
  if (!fs.existsSync(dir)) return null;

  const stats = fs.statSync(dir);
  if (!stats.isDirectory()) return null;

  let result = `${dir}/\n`;

  function walk(currentPath, level, prefix = '  ') {
    if (level > depth) return;

    const items = fs.readdirSync(currentPath);
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stats = fs.statSync(fullPath);
      result += `${prefix.repeat(level)}├── ${item}\n`;
      if (stats.isDirectory()) {
        walk(fullPath, level + 1, prefix);
      }
    }
  }

  walk(dir, 1);
  return result.trim();
}
