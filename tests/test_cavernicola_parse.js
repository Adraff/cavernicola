#!/usr/bin/env node
// Tests for the shared mode-change parser (#602), src/hooks/cavernicola-parse.js.
// cavernicola-mode-tracker.js and the opencode plugin both consume this module —
// these tests exercise it directly (unit-level) and also check that its
// verdicts line up with what the real tracker.js hook does for the same
// prompts (parity), so the two callers can't silently drift apart again.
//
// Run: node tests/test_cavernicola_parse.js

const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');
const { spawnSync } = require('child_process');

const { parseModeChange, INDEPENDENT_MODES } = require('../src/hooks/cavernicola-parse');

const HOOK_PATH = path.resolve(__dirname, '..', 'src', 'hooks', 'cavernicola-mode-tracker.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed++;
    console.error(`  ✗ ${name}`);
    console.error(`    ${e.message}`);
  }
}

console.log('cavernicola-parse (shared mode-change parser) tests\n');

const defaultCavernicola = { getDefaultMode: () => 'cavernicola' };
const defaultOff = { getDefaultMode: () => 'off' };
const MODE_OF = {
  '/cavernicola-extremo': 'cavernicola-extremo', '/cavernicola:cavernicola-extremo': 'cavernicola-extremo',
  '/cavernicola-extremo': 'cavernicola-extremo', '/cavernicola:cavernicola-extremo': 'cavernicola-extremo',
};

test('status uses one read-only verdict for literal and expanded commands', () => {
  const options = { getDefaultMode: () => { throw new Error('status must not resolve a default'); } };
  for (const prompt of ['/cavernicola status', '/cavernicola:cavernicola status', '/cavernicola status.']) {
    assert.deepStrictEqual(parseModeChange(prompt, options), { action: 'status' });
  }
  assert.deepStrictEqual(parseModeChange('Activate cavernicola mode: status\n\nIf no argument given, use cavernicola.', {
    ...options, expandedTpl: true,
  }), { action: 'status' });
  assert.strictEqual(parseModeChange('What does `/cavernicola status` do?', options), null);
});

test('manual startup policy permits explicit activation but is not a mode', () => {
  const options = { getDefaultMode: () => 'manual', expandedTpl: true };
  for (const prompt of ['/cavernicola', 'talk like cavernicola', 'Activate cavernicola mode: \n\nIf no argument given, use cavernicola.']) {
    assert.deepStrictEqual(parseModeChange(prompt, options), { action: 'set', mode: 'cavernicola' });
  }
  assert.deepStrictEqual(parseModeChange('/cavernicola manual', options), { action: 'unresolved' });
  assert.strictEqual(parseModeChange('ordinary request', options), null);
});

// ---------- basic unit coverage ----------

test('empty/whitespace prompt is a no-op', () => {
  assert.strictEqual(parseModeChange('', defaultCavernicola), null);
  assert.strictEqual(parseModeChange('   ', defaultCavernicola), null);
});

test('/cavernicola-extremo and /cavernicola-extremo set their own mode, bare or namespaced', () => {
  for (const [prompt, mode] of [
    ['/cavernicola-extremo', 'cavernicola-extremo'], ['/cavernicola:cavernicola-extremo', 'cavernicola-extremo'],
    ['/cavernicola-extremo', 'cavernicola-extremo'], ['/cavernicola:cavernicola-extremo', 'cavernicola-extremo'],
  ]) {
    assert.deepStrictEqual(parseModeChange(prompt, defaultCavernicola), { action: 'set', mode }, prompt);
    // A configured default never overrides the command's own mode.
    assert.deepStrictEqual(parseModeChange(prompt, defaultOff), { action: 'set', mode }, prompt);
  }
});

test('/cavernicola <arg> accepts the three mode names', () => {
  for (const mode of ['cavernicola', 'cavernicola-extremo', 'cavernicola-extremo']) {
    assert.deepStrictEqual(parseModeChange('/cavernicola ' + mode, defaultCavernicola), { action: 'set', mode });
  }
});

