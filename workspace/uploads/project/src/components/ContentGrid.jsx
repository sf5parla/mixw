import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Star, Calendar, Clock, Info, Plus, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import './SimplePlayOverlay.css';

const ContentGrid = ({ title, content = [], loading = false, showVideoPlayer, onPlayClick }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [watchlist, setWatchlist] = useState(new Set());

  const toggleWatchlist = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    const newWatchlist = new Set(watchlist);
    if (newWatchlist.has(id)) {
      newWatchlist.delete(id);
    } else {
      newWatchlist.add(id);
    }
    setWatchlist(newWatchlist);
  };

  const handlePlayClick = (item, e) => {
    e.preventDefault();
    e.stopPropagation();
    onPlayClick(item);
  };

  if (loading) {
    return (
      <section className="content-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{title}</h2>
          </div>
          <div className="content-grid">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="content-card-skeleton">
                <div className="skeleton-poster" />
                <div className="skeleton-content">
                  <div className="skeleton-title" />
                  <div className="skeleton-meta" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!content || content.length === 0) {
    return null;
  }

  return (
    <section className="content-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <button className="view-all-btn">View All</button>
        </div>
        
        <div className="content-grid">
          <AnimatePresence>
            {content.map((item, index) => {
              const posterUrl = item.poster_path 
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : 'https://via.placeholder.com/300x450/1a1a1a/666?text=No+Image';
              
              const title = item.title || item.name || 'Untitled';
              const year = item.release_date || item.first_air_date 
                ? new Date(item.release_date || item.first_air_date).getFullYear()
                : 'N/A';
              
              const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
              const isInWatchlist = watchlist.has(item.id);

              return (
                <motion.div
                  key={item.id}
                  className="content-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  whileHover={{ y: -8 }}
                >
                  <Link to={`/movie/${item.id}`} className="card-link">
                    <div className="card-poster">
                      <img 
                        src={posterUrl} 
                        alt={`${title} poster`}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x450/1a1a1a/666?text=No+Image';
                        }}
                      />
                      
                      <div className="card-badges">
                        <div className="rating-badge">
                          <Star size={12} fill="currentColor" />
                          <span>{rating}</span>
                        </div>
                        <div className="quality-badge">HD</div>
                      </div>

                      <AnimatePresence>
                        {hoveredItem === item.id && (
                          <motion.div
                            className="card-overlay simple-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <button 
                              className="simple-play-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location.href = `/watch-with-info/${item.id}`;
                              }}
                              aria-label={`Play ${title}`}
                            >
                              <Play size={40} fill="currentColor" />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <div className="card-content">
                      <h3 className="card-title">{title}</h3>
                      <div className="card-meta">
                        <span className="card-year">
                          <Calendar size={12} />
                          {year}
                        </span>
                        <span className="card-type">
                          {item.title ? 'Movie' : 'TV Show'}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default ContentGrid;