const test = require('node:test');
const assert = require('node:assert/strict');
const { ffmpegArgs } = require('../src/ffmpeg.js');

test('builds a stream-copy command with attached cover art', () => {
  const args = ffmpegArgs('C:/songs/True True Love.m4a', 'C:/covers/14.png', 'C:/out/True True Love.m4a');
  assert.deepEqual(args, [
    '-y', '-i', 'C:/songs/True True Love.m4a', '-i', 'C:/covers/14.png',
    '-map', '0:a:0', '-map', '1:v:0', '-c:a', 'copy', '-c:v', 'copy',
    '-disposition:v:0', 'attached_pic', '-metadata:s:v:0', 'title=Album cover',
    '-metadata:s:v:0', 'comment=Cover (front)', 'C:/out/True True Love.m4a'
  ]);
});
