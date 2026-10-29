import { build } from 'esbuild';
import { mkdir, copyFile, cp, readFile } from 'node:fs/promises';

// Optional local configuration; Netlify supplies these through its environment.
try {
  const env = await readFile('.env', 'utf8');
  for (const line of env.split(/\r?\n/)) {
    const match = line.match(/^\s*(SUPABASE_URL|SUPABASE_PUBLISHABLE_KEY)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
} catch (error) { if (error.code !== 'ENOENT') throw error; }
const config = { url: process.env.SUPABASE_URL || '', key: process.env.SUPABASE_PUBLISHABLE_KEY || '' };
if (Boolean(config.url) !== Boolean(config.key)) throw new Error('Supply both Supabase URL and public key, or leave both unset for preview.');
if (config.url && !/^https:\/\//.test(config.url)) throw new Error('Supabase URL must use HTTPS.');
if (config.key.startsWith('sb_secret_')) throw new Error('Never put a Supabase secret key in the browser build.');
if (config.key.split('.').length === 3) {
  const payload = JSON.parse(Buffer.from(config.key.split('.')[1], 'base64url').toString());
  if (payload.role !== 'anon') throw new Error('Only the anon JWT key is allowed in the browser build.');
}
await build({
  entryPoints: {portal:'src/portal/App.jsx','home-map':'src/portal/home-map.jsx'},
  outdir: 'assets', bundle: true, format: 'iife', jsx: 'automatic', minify: true,
  target: ['es2020'], define: { 'process.env.NODE_ENV': '"production"', __SUPABASE_CONFIG__: JSON.stringify(config) },
  legalComments: 'eof'
});

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
for (const file of ['index.html', 'styles.css', 'script.js', 'portal.html']) {
  await copyFile(file, `dist/${file}`);
}
await cp('assets', 'dist/assets', { recursive: true });
console.log(`Built Orbis site and portal in dist/ (${config.url ? 'Supabase configured' : 'preview: Supabase not configured'})`);
