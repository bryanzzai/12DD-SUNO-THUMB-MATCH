const path = require('node:path');
const { existsSync } = require('node:fs');

function planImageRenames(matches, pathExists = existsSync) {
  const plans = matches.map(({ song, image }) => ({
    source: image.path,
    target: path.join(path.dirname(image.path), `${path.parse(song.path).name}.png`),
    songName: song.name,
    imageName: image.name
  }));
  const errors = [];
  const targets = new Map();

  for (const plan of plans) {
    const source = path.resolve(plan.source);
    const target = path.resolve(plan.target);
    const targetKey = target.toLocaleLowerCase();
    if (targets.has(targetKey) && targets.get(targetKey).source !== source) {
      errors.push(`To covers kan ikke få samme navn: ${path.basename(plan.target)}`);
    }
    targets.set(targetKey, { source, target });
    if (source !== target && pathExists(target)) {
      errors.push(`PNG findes allerede og bliver ikke overskrevet: ${path.basename(plan.target)}`);
    }
  }
  return { plans, errors };
}

module.exports = { planImageRenames };
