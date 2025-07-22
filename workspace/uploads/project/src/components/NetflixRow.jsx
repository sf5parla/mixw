import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Plus, ThumbsUp, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import tmdbApi from '../services/tmdbApi';
import './SimplePlayOverlay.css';

const NetflixRow = ({ title, content = [], onPlayClick, isTV = false }) => {
  const scrollContainerRef = useRef(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.9;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  if (!content || content.length === 0) {
    return null;
  }

  return (
    <div className="netflix-row">
      <h2 className="netflix-row-title">{title}</h2>
      
      <div className="netflix-row-container">
        <AnimatePresence>
          {showLeftArrow && (
            <motion.button 
              className="netflix-scroll-btn netflix-scroll-left"
              onClick={() => scroll('left')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ChevronLeft size={24} />
            </motion.button>
          )}
        </AnimatePresence>
        
        <div 
          className="netflix-row-slider" 
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {content.map((item, index) => {
            const posterUrl = tmdbApi.getImageURL(item.poster_path, 'w300');
            const title = item.title || item.name;
            const year = item.release_date || item.first_air_date 
              ? new Date(item.release_date || item.first_air_date).getFullYear()
              : '';
            const rating = tmdbApi.formatRating(item.vote_average);

            return (
              <motion.div
                key={item.id}
                className="netflix-card"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="netflix-card-image">
                  <img 
                    src={posterUrl || 'https://via.placeholder.com/300x450/1a1a1a/666?text=No+Image'}
                    alt={title}
                    loading="lazy"
                  />
                  
                  <AnimatePresence>
                    {hoveredItem === item.id && (
                      <motion.div
                        className="netflix-card-overlay simple-netflix-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <button 
                          className="simple-netflix-play-btn"
                          onClick={() => window.location.href = `/watch-with-info/${item.id}`}
                          aria-label={`Play ${title}`}
                        >
                          <Play size={40} fill="currentColor" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <AnimatePresence>
          {showRightArrow && (
            <motion.button 
              className="netflix-scroll-btn netflix-scroll-right"
              onClick={() => scroll('right')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ChevronRight size={24} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NetflixRow;