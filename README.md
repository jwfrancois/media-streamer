# MediaStream App

A personal media server and streamer, inspired by Plex, Jellyfin, Netflix, Spotify, and Audible.

## Features
- Scans local directories for movies, TV shows (with episodes), music albums, podcasts, audiobooks.
- Web UI with tabbed navigation.
- Streaming with range support for seamless playback.
- Metadata extraction via ffprobe.
- Responsive design.

## Setup
1. Update LIBRARY_PATHS in server.js with your actual media folder paths.
2. Install dependencies: `npm install`
3. Run: `node server.js`
4. Open http://localhost:3000

## Enhancements
- Add poster art scanning (e.g., folder.jpg).
- Database for persistence (SQLite).
- User accounts.
- Subtitles support.
- Mobile apps via PWA.
- Transcoding for different devices.

Give feedback for iterations! This is the foundation for your flawless local media empire.