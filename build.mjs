import { build } from 'esbuild';
import { mkdir, copyFile, cp } from 'node:fs/promises';

await build({
  entryPoints: ['src/cards.jsx'],
  outfile: 'assets/cards.js',
  bundle: true,
  format: 'iife',
  jsx: 'automatic',
  minify: true,
  target: ['es2020'],
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'eof'
});
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'styles.css', 'script.js']) {
  await copyFile(file, `dist/${file}`);
}
await cp('assets', 'dist/assets', { recursive: true });
console.log('Built flip cards and deployable static site in dist/');