test('legacy level names still parse as aliases of the three modes', () => {
  for (const [arg, mode] of [
    ['lite', 'cavernicola'], ['full', 'cavernicola'], ['ultra', 'cavernicola-extremo'],
    ['extremo', 'cavernicola-extremo'], ['extremo', 'cavernicola-extremo'],
    ['extremo', 'cavernicola-extremo'], ['extremo', 'cavernicola-extremo'],
  ]) {
    assert.deepStrictEqual(parseModeChange('/cavernicola ' + arg, defaultCavernicola), { action: 'set', mode }, arg);
  }
});

test('/cavernicola-extremo and /cavernicola-extremo take the same off/status words as /cavernicola', () => {
  for (const cmd of ['/cavernicola-extremo', '/cavernicola:cavernicola-extremo', '/cavernicola-extremo', '/cavernicola:cavernicola-extremo']) {
    for (const word of ['off', 'stop', 'disable', 'off.']) {
      assert.deepStrictEqual(parseModeChange(`${cmd} ${word}`, defaultCavernicola), { action: 'clear' }, `${cmd} ${word}`);
    }
    assert.deepStrictEqual(parseModeChange(`${cmd} status`, defaultCavernicola), { action: 'status' }, `${cmd} status`);
    assert.deepStrictEqual(
      parseModeChange(`${cmd} please`, defaultCavernicola),
      { action: 'set', mode: MODE_OF[cmd] },
      `${cmd} please`
    );
  }
});

test('/cavernicola-extremo-like prefixes are not the command', () => {
  assert.strictEqual(parseModeChange('/cavernicola-extremoman', defaultCavernicola), null);
  assert.strictEqual(parseModeChange('/cavernicola-extremo-stats', defaultCavernicola), null);
});

test('bare /cavernicola activates at the configured default', () => {
  assert.deepStrictEqual(parseModeChange('/cavernicola', defaultCavernicola), { action: 'set', mode: 'cavernicola' });
});

test('bare /cavernicola with an off default clears instead of setting mode "off"', () => {
  assert.deepStrictEqual(parseModeChange('/cavernicola', defaultOff), { action: 'clear' });
});

test('/cavernicola off|stop|disable all clear', () => {
  assert.deepStrictEqual(parseModeChange('/cavernicola off', defaultCavernicola), { action: 'clear' });
  assert.deepStrictEqual(parseModeChange('/cavernicola stop', defaultCavernicola), { action: 'clear' });
  assert.deepStrictEqual(parseModeChange('/cavernicola disable', defaultCavernicola), { action: 'clear' });
});

// A bogus level is now REPORTED rather than swallowed (#838), but the original
// danger these two guard against is unchanged: it must never activate the
// default. 'unresolved' carries no mode, and applyModeChange/the tracker act
// only on 'set'/'clear'.
test('bogus level is unresolved — never falls through to the default', () => {
  const verdict = parseModeChange('/cavernicola not-a-real-level', defaultCavernicola);
  assert.deepStrictEqual(verdict, { action: 'unresolved' });
  assert.strictEqual(verdict.mode, undefined, 'must not carry a mode');
});

test('independent modes are not reachable via /cavernicola <arg>', () => {
  const verdict = parseModeChange('/cavernicola commit', defaultCavernicola);
  assert.strictEqual(verdict.action, 'unresolved');
  assert.strictEqual(verdict.mode, undefined, 'must not activate the mode');
});

// #838: punctuation glued to the level matched no mode, left the level
// untouched, and said nothing. Only parts[1] is read, so trailing WORDS were
// already harmless — it is the glued character that broke it.
test('punctuation glued to the level still resolves (#838)', () => {
  for (const prompt of ['/cavernicola ultra;', '/cavernicola ultra.', '/cavernicola ultra!', '/cavernicola ultra,']) {
    assert.deepStrictEqual(parseModeChange(prompt, defaultCavernicola), { action: 'set', mode: 'cavernicola-extremo' }, prompt);
  }
});

