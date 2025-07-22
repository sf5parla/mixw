import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3001;

// TMDB API configuration
const TMDB_API_KEY = 'b7cd3340a794e5a2f35e3abb820b497f';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

app.use(cors());
app.use(express.json());

// Search movies
app.get('/api/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: encodeURIComponent(query)
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search movies' });
  }
});

// Get trending movies
app.get('/api/trending', async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending movies' });
  }
});

// Get upcoming movies
app.get('/api/upcoming', async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/upcoming`, {
      params: {
        api_key: TMDB_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming movies' });
  }
});

// Get movie details
app.get('/api/movie/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [movieResponse, videosResponse, similarResponse, translationsResponse] = await Promise.all([
      axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
        params: { api_key: TMDB_API_KEY }
      }),
      axios.get(`${TMDB_BASE_URL}/movie/${id}/videos`, {
        params: { api_key: TMDB_API_KEY }
      }),
      axios.get(`${TMDB_BASE_URL}/movie/${id}/similar`, {
        params: { api_key: TMDB_API_KEY }
      }),
      axios.get(`${TMDB_BASE_URL}/movie/${id}/translations`, {
        params: { api_key: TMDB_API_KEY }
      })
    ]);

    res.json({
      movie: movieResponse.data,
      videos: videosResponse.data,
      similar: similarResponse.data,
      translations: translationsResponse.data
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});