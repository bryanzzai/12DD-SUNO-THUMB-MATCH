const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { spawn } = require('node:child_process');
const { existsSync, promises: fs } = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { ffmpegArgs } = require('./ffmpeg');

const isM4a = (file) => path.extname(file).toLowerCase() === '.m4a';
const isPng = (file) => path.extname(file).toLowerCase() === '.png';

async function listFiles(directory, predicate) {
  const names = await fs.readdir(directory, { withFileTypes: true });
  return names
    .filter((entry) => entry.isFile() && predicate(entry.name))
    .map((entry) => path.join(directory, entry.name))
    .sort((a, b) => path.basename(a).localeCompare(path.basename(b), undefined, { numeric: true }));
}

function resolveFfmpeg() {
  if (app.isPackaged) {
    const bundled = path.join(process.resourcesPath, 'ffmpeg-static', 'ffmpeg.exe');
    if (existsSync(bundled)) return bundled;
  }
  return require('ffmpeg-static');
}

function runFfmpeg(input, cover, output, sendProgress) {
  return new Promise((resolve, reject) => {
    const child = spawn(resolveFfmpeg(), ffmpegArgs(input, cover, output), { windowsHide: true });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve();
      reject(new Error(`FFmpeg kunne ikke skrive ${path.basename(output)}. ${stderr.slice(-500)}`));
    });
  });
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 980,
    minHeight: 650,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  window.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  ipcMain.handle('choose-folder', async (_event, kind) => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (result.canceled) return null;
    const directory = result.filePaths[0];
    const files = await listFiles(directory, kind === 'songs' ? isM4a : isPng);
    return {
      directory,
      files: files.map((file) => ({
        path: file,
        name: path.basename(file),
        title: path.basename(file, path.extname(file)),
        url: pathToFileURL(file).href
      }))
    };
  });

  ipcMain.handle('choose-output', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle('export-covers', async (event, { matches, outputDirectory }) => {
    if (!outputDirectory || !Array.isArray(matches) || matches.length === 0) {
      throw new Error('Vælg mindst én parring og en outputmappe.');
    }
    await fs.mkdir(outputDirectory, { recursive: true });
    const results = [];
    for (let index = 0; index < matches.length; index += 1) {
      const match = matches[index];
      const output = path.join(outputDirectory, path.basename(match.song.path));
      event.sender.send('export-progress', { current: index + 1, total: matches.length, song: match.song.name });
      try {
        await runFfmpeg(match.song.path, match.image.path, output);
        results.push({ song: match.song.name, cover: match.image.name, output: path.basename(output), status: 'ok' });
      } catch (error) {
        results.push({ song: match.song.name, cover: match.image.name, output: path.basename(output), status: 'error', error: error.message });
      }
    }
    await fs.writeFile(
      path.join(outputDirectory, 'cover-matches.json'),
      JSON.stringify({ generatedAt: new Date().toISOString(), matches: results }, null, 2),
      'utf8'
    );
    return results;
  });

  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
