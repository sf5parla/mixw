import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Calendar, Clock } from 'lucide-react';
import tmdbApi from '../../services/tmdbApi';
import NetflixRow from '../../components/NetflixRow';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';

const Trending = () => {
  const [activeTimeWindow, setActiveTimeWindow] = useState('week');
  const [activeMediaType, setActiveMediaType] = useState('movie');
  const [trendingContent, setTrendingContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const timeWindows = [
    { id: 'day', label: 'Today' },
    { id: 'week', label: 'This Week' }
  ];

  const mediaTypes = [
    { id: 'movie', label: 'Movies' },
    { id: 'tv', label: 'TV Shows' }
  ];

  useEffect(() => {
    fetchTrendingContent();
  }, [activeTimeWindow, activeMediaType]);

  const fetchTrendingContent = async () => {
    try {
      setLoading(true);
      const response = await tmdbApi.getTrending(activeMediaType, activeTimeWindow);
      setTrendingContent(response.results || []);
    } catch (error) {
      console.error('Error fetching trending content:', error);
      setTrendingContent([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeWindowChange = (timeWindow) => {
    setActiveTimeWindow(timeWindow);
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
    <div className="netflix-trending-page">
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
              <TrendingUp size={48} />
            </div>
            <h1 className="netflix-page-title">Trending Now</h1>
            <p className="netflix-page-description">
              Discover what everyone's watching right now
            </p>
          </motion.div>
        </div>
      </div>

      {/* Netflix Toggle Controls */}
      <div className="netflix-toggle-section">
        <div className="netflix-toggle-container">
          {/* Time Window Toggle */}
          <div className="netflix-toggle-group">
            <div className="netflix-toggle">
              {timeWindows.map((timeWindow) => (
                <button
                  key={timeWindow.id}
                  className={`netflix-toggle-btn ${activeTimeWindow === timeWindow.id ? 'active' : ''}`}
                  onClick={() => handleTimeWindowChange(timeWindow.id)}
                  disabled={loading}
                >
                  {timeWindow.label}
                  {activeTimeWindow === timeWindow.id && (
                    <motion.div
                      className="netflix-toggle-indicator"
                      layoutId="time-toggle-indicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Media Type Toggle */}
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
                      layoutId="media-toggle-indicator"
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
            key={`${activeTimeWindow}-${activeMediaType}`}
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
                title={`Trending ${activeMediaType === 'movie' ? 'Movies' : 'TV Shows'} - ${timeWindows.find(t => t.id === activeTimeWindow)?.label}`}
                content={trendingContent}
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

export default Trending;