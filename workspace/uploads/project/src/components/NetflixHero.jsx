import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';
import tmdbApi from '../services/tmdbApi';

const NetflixHero = ({ featuredContent }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredContent && featuredContent.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredContent.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [featuredContent]);

  if (!featuredContent || featuredContent.length === 0) {
    return null;
  }

  const currentItem = featuredContent[currentIndex];
  const backdropUrl = tmdbApi.getImageURL(currentItem.backdrop_path, 'w1920_and_h800_multi_faces');
  const title = currentItem.title || currentItem.name;
  const overview = currentItem.overview;

  return (
    <div className="netflix-hero">
      <div className="netflix-hero-background">
        <img src={backdropUrl} alt={title} />
        <div className="netflix-hero-gradient" />
      </div>
      
      <div className="netflix-hero-content">
        <div className="netflix-hero-info">
          <motion.h1 
            className="netflix-hero-title"
            key={currentIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {title}
          </motion.h1>
          
          <motion.p 
            className="netflix-hero-overview"
            key={`overview-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {overview?.length > 300 ? `${overview.substring(0, 300)}...` : overview}
          </motion.p>
          
          <motion.div 
            className="netflix-hero-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link to={`/watch/${currentItem.id}`} className="netflix-btn netflix-btn-play">
              <Play size={20} fill="currentColor" />
              Play
            </Link>
            <Link to={`/movie/${currentItem.id}`} className="netflix-btn netflix-btn-info">
              <Info size={20} />
              More Info
            </Link>
          </motion.div>
        </div>

        <div className="netflix-hero-controls">
          <button 
            className="netflix-volume-btn"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          
          <div className="netflix-maturity-rating">
            18+
          </div>
        </div>
      </div>

      {featuredContent.length > 1 && (
        <div className="netflix-hero-indicators">
          {featuredContent.map((_, index) => (
            <button
              key={index}
              className={`netflix-hero-indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NetflixHero;