test('punctuation glued to a hyphenated level still resolves (#838)', () => {
  assert.deepStrictEqual(
    parseModeChange('/cavernicola extremo.', defaultCavernicola),
    { action: 'set', mode: 'cavernicola-extremo' }
  );
  assert.deepStrictEqual(
    parseModeChange('/cavernicola extremo,', defaultCavernicola),
    { action: 'set', mode: 'cavernicola-extremo' }
  );
});

test('punctuation glued to off still deactivates (#838)', () => {
  assert.deepStrictEqual(parseModeChange('/cavernicola off.', defaultCavernicola), { action: 'clear' });
});

test('trailing words after the level remain harmless', () => {
  assert.deepStrictEqual(
    parseModeChange('/cavernicola ultra; still too verbose', defaultCavernicola),
    { action: 'set', mode: 'cavernicola-extremo' }
  );
});

// `/cavernicola ?` is plausibly someone asking for help. Bare `/cavernicola` still
// activates; an argument that was PRESENT but normalized away must not.
test('a punctuation-only argument does not activate', () => {
  assert.deepStrictEqual(parseModeChange('/cavernicola ?', defaultCavernicola), { action: 'unresolved' });
  assert.deepStrictEqual(parseModeChange('/cavernicola', defaultCavernicola), { action: 'set', mode: 'cavernicola' });
});

test('/cavernicola-commit, /cavernicola-revision, /cavernicola-comprimir set independent modes', () => {
  assert.deepStrictEqual(parseModeChange('/cavernicola-commit', defaultCavernicola), { action: 'set', mode: 'commit' });
  assert.deepStrictEqual(parseModeChange('/cavernicola-revision', defaultCavernicola), { action: 'set', mode: 'review' });
  assert.deepStrictEqual(parseModeChange('/cavernicola-comprimir', defaultCavernicola), { action: 'set', mode: 'compress' });
});

test('namespaced /cavernicola:cavernicola-* variants are recognized', () => {
  assert.deepStrictEqual(parseModeChange('/cavernicola:cavernicola-commit', defaultCavernicola), { action: 'set', mode: 'commit' });
  assert.deepStrictEqual(parseModeChange('/cavernicola:cavernicola-revision', defaultCavernicola), { action: 'set', mode: 'review' });
  assert.deepStrictEqual(parseModeChange('/cavernicola:cavernicola', defaultCavernicola), { action: 'set', mode: 'cavernicola' });
});

test('natural-language activation', () => {
  assert.deepStrictEqual(parseModeChange('activate cavernicola', defaultCavernicola), { action: 'set', mode: 'cavernicola' });
  assert.deepStrictEqual(parseModeChange('talk like a cavernicola', defaultCavernicola), { action: 'set', mode: 'cavernicola' });
});

test('brevity triggers activate', () => {
  assert.deepStrictEqual(parseModeChange('be brief', defaultCavernicola), { action: 'set', mode: 'cavernicola' });
  assert.deepStrictEqual(parseModeChange('fewer tokens please', defaultCavernicola), { action: 'set', mode: 'cavernicola' });
});

test('scoped brevity ("be brief in the summary") does not activate', () => {
  assert.strictEqual(parseModeChange('be brief in the summary section', defaultCavernicola), null);
});

test('questions about cavernicola do not activate', () => {
  assert.strictEqual(parseModeChange('what is cavernicola mode?', defaultCavernicola), null);
});

// #187: the gap between the activation verb and "cavernicola" was any 40
// characters, so ordinary prose that merely mentioned cavernicola downstream of a
// common verb switched the mode on. The gap is a whitelist of determiners and
// particles now.
test('prose with a verb and a downstream "cavernicola" does not activate (#187)', () => {
  for (const prompt of [
    'i want to start building a cavernicola-themed game',
    'help me start a cavernicola fire for the demo scene',
    'we should use the sprite sheet from the cavernicola assets folder',
    'switch to the branch that renames the cavernicola skill directory',
  ]) {
    assert.strictEqual(parseModeChange(prompt, defaultCavernicola), null, prompt);
  }
});

