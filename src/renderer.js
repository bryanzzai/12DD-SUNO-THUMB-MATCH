const state = { songs: [], images: [], outputDirectory: null, selectedImagePath: null, matches: new Map() };
const $ = (id) => document.getElementById(id);

function setNotice(message, isError = false) {
  const element = $('notice'); element.textContent = message; element.className = isError ? 'error' : '';
}

function assignedImage(songPath) { return state.images.find((image) => image.path === state.matches.get(songPath)); }
function isUsed(imagePath) { return [...state.matches.values()].includes(imagePath); }

function assign(songPath, imagePath) {
  if (!imagePath) return;
  for (const [assignedSong, assignedImagePath] of state.matches) {
    if (assignedImagePath === imagePath) state.matches.delete(assignedSong);
  }
  state.matches.set(songPath, imagePath);
  state.selectedImagePath = null;
  render();
}

function render() {
  const songs = $('songs'); songs.innerHTML = '';
  for (const song of state.songs) {
    const image = assignedImage(song.path);
    const row = document.createElement('article'); row.className = `song ${image ? 'matched' : ''}`;
    row.addEventListener('dragover', (event) => { event.preventDefault(); row.classList.add('drag-over'); });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
    row.addEventListener('drop', (event) => { event.preventDefault(); row.classList.remove('drag-over'); assign(song.path, event.dataTransfer.getData('imagePath')); });
    row.addEventListener('click', () => { if (state.selectedImagePath) assign(song.path, state.selectedImagePath); });
    const cover = image ? `<img class="song-cover" src="${image.url}" alt="${image.name}">` : '<div class="song-cover empty-cover">Intet<br>cover</div>';
    row.innerHTML = `${cover}<div><div class="song-title">${song.title}</div><div class="song-file">${song.name}${image ? `  ←  ${image.name}` : ''}</div></div>`;
    songs.append(row);
  }
  const images = $('images'); images.innerHTML = '';
  for (const image of state.images) {
    const card = document.createElement('article');
    card.className = `image-card ${state.selectedImagePath === image.path ? 'selected' : ''} ${isUsed(image.path) ? 'used' : ''}`;
    card.draggable = true;
    card.addEventListener('dragstart', (event) => event.dataTransfer.setData('imagePath', image.path));
    card.addEventListener('click', () => { state.selectedImagePath = state.selectedImagePath === image.path ? null : image.path; render(); });
    card.innerHTML = `<img src="${image.url}" alt="${image.name}"><div class="image-name" title="${image.name}">${image.name}</div>`;
    images.append(card);
  }
  $('match-count').textContent = `${state.matches.size} / ${state.songs.length} parret`;
  $('image-count').textContent = `${state.images.filter((image) => !isUsed(image.path)).length} tilgængelige`;
  $('export').disabled = state.matches.size === 0 || !state.outputDirectory;
}

$('songs-button').addEventListener('click', async () => {
  const result = await window.coverMatcher.chooseFolder('songs');
  if (!result) return; state.songs = result.files; state.matches.clear();
  $('songs-status').textContent = `${result.files.length} M4A-filer valgt`; setNotice('Vælg og tildel covers.'); render();
});
$('images-button').addEventListener('click', async () => {
  const result = await window.coverMatcher.chooseFolder('images');
  if (!result) return; state.images = result.files; state.matches.clear();
  $('images-status').textContent = `${result.files.length} PNG-filer valgt`; setNotice('Træk et cover til en sang, eller klik cover → klik sang.'); render();
});
$('output-button').addEventListener('click', async () => {
  const result = await window.coverMatcher.chooseOutput();
  if (!result) return; state.outputDirectory = result;
  $('output-status').textContent = result; setNotice('Outputmappen er klar; originalerne forbliver urørte.'); render();
});
$('clear').addEventListener('click', () => { state.matches.clear(); state.selectedImagePath = null; setNotice('Alle tildelinger er ryddet.'); render(); });
$('export').addEventListener('click', async () => {
  const matches = state.songs.filter((song) => state.matches.has(song.path)).map((song) => ({ song, image: assignedImage(song.path) }));
  $('export').disabled = true; setNotice(`Skriver ${matches.length} cover(s) …`);
  try {
    const results = await window.coverMatcher.exportCovers({ matches, outputDirectory: state.outputDirectory });
    const failed = results.filter((item) => item.status === 'error');
    setNotice(failed.length ? `${results.length - failed.length} færdige; ${failed.length} fejlede. Se cover-matches.json.` : `${results.length} færdige; hvert brugt PNG er omdøbt til sangens navn. cover-matches.json er gemt i outputmappen.`, failed.length > 0);
  } catch (error) { setNotice(error.message, true); }
  render();
});
window.coverMatcher.onProgress(({ current, total, song }) => setNotice(`Skriver ${current} af ${total}: ${song}`));
render();
