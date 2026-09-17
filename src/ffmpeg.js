function ffmpegArgs(input, cover, output) {
  return [
    '-y', '-i', input, '-i', cover,
    '-map', '0:a:0', '-map', '1:v:0',
    '-c:a', 'copy', '-c:v', 'copy',
    '-disposition:v:0', 'attached_pic',
    '-metadata:s:v:0', 'title=Album cover',
    '-metadata:s:v:0', 'comment=Cover (front)',
    output
  ];
}

module.exports = { ffmpegArgs };