test('real activation phrasings still activate (positive control, #187)', () => {
  for (const prompt of [
    'activate cavernicola',
    'activate cavernicola mode',
    'enable the cavernicola mode',
    'turn on cavernicola',
    'turn on the cavernicola mode please',
    'switch to cavernicola',
    'i want cavernicola mode',
    'give me cavernicola',
    'please use cavernicola now',
    'talk like cavernicola',
    'talk like a cavernicola',
  ]) {
    assert.deepStrictEqual(parseModeChange(prompt, defaultCavernicola), { action: 'set', mode: 'cavernicola' }, prompt);
  }
});

// #187: "don't activate cavernicola" activated. The guard is activation-only —
// see the asymmetry note in cavernicola-parse.js and the #838 test below, which
// keeps "don't stop cavernicola" deactivating on purpose.
test('a negated activation does not activate (#187)', () => {
  for (const prompt of [
    "don't activate cavernicola",
    'do not turn on cavernicola',
    'never enable cavernicola mode',
    "i don't want cavernicola for this file",
    "please don't talk like a cavernicola",
    'no need to use cavernicola here',
  ]) {
    assert.strictEqual(parseModeChange(prompt, defaultCavernicola), null, prompt);
  }
});

// The negator does not always sit next to the verb it negates: "don't want you
// to use cavernicola" negates `want`, while the trigger that actually matches is
// the `use` in the complement clause. Scoping the guard to the clause rather
// than to a fixed word window is what catches these.
test('a negated activation with a complement clause does not activate (#187)', () => {
  for (const prompt of [
    "i don't want you to use cavernicola",
    "don't ask me to enable cavernicola",
    "please don't switch me to cavernicola",
    "i don't need you to talk like a cavernicola",
    'never ask me to turn on cavernicola mode',
  ]) {
    assert.strictEqual(parseModeChange(prompt, defaultCavernicola), null, prompt);
  }
});

// The other half of clause scoping: a negation must not swallow a LATER,
// independent positive command. Widening the guard to "a negator appears
// anywhere earlier in the prompt" would break exactly these.
test('a negated clause does not suppress a later activation (#187)', () => {
  for (const prompt of [
    "don't use vim, activate cavernicola",
    "i don't like verbose output. activate cavernicola",
    "never mind the linter — turn on cavernicola",
  ]) {
    assert.deepStrictEqual(parseModeChange(prompt, defaultCavernicola), { action: 'set', mode: 'cavernicola' }, prompt);
  }
});

test('natural-language deactivation', () => {
  assert.deepStrictEqual(parseModeChange('turn cavernicola mode off', defaultCavernicola), { action: 'clear' });
  assert.deepStrictEqual(parseModeChange('normal mode', defaultCavernicola), { action: 'clear' });
});

// "go back to normal mode" and "go to normal mode" are ordinary switch-back
// phrasings, but the verb alternation listed "go" and "back to" as separate,
// mutually exclusive prefixes, so "go back to" matched nothing and "go to" had
// no alternative at all. Both deactivations were silently dropped, leaving the
// user in the mode with no feedback.
test('"go back to normal mode" / "go to normal mode" deactivate like the other switch-back phrasings', () => {
  for (const prompt of [
    'go back to normal mode',
    'go to normal mode',
    'please go back to normal mode',
    'go back to normal mode and summarize the diff',
  ]) {
    assert.deepStrictEqual(parseModeChange(prompt, defaultCavernicola), { action: 'clear' }, prompt);
  }
});

test('vim "normal mode" (no cavernicola context) does not deactivate', () => {
  assert.strictEqual(parseModeChange('how do I exit vim normal mode', defaultCavernicola), null);
});

test('INDEPENDENT_MODES is exported and matches the known set', () => {
  assert.deepStrictEqual([...INDEPENDENT_MODES].sort(), ['commit', 'compress', 'review']);
});

// ---------- skipNaturalLanguage (foreign command envelopes, #537) ----------

