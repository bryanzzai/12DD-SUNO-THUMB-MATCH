const test = require('node:test');
const assert = require('node:assert/strict');
const { planImageRenames, oldNameFor } = require('../src/renames.js');

test('renames a selected PNG to the M4A base name in the same folder', () => {
  const result = planImageRenames([{ song: { path: '/audio/True True Love.m4a', name: 'True True Love.m4a' }, image: { path: '/covers/14.png', name: '14.png' } }], () => false);
  assert.equal(result[0].target, '/covers/True True Love.png');
});

test('preserves a conflicting PNG as an old file without overwriting it', () => {
  const result = oldNameFor('/covers/True True Love.png', (name) => name === '/covers/True True Love.png.old');
  assert.equal(result, '/covers/True True Love.png.old-2');
});
