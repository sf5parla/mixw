import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import tmdbApi from '../../services/tmdbApi';
import NetflixRow from '../../components/NetflixRow';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';

const Upcoming = () => {
  const [upcomingContent, setUpcomingContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  useEffect(() => {
    fetchUpcomingContent();
  }, []);

  const fetchUpcomingContent = async () => {
    try {
      setLoading(true);
      const response = await tmdbApi.getUpcoming();
      setUpcomingContent(response.results || []);
    } catch (error) {
      console.error('Error fetching upcoming content:', error);
      setUpcomingContent([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayClick = async (item) => {
    try {
      const detailedItem = await tmdbApi.getMovieDetails(item.id);
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
    <div className="netflix-upcoming-page">
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
              <Calendar size={48} />
            </div>
            <h1 className="netflix-page-title">Coming Soon</h1>
            <p className="netflix-page-description">
              Get ready for the most anticipated movies coming to theaters
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="netflix-content">
        {loading ? (
          <div className="netflix-loading">
            <div className="netflix-spinner"></div>
          </div>
        ) : (
          <NetflixRow
            title="Upcoming Movies"
            content={upcomingContent}
            onPlayClick={handlePlayClick}
          />
        )}
      </div>
    </div>
  );
};

export default Upcoming;