test('skipNaturalLanguage suppresses activation/deactivation matching entirely', () => {
  assert.strictEqual(
    parseModeChange('please activate cavernicola mode now', { ...defaultCavernicola, skipNaturalLanguage: true }),
    null
  );
  assert.strictEqual(
    parseModeChange('stop cavernicola', { ...defaultCavernicola, skipNaturalLanguage: true }),
    null
  );
});

test('skipNaturalLanguage still lets literal slash commands through', () => {
  assert.deepStrictEqual(
    parseModeChange('/cavernicola ultra', { ...defaultCavernicola, skipNaturalLanguage: true }),
    { action: 'set', mode: 'cavernicola-extremo' }
  );
});

// ---------- unwrapQuotes (opencode `run` path) ----------

test('unwrapQuotes strips a symmetric quote wrapper before matching', () => {
  assert.deepStrictEqual(
    parseModeChange('"/cavernicola lite"', { ...defaultCavernicola, unwrapQuotes: true }),
    { action: 'set', mode: 'cavernicola' }
  );
});

test('without unwrapQuotes, a quoted command does not match', () => {
  assert.strictEqual(parseModeChange('"/cavernicola lite"', defaultCavernicola), null);
});

// ---------- expandedTpl (opencode's expanded command-template bodies) ----------

test('expandedTpl recognizes the generic "/cavernicola <arg>" template', () => {
  assert.deepStrictEqual(
    parseModeChange('Activate cavernicola mode: ultra', { ...defaultCavernicola, expandedTpl: true }),
    { action: 'set', mode: 'cavernicola-extremo' }
  );
});

test('expandedTpl: empty level (bare "/cavernicola", multi-line template head) uses the default', () => {
  // The real commands/cavernicola.md template puts `Activate cavernicola mode:
  // $ARGUMENTS` on its own line, followed by a blank line and then fixed
  // boilerplate ("If no argument given, use cavernicola. If \"off\", deactivate.").
  // With $ARGUMENTS empty, whitespace-collapse used to merge that boilerplate
  // directly onto the same line as the (empty) argument, so the word "if"
  // (from "If no level given ...") was captured as the level and rejected as
  // bogus — a bare `/cavernicola` in opencode silently never activated.
  // Regression guard for that (matches the shape exercised by
  // tests/installer/opencode.test.mjs's real-hooks test).
  const templateNoArgs =
    'Activate cavernicola mode: \n\n' +
    'If no argument given, use cavernicola. If "off", deactivate.';
  assert.deepStrictEqual(
    parseModeChange(templateNoArgs, { ...defaultCavernicola, expandedTpl: true }),
    { action: 'set', mode: 'cavernicola' }
  );
});

test('expandedTpl: bogus level in the template is unresolved, not the default (#602 drift)', () => {
  assert.deepStrictEqual(
    parseModeChange('Activate cavernicola mode: not-a-real-level', { ...defaultCavernicola, expandedTpl: true }),
    { action: 'unresolved' }
  );
});

test('expandedTpl recognizes the independent-mode command templates (#602 drift)', () => {
  assert.deepStrictEqual(
    parseModeChange('Generate a commit message for the current staged changes.', { ...defaultCavernicola, expandedTpl: true }),
    { action: 'set', mode: 'commit' }
  );
  assert.deepStrictEqual(
    parseModeChange('Review the current diff (or files: ).', { ...defaultCavernicola, expandedTpl: true }),
    { action: 'set', mode: 'review' }
  );
  assert.deepStrictEqual(
    parseModeChange('Compress the file at: notes.md', { ...defaultCavernicola, expandedTpl: true }),
    { action: 'set', mode: 'compress' }
  );
});

test('expandedTpl: the help card opener short-circuits even a trigger in its body', () => {
  assert.strictEqual(
    parseModeChange('Show the cavernicola quick-reference card.\n\n| /cavernicola | Activate cavernicola |\nstop cavernicola', {
      ...defaultCavernicola, expandedTpl: true,
    }),
    null
  );
});

test('without expandedTpl, template bodies are inert plain text', () => {
  assert.strictEqual(
    parseModeChange('Generate a commit message for the current staged changes.', defaultCavernicola),
    null
  );
});

