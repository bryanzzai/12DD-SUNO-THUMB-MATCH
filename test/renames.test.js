const test = require('node:test');
const assert = require('node:assert/strict');
const { planImageRenames } = require('../src/renames.js');

test('renames a selected PNG to the M4A base name in the same folder', () => {
  const result = planImageRenames([{ song: { path: '/audio/True True Love.m4a', name: 'True True Love.m4a' }, image: { path: '/covers/14.png', name: '14.png' } }], () => false);
  assert.deepEqual(result.errors, []);
  assert.equal(result.plans[0].target, '/covers/True True Love.png');
});

test('stops before export if the intended PNG name already exists', () => {
  const result = planImageRenames([{ song: { path: '/audio/True True Love.m4a', name: 'True True Love.m4a' }, image: { path: '/covers/14.png', name: '14.png' } }], (name) => name === '/covers/True True Love.png');
  assert.match(result.errors[0], /ikke overskrevet/);
});
