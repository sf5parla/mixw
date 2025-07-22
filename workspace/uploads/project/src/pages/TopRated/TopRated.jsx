import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star } from 'lucide-react';
import tmdbApi from '../../services/tmdbApi';
import NetflixRow from '../../components/NetflixRow';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';

const TopRated = () => {
  const [activeMediaType, setActiveMediaType] = useState('movie');
  const [topRatedContent, setTopRatedContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const mediaTypes = [
    { id: 'movie', label: 'Movies' },
    { id: 'tv', label: 'TV Shows' }
  ];

  useEffect(() => {
    fetchTopRatedContent();
  }, [activeMediaType]);

  const fetchTopRatedContent = async () => {
    try {
      setLoading(true);
      const response = await tmdbApi.getTopRated(activeMediaType);
      setTopRatedContent(response.results || []);
    } catch (error) {
      console.error('Error fetching top rated content:', error);
      setTopRatedContent([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaTypeChange = (mediaType) => {
    setActiveMediaType(mediaType);
  };

  const handlePlayClick = async (item) => {
    try {
      const endpoint = activeMediaType === 'movie' ? 'getMovieDetails' : 'getTVDetails';
      const detailedItem = await tmdbApi[endpoint](item.id);
      
      setSelectedMovie(detailedItem);
      setShowVideoPlayer(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="netflix-top-rated-page">
      <VideoPlayer 
        movie={selectedMovie}
        onClose={handleClosePlayer}
        isVisible={showVideoPlayer}
      />

      {/* Netflix Hero Header */}
      <div className="netflix-page-hero">
        <div className="netflix-hero-background-gradient"></div>
        <div className="netflix-page-hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="netflix-page-icon">
              <Award size={48} />
            </div>
            <h1 className="netflix-page-title">Top Rated</h1>
            <p className="netflix-page-description">
              The highest rated movies and TV shows of all time
            </p>
          </motion.div>
        </div>
      </div>

      {/* Netflix Toggle Controls */}
      <div className="netflix-toggle-section">
        <div className="netflix-toggle-container">
          <div className="netflix-toggle-group">
            <div className="netflix-toggle">
              {mediaTypes.map((mediaType) => (
                <button
                  key={mediaType.id}
                  className={`netflix-toggle-btn ${activeMediaType === mediaType.id ? 'active' : ''}`}
                  onClick={() => handleMediaTypeChange(mediaType.id)}
                  disabled={loading}
                >
                  {mediaType.label}
                  {activeMediaType === mediaType.id && (
                    <motion.div
                      className="netflix-toggle-indicator"
                      layoutId="toprated-toggle-indicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="netflix-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMediaType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {loading ? (
              <div className="netflix-loading">
                <div className="netflix-spinner"></div>
              </div>
            ) : (
              <NetflixRow
                title={`Top Rated ${activeMediaType === 'movie' ? 'Movies' : 'TV Shows'}`}
                content={topRatedContent}
                onPlayClick={handlePlayClick}
                isTV={activeMediaType === 'tv'}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TopRated;