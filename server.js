const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve index for root and fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/stream')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Configurable library paths
const LIBRARY_PATHS = {
  movies: '/path/to/movies',
  tv: '/path/to/tv',
  music: '/path/to/music',
  podcasts: '/path/to/podcasts',
  audiobooks: '/path/to/audiobooks'
};

// ... (rest of scanner functions same as before)
function scanDirectory(dir, type) {
  const files = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (isMediaFile(entry.name, type)) {
        files.push({
          path: fullPath,
          name: entry.name,
          type: type,
          metadata: getMetadata(fullPath, type)
        });
      }
    }
  }
  try {
    walk(dir);
  } catch (e) {
    console.error(`Error scanning ${dir}`, e);
  }
  return files;
}

function isMediaFile(filename, type) {
  const ext = path.extname(filename).toLowerCase();
  if (type === 'movies' || type === 'tv') return ['.mp4', '.mkv', '.avi', '.mov'].includes(ext);
  if (type === 'music' || type === 'podcasts' || type === 'audiobooks') return ['.mp3', '.m4a', '.flac', '.wav', '.aac'].includes(ext);
  return false;
}

function getMetadata(filePath, type) {
  try {
    const output = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`).toString();
    const metadata = JSON.parse(output);
    return {
      title: metadata.format.tags?.title || path.basename(filePath, path.extname(filePath)),
      duration: metadata.format.duration,
    };
  } catch (e) {
    return { title: path.basename(filePath, path.extname(filePath)) };
  }
}

app.get('/api/libraries', (req, res) => {
  const libraries = {};
  for (const [key, dir] of Object.entries(LIBRARY_PATHS)) {
    if (fs.existsSync(dir)) {
      libraries[key] = scanDirectory(dir, key);
    }
  }
  res.json(libraries);
});

app.get('/stream', (req, res) => {
  const file = req.query.file;
  if (!file || !fs.existsSync(file)) return res.status(404).send('Not found');
  const stat = fs.statSync(file);
  const fileSize = stat.size;
  const range = req.headers.range;
  const contentType = path.extname(file).toLowerCase() === '.mp4' ? 'video/mp4' : 'audio/mpeg';
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
    const chunksize = (end-start)+1;
    const fileStream = fs.createReadStream(file, {start, end});
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType
    });
    fileStream.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType
    });
    fs.createReadStream(file).pipe(res);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Media Streamer running on http://localhost:${PORT}`);
});