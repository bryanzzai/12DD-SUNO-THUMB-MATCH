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
  const candidate = `${existingTarget}.old`;
  if (pathExists(candidate)) {
    throw new Error(`Alvorlig navnekonflikt: ${path.basename(candidate)} findes allerede.`);
  }
  return candidate;
}

function oldNameConflicts(plans, pathExists = existsSync) {
  return plans
    .filter((plan) => !isSameWindowsPath(plan.source, plan.target))
    .filter((plan) => pathExists(plan.target) && pathExists(`${plan.target}.old`))
    .map((plan) => path.basename(`${plan.target}.old`));
}

module.exports = { planImageRenames, isSameWindowsPath, oldNameFor, oldNameConflicts };
