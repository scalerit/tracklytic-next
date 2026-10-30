// Verify against a fresh build/pack of the unreleased sibling SDK, then restore the declared release dependency.
const { spawnSync } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { resolve, join } = require('node:path');
const root = resolve(__dirname, '..');
const sdk = resolve(root, '../tl_js');
const temporary = mkdtempSync(join(tmpdir(), 'tracklytic-next-verify-'));
function npm(args, cwd = root, capture = false) {
  const result = spawnSync('npm', args, { cwd, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit' });
  if (result.status !== 0) throw new Error(`npm ${args.join(' ')} failed (${result.status})${capture ? `: ${result.stderr}` : ''}`);
  return result.stdout;
}
let status = 0;
try {
  npm(['ci', '--ignore-scripts', '--no-audit', '--no-fund'], sdk);
  npm(['run', 'build'], sdk);
  const packed = JSON.parse(npm(['pack', '--ignore-scripts', '--json', '--pack-destination', temporary], sdk, true));
  npm(['ci', '--ignore-scripts', '--no-audit', '--no-fund']);
  npm(['install', '--no-save', '--package-lock=false', '--ignore-scripts', '--no-audit', '--no-fund', join(temporary, packed[0].filename)]);
  npm(['test']);
  npm(['exec', '--', 'tsc', '--noEmit', '--strict', '--skipLibCheck', '--jsx', 'react-jsx', '--esModuleInterop', '--target', 'ES2020', '--moduleResolution', 'node', 'example.tsx']);
} catch (error) {
  console.error(error.message);
  status = 1;
} finally {
  try {
    npm(['ci', '--ignore-scripts', '--no-audit', '--no-fund']);
    console.log('Restored the declared public release dependency.');
  } catch (error) {
    console.error(`Could not restore declared release dependencies: ${error.message}`);
    status = 1;
  }
  rmSync(temporary, { recursive: true, force: true });
}
process.exitCode = status;
