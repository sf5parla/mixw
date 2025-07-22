import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NetflixToggle from '../components/NetflixToggle';
import NetflixHero from '../components/NetflixHero';
import NetflixRow from '../components/NetflixRow';
import VideoPlayer from '../components/VideoPlayer/VideoPlayer';
import tmdbApi from '../services/tmdbApi';

const Home = () => {
  const [activeMode, setActiveMode] = useState('movies');
  const [featuredContent, setFeaturedContent] = useState([]);
  const [trendingContent, setTrendingContent] = useState([]);
  const [topRatedContent, setTopRatedContent] = useState([]);
  const [popularContent, setPopularContent] = useState([]);
  const [upcomingContent, setUpcomingContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  useEffect(() => {
    fetchAllContent();
  }, []);

  useEffect(() => {
    fetchContentByMode();
  }, [activeMode]);

  const fetchAllContent = async () => {
    try {
      setLoading(true);
      // Get featured content from trending
      const featured = await tmdbApi.getTrending('movie', 'week');
      setFeaturedContent(featured.results?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching featured content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContentByMode = async () => {
    try {
      setLoading(true);
      const mediaType = activeMode === 'movies' ? 'movie' : 'tv';
      
      const [trending, topRated, popular, upcoming] = await Promise.all([
        tmdbApi.getTrending(mediaType, 'week'),
        tmdbApi.getTopRated(mediaType),
        tmdbApi.getPopular(mediaType),
        activeMode === 'movies' ? tmdbApi.getUpcoming() : tmdbApi.getPopular('tv')
      ]);
      
      setTrendingContent(trending.results?.slice(0, 20) || []);
      setTopRatedContent(topRated.results?.slice(0, 20) || []);
      setPopularContent(popular.results?.slice(0, 20) || []);
      setUpcomingContent(upcoming.results?.slice(0, 20) || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode) => {
    if (newMode === activeMode) return;
    setLoading(true);
    setActiveMode(newMode);
  };

  const handlePlayClick = async (movie) => {
    try {
      const detailedMovie = activeMode === 'movies' 
        ? await tmdbApi.getMovieDetails(movie.id)
        : await tmdbApi.getTVDetails(movie.id);
      
      setSelectedMovie(detailedMovie);
      setShowVideoPlayer(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error fetching movie details:', error);
      setSelectedMovie(movie);
      setShowVideoPlayer(true);
    }
  };

  const handleClosePlayer = () => {
    setShowVideoPlayer(false);
    setSelectedMovie(null);
  };

  return (
    <div className="home-page">
      <VideoPlayer 
        movie={selectedMovie}
        onClose={handleClosePlayer}
        isVisible={showVideoPlayer}
      />
      
      <div className="netflix-home">
        {/* Netflix Hero Section */}
        <NetflixHero featuredContent={featuredContent} />

        {/* Netflix Toggle */}
        <div className="netflix-toggle-section">
          <NetflixToggle 
            activeMode={activeMode}
            onModeChange={handleModeChange}
            loading={loading}
          />
        </div>

        {/* Netflix Content Rows */}
        <div className="netflix-content">
          <NetflixRow
            title={`Trending ${activeMode === 'movies' ? 'Movies' : 'TV Shows'}`}
            content={trendingContent}
            onPlayClick={handlePlayClick}
            isTV={activeMode === 'tv'}
          />
          
          <NetflixRow
            title={`Top Rated ${activeMode === 'movies' ? 'Movies' : 'TV Shows'}`}
            content={topRatedContent}
            onPlayClick={handlePlayClick}
            isTV={activeMode === 'tv'}
          />
          
          <NetflixRow
            title={`Popular ${activeMode === 'movies' ? 'Movies' : 'TV Shows'}`}
            content={popularContent}
            onPlayClick={handlePlayClick}
            isTV={activeMode === 'tv'}
          />
          
          <NetflixRow
            title={activeMode === 'movies' ? 'Upcoming Movies' : 'Popular TV Shows'}
            content={upcomingContent}
            onPlayClick={handlePlayClick}
            isTV={activeMode === 'tv'}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;