// ---------- parity with the real tracker hook ----------
// The tracker collapses whitespace/case and applies the same option set this
// module expects (getDefaultMode, skipNaturalLanguage). For a representative
// set of raw prompts, verify the flag-file outcome the tracker produces
// matches what parseModeChange's verdict implies — proving the two stay in
// sync rather than just "both look right in isolation".

function runTracker(prompt, presetFlag) {
  const cfg = fs.mkdtempSync(path.join(os.tmpdir(), 'cavernicola-parse-parity-'));
  try {
    if (presetFlag) fs.writeFileSync(path.join(cfg, '.cavernicola-active'), presetFlag);
    spawnSync(process.execPath, [HOOK_PATH], {
      input: JSON.stringify({ prompt }),
      env: { ...process.env, CLAUDE_CONFIG_DIR: cfg },
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf8',
    });
    const flagPath = path.join(cfg, '.cavernicola-active');
    return fs.existsSync(flagPath) ? fs.readFileSync(flagPath, 'utf8') : null;
  } finally {
    fs.rmSync(cfg, { recursive: true, force: true });
  }
}

// #838: natural-language triggers ran over the whole prompt, so any pasted
// text that merely QUOTED them fired them.
test('prose quoting "stop cavernicola" no longer deactivates (#838)', () => {
  const prompt = 'why does the help card say "stop cavernicola" or "normal mode" here?';
  assert.strictEqual(parseModeChange(prompt, defaultCavernicola), null);
});

test('prose quoting "activate cavernicola" no longer activates (#838)', () => {
  assert.strictEqual(
    parseModeChange('the readme says you can "activate cavernicola" by typing it', defaultCavernicola),
    null
  );
});

test('backtick-quoted triggers are inert too', () => {
  assert.strictEqual(parseModeChange('the `stop cavernicola` phrase is documented', defaultCavernicola), null);
});

// The cap that was tried first broke exactly these: a user explaining WHY they
// want the mode off writes more words, not fewer, and a dropped deactivation
// is silent — the user cannot escape and is told nothing.
test('long compound deactivation still works — no length cap (#838)', () => {
  for (const prompt of [
    'that is enough compression for now — please turn off cavernicola mode and go back to full sentences for the rest of this task',
    'ok this is getting hard to read, stop cavernicola mode and then go through the auth middleware and explain the token expiry check',
  ]) {
    assert.ok(prompt.length > 120, 'fixture must be long enough to matter');
    assert.deepStrictEqual(parseModeChange(prompt, defaultCavernicola), { action: 'clear' }, prompt);
  }
});

test('long compound activation still works', () => {
  const prompt = 'activate cavernicola mode and then start by reading the proxy package and summarising how the dial guard is wired up';
  assert.ok(prompt.length > 110);
  assert.deepStrictEqual(parseModeChange(prompt, defaultCavernicola), { action: 'set', mode: 'cavernicola' });
});

test('apostrophes do not blank the command ("don\'t stop cavernicola, it\'s useful")', () => {
  assert.deepStrictEqual(
    parseModeChange("don't stop cavernicola, it's useful", defaultCavernicola),
    { action: 'clear' }
  );
});

test('short natural-language triggers still work (positive control)', () => {
  assert.deepStrictEqual(parseModeChange('stop cavernicola', defaultCavernicola), { action: 'clear' });
  assert.deepStrictEqual(parseModeChange('back to normal mode please', defaultCavernicola), { action: 'clear' });
  assert.deepStrictEqual(parseModeChange('activate cavernicola', defaultCavernicola), { action: 'set', mode: 'cavernicola' });
});

// A foreign slash command's own text must not toggle our mode — symmetric with
// the skipNaturalLanguage that a foreign command ENVELOPE already sets.
test('a slash-initiated prompt does not fire natural-language triggers', () => {
  assert.strictEqual(parseModeChange('/cavernicola-ayuda stop cavernicola', defaultCavernicola), null);
  assert.strictEqual(parseModeChange('/some-other-command activate cavernicola', defaultCavernicola), null);
});

