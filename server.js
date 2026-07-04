// Add at top
const TMDB_API_KEY = 'YOUR_TMDB_API_KEY_HERE'; // Get free at themoviedb.org

// In getMetadata or new function
async function enrichWithTMDB(title, type) {
  if (!TMDB_API_KEY || TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') return {};
  try {
    const searchType = type === 'tv' ? 'tv' : 'movie';
    const res = await fetch(`https://api.themoviedb.org/3/search/${searchType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const item = data.results[0];
      return {
        tmdbId: item.id,
        poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
        overview: item.overview,
        releaseDate: item.release_date || item.first_air_date,
        rating: item.vote_average
      };
    }
  } catch(e) {}
  return {};
}

// Call it in metadata