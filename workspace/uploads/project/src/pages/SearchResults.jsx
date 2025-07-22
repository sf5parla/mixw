import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import tmdbApi from '../services/tmdbApi';
import NetflixRow from '../components/NetflixRow';
import VideoPlayer from '../components/VideoPlayer/VideoPlayer';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  useEffect(() => {
    if (query) {
      searchContent(query);
    }
  }, [query]);

  const searchContent = async (searchQuery) => {
    try {
      setLoading(true);
      
      const [movieResults, tvResults, peopleResults] = await Promise.all([
        tmdbApi.searchMovies(searchQuery),
        tmdbApi.searchTV(searchQuery),
        tmdbApi.searchPerson(searchQuery)
      ]);
      
      setMovies(movieResults.results?.filter(movie => movie.poster_path) || []);
      setTvShows(tvResults.results?.filter(show => show.poster_path) || []);
      setPeople(peopleResults.results?.filter(person => person.profile_path) || []);
    } catch (error) {
      console.error('Error searching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayClick = async (item) => {
    try {
      const detailedItem = await tmdbApi.getMovieDetails(item.id);
      setSelectedMovie(detailedItem);
      setShowVideoPlayer(true);
    } catch (error) {
      console.error('Error fetching item details:', error);
      setSelectedMovie(item);
      setShowVideoPlayer(true);
    }
  };

  const handleClosePlayer = () => {
    setShowVideoPlayer(false);
    setSelectedMovie(null);
  };

  return (
    <div className="netflix-search-results">
      <VideoPlayer 
        movie={selectedMovie}
        onClose={handleClosePlayer}
        isVisible={showVideoPlayer}
      />

      {/* Search Header */}
      <div className="netflix-search-header">
        <div className="netflix-search-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="netflix-search-title-section">
              <Search size={32} className="search-icon" />
              <h1>Search Results for "{query}"</h1>
            </div>
            <p className="netflix-search-subtitle">
              Found {movies.length + tvShows.length + people.length} results
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search Results Content */}
      <div className="netflix-search-content">
        {loading ? (
          <div className="netflix-loading">
            <div className="netflix-spinner"></div>
          </div>
        ) : (
          <>
            {movies.length > 0 && (
              <NetflixRow
                title={`Movies (${movies.length})`}
                content={movies}
                onPlayClick={handlePlayClick}
              />
            )}
            
            {tvShows.length > 0 && (
              <NetflixRow
                title={`TV Shows (${tvShows.length})`}
                content={tvShows}
                onPlayClick={handlePlayClick}
                isTV={true}
              />
            )}

            {movies.length === 0 && tvShows.length === 0 && people.length === 0 && (
              <div className="netflix-no-results">
                <div className="no-results-content">
                  <Search size={64} className="no-results-icon" />
                  <h2>No results found for "{query}"</h2>
                  <p>Try different keywords or check your spelling</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;