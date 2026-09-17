const test = require('node:test');
const assert = require('node:assert/strict');
const { planImageRenames, oldNameFor, oldNameConflicts } = require('../src/renames.js');

test('renames a selected PNG to the M4A base name in the same folder', () => {
  const result = planImageRenames([{ song: { path: '/audio/True True Love.m4a', name: 'True True Love.m4a' }, image: { path: '/covers/14.png', name: '14.png' } }], () => false);
  assert.equal(result[0].target, '/covers/True True Love.png');
});

test('treats a second old file as an error condition', () => {
  assert.throws(
    () => oldNameFor('/covers/True True Love.png', (name) => name === '/covers/True True Love.png.old'),
    /Alvorlig navnekonflikt/
  );
});

test('detects existing old conflicts before writing any output', () => {
  const plans = planImageRenames([{ song: { path: '/audio/True True Love.m4a', name: 'True True Love.m4a' }, image: { path: '/covers/14.png', name: '14.png' } }]);
  const conflicts = oldNameConflicts(plans, (name) => name === '/covers/True True Love.png' || name === '/covers/True True Love.png.old');
  assert.deepEqual(conflicts, ['True True Love.png.old']);
});