test('slash commands themselves are unaffected by prompt length', () => {
  const long = '/cavernicola ultra ' + 'x'.repeat(400);
  assert.deepStrictEqual(parseModeChange(long, defaultCavernicola), { action: 'set', mode: 'cavernicola-extremo' });
});

// An independent mode IS a real mode, just not reachable this way — saying
// "not recognized" would deny a mode the user can see in the docs.
test('an independent mode via /cavernicola <arg> reports its own command', () => {
  assert.deepStrictEqual(
    parseModeChange('/cavernicola commit', defaultCavernicola),
    { action: 'unresolved', independentMode: 'commit' }
  );
});

test('a quoted level resolves (leading punctuation stripped too)', () => {
  assert.deepStrictEqual(parseModeChange('/cavernicola "ultra"', defaultCavernicola), { action: 'set', mode: 'cavernicola-extremo' });
});

const parityCases = [
  { prompt: '/cavernicola ultra', preset: null },
  { prompt: '/cavernicola-extremo', preset: 'cavernicola' },
  { prompt: '/cavernicola off', preset: 'cavernicola' },
  { prompt: '/cavernicola not-a-real-level', preset: 'cavernicola-extremo' },
  { prompt: 'be brief', preset: null },
  { prompt: 'activate cavernicola', preset: null },
  { prompt: 'stop cavernicola', preset: 'cavernicola' },
  { prompt: 'what is cavernicola mode?', preset: null },
];

for (const { prompt, preset } of parityCases) {
  test(`parity: "${prompt}" (preset=${preset}) matches shared-parser verdict`, () => {
    const normalized = prompt.trim().toLowerCase().replace(/\s+/g, ' ');
    const verdict = parseModeChange(normalized, { getDefaultMode: () => 'cavernicola' });
    // null and 'unresolved' both mean "leave the flag exactly as it was".
    const expected =
      verdict === null ? (preset || null) :
      verdict.action === 'unresolved' ? (preset || null) :
      verdict.action === 'clear' ? null :
      verdict.mode;
    assert.strictEqual(runTracker(prompt, preset), expected);
  });
}

// Spanish triggers (cavernicola): accents optional; scoped requests, questions
// and negated phrases do not switch the mode.
const SPANISH_CASES = [
  ['modo cavernícola', { action: 'set', mode: 'cavernicola' }],
  ['activa el modo cavernícola', { action: 'set', mode: 'cavernicola' }],
  ['cambia al modo cavernicola', { action: 'set', mode: 'cavernicola' }],
  ['habla como un cavernicola', { action: 'set', mode: 'cavernicola' }],
  ['sé conciso', { action: 'set', mode: 'cavernicola' }],
  ['sin relleno por favor', { action: 'set', mode: 'cavernicola' }],
  ['no uses vim, activa cavernicola', { action: 'set', mode: 'cavernicola' }],
  ['sé breve en el resumen', null],
  ['¿qué es el modo cavernícola?', null],
  ['no actives el modo cavernicola', null],
  ['un juego para cavernicola', null],
  ['como salgo del modo normal de vim', null],
  ['basta cavernícola', { action: 'clear' }],
  ['apaga el modo cavernicola', { action: 'clear' }],
  ['modo normal', { action: 'clear' }],
  ['vuelve al modo normal', { action: 'clear' }],
  ['/cavernicola extremo', { action: 'set', mode: 'cavernicola-extremo' }],
  ['/cavernicola apagar', { action: 'clear' }],
  ['/cavernicola estado', { action: 'status' }],
  ['/cavernicola-revision', { action: 'set', mode: 'review' }],
  ['/cavernicola-comprimir notas.md', { action: 'set', mode: 'compress' }],
];
for (const [prompt, expected] of SPANISH_CASES) {
  test(`español: "${prompt}"`, () => {
    assert.deepStrictEqual(parseModeChange(prompt, { getDefaultMode: () => 'cavernicola' }), expected);
  });
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
