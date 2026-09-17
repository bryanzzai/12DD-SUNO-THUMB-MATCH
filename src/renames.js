const path = require('node:path');
const { existsSync } = require('node:fs');

function planImageRenames(matches) {
  return matches.map(({ song, image }) => ({
    source: image.path,
    target: path.join(path.dirname(image.path), `${path.parse(song.path).name}.png`),
    songName: song.name,
    imageName: image.name
  }));
}

function isSameWindowsPath(first, second) {
  return path.resolve(first).toLocaleLowerCase() === path.resolve(second).toLocaleLowerCase();
}

function oldNameFor(existingTarget, pathExists = existsSync) {
  let candidate = `${existingTarget}.old`;
  let sequence = 2;
  while (pathExists(candidate)) {
    candidate = `${existingTarget}.old-${sequence}`;
    sequence += 1;
  }
  return candidate;
}

module.exports = { planImageRenames, isSameWindowsPath, oldNameFor };
