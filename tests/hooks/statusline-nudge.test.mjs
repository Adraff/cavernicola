import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import url, { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HOOK = path.join(ROOT, 'src/hooks/cavernicola-activate.js');

test('SessionStart statusline command preserves a literal dollar-sign path', {
  skip: process.platform === 'win32' ? 'POSIX shell quoting behavior' : false,
}, (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cavernicola-$CAVERNICOLA_PATH_SEGMENT-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const config = path.join(dir, 'claude');
  fs.mkdirSync(config);
  const env = {
    ...process.env,
    HOME: dir,
    USERPROFILE: dir,
    CLAUDE_CONFIG_DIR: config,
    CAVERNICOLA_DEFAULT_MODE: 'cavernicola',
  };
  delete env.CAVERNICOLA_PATH_SEGMENT;
  delete env.CLAUDE_CODE_ENTRYPOINT;

  const sessionId = '14000000-0000-4000-8000-000000000001';
  const activation = spawnSync(process.execPath, [HOOK], {
    cwd: dir,
    env,
    input: JSON.stringify({ source: 'startup', session_id: sessionId, cwd: dir }),
    encoding: 'utf8',
    timeout: 5000,
  });
  assert.equal(activation.status, 0, activation.stderr);
  const match = activation.stdout.match(/"statusLine":\s*(\{[^\n]+\})/);
  assert.ok(match, activation.stdout);
  const { command } = JSON.parse(match[1]);
  assert.ok(fs.existsSync(path.join(config, 'hooks/cavernicola-statusline.sh')));

  const statusline = spawnSync('/bin/sh', ['-c', command], {
    cwd: dir,
    env,
    input: JSON.stringify({ session_id: sessionId }),
    encoding: 'utf8',
    timeout: 5000,
  });
  assert(statusline.status === 0, statusline.stderr);
  assert.match(statusline.stdout, /\[CAVERNICOLA\]/);
});

// The hook is a plain script with no exports, so the helper is lifted out of
// its source. Static by necessity, and it keeps the three tests below honest
// about reading the shipped file rather than a copy.
function loadShellCommand() {
  const src = fs.readFileSync(path.join(ROOT, 'src/hooks/cavernicola-activate.js'), 'utf8');
  const extracted = src.match(/function shellCommand\(parts, platform = process\.platform\) \{[\s\S]*?\n\}/);
  assert.ok(extracted, 'shellCommand helper not found in cavernicola-activate.js');
  return new Function(`${extracted[0]}; return shellCommand;`)();
}

// Every metacharacter the shell would act on must be escaped in the suggested
// command. Pure string work, so it runs on every platform — this is the
// assertion that covers the win32 branch, which no POSIX runner can execute.
test('nudge shell quoting neutralizes shell metacharacters', () => {
  const shellCommand = loadShellCommand();
  const nasty = '/tmp/a$B`c"d/cavernicola-statusline.sh';
  assert.equal(
    shellCommand(['bash', nasty], 'linux'),
    '"bash" "/tmp/a\\$B\\`c\\"d/cavernicola-statusline.sh"',
  );
  // win32 adds `\` -> `/` on top of the same escaping.
  assert.equal(
    shellCommand(['powershell', '-File', 'C:\\Users\\a$B\\x.ps1'], 'win32'),
    '"powershell" "-File" "C:/Users/a\\$B/x.ps1"',
  );
});

// And the escaped form really does survive a shell. Needs a POSIX shell, so it
// is skipped on Windows exactly like the end-to-end test above; the escaping
// itself is asserted cross-platform by the test before this one.
test('a quoted metacharacter path survives a real POSIX shell', {
  skip: process.platform === 'win32' ? 'needs a POSIX shell' : false,
}, () => {
  const shellCommand = loadShellCommand();
  const nasty = '/tmp/a$B`c"d/cavernicola-statusline.sh';
  const quotedPath = shellCommand([nasty], 'linux');
  const out = spawnSync('/bin/sh', ['-c', `printf '%s' ${quotedPath}`], { encoding: 'utf8' });
  assert.equal(out.error, undefined, String(out.error));
  assert.equal(out.stdout, nasty);
});

// The drift test above pins the helper; this pins the CALL SITES. A fix that
// routes only the branch it was reported against through shellCommand leaves
// the sibling platform reachable, which is how #1400's win32 twin survived its
// first fix. Static, because `isWindows` is decided by process.platform and a
// POSIX runner can never execute the win32 branch end to end.
test('both statusline branches build their command through shellCommand', () => {
  const src = fs.readFileSync(path.join(ROOT, 'src/hooks/cavernicola-activate.js'), 'utf8');
  const block = src.match(/const command = isWindows[\s\S]*?;\n/);
  assert.ok(block, 'statusline command construction not found');
  const text = block[0];
  assert.equal(
    (text.match(/shellCommand\(/g) || []).length,
    2,
    `both branches must call shellCommand, got: ${text}`,
  );
  assert.ok(
    !/\$\{scriptPath\}/.test(text),
    `scriptPath must never be interpolated into a shell string raw: ${text}`,
  );
});
