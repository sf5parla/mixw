import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Tv, User, Star } from 'lucide-react';
import tmdbApi from '../../services/tmdbApi';

const SearchDropdown = ({ isVisible, results, onResultClick, isLoading }) => {
  const getMediaIcon = (mediaType) => {
    switch (mediaType) {
      case 'movie':
        return <Film size={16} />;
      case 'tv':
        return <Tv size={16} />;
      case 'person':
        return <User size={16} />;
      default:
        return <Film size={16} />;
    }
  };

  const getMediaTypeLabel = (mediaType) => {
    switch (mediaType) {
      case 'movie':
        return 'Movie';
      case 'tv':
        return 'TV Show';
      case 'person':
        return 'Person';
      default:
        return 'Movie';
    }
  };

  const formatReleaseDate = (item) => {
    const date = item.release_date || item.first_air_date;
    return date ? tmdbApi.formatDate(date, 'year') : '';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="search-dropdown"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {isLoading ? (
            <div className="search-dropdown-loading">
              <div className="loading-spinner" />
              <span>Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="search-results">
              {results.map((item) => {
                const title = item.title || item.name;
                const posterUrl = tmdbApi.getImageURL(item.poster_path || item.profile_path, 'w200');
                const rating = tmdbApi.formatRating(item.vote_average);
                const releaseYear = formatReleaseDate(item);

                return (
                  <motion.button
                    key={`${item.media_type}-${item.id}`}
                    className="search-result-item"
                    onClick={() => onResultClick(item)}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="result-poster">
                      {posterUrl ? (
                        <img 
                          src={posterUrl} 
                          alt={title}
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="result-poster-placeholder">
                        {getMediaIcon(item.media_type)}
                      </div>
                    </div>

                    <div className="result-info">
                      <div className="result-title">{title}</div>
                      <div className="result-meta">
                        <span className="result-type">
                          {getMediaIcon(item.media_type)}
                          {getMediaTypeLabel(item.media_type)}
                        </span>
                        {releaseYear && (
                          <span className="result-year">{releaseYear}</span>
                        )}
                        {item.vote_average > 0 && (
                          <span className="result-rating">
                            <Star size={12} fill="currentColor" />
                            {rating.text}
                          </span>
                        )}
                      </div>
                      {item.overview && (
                        <div className="result-overview">
                          {item.overview.length > 100 
                            ? `${item.overview.substring(0, 100)}...`
                            : item.overview
                          }
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="search-dropdown-empty">
              <span>No results found</span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchDropdown;