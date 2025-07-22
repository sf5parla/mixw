import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Plus, ThumbsUp, Info } from 'lucide-react';

const MovieCard = ({ movie, isTV = false }) => {
  const title = (movie.title || movie.name)?.length > 25 
    ? (movie.title || movie.name).substring(0, 25) + '...' 
    : (movie.title || movie.name);
    
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/300x450/333/fff?text=No+Image';

  const releaseYear = movie.release_date || movie.first_air_date 
    ? new Date(movie.release_date || movie.first_air_date).getFullYear()
    : 'N/A';

  const rating = movie.vote_average ? Math.round(movie.vote_average * 10) : 85;

  return (
    <motion.div 
      className="movie-card"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <div className="movie-poster">
        <img src={posterUrl} alt={movie.title || movie.name} loading="lazy" />
        <div className="movie-overlay">
          <div className="movie-overlay-content">
            <div className="movie-overlay-buttons">
              <Link 
                to={isTV ? `/tv/${movie.id}` : `/watch/${movie.id}`} 
                className="overlay-btn overlay-btn-play"
              >
                <Play size={16} fill="currentColor" />
              </Link>
              <button className="overlay-btn overlay-btn-add">
                <Plus size={16} />
              </button>
              <button className="overlay-btn overlay-btn-like">
                <ThumbsUp size={16} />
              </button>
              <Link 
                to={isTV ? `/tv/${movie.id}` : `/movie/${movie.id}`} 
                className="overlay-btn"
              >
                <Info size={16} />
              </Link>
            </div>
            <div className="movie-overlay-info">
              <h4 className="overlay-title">{title}</h4>
              <div className="overlay-meta">
                <span className="match-score">{rating}% Match</span>
                <span className="maturity-rating">18+</span>
                <span className="duration">{releaseYear}</span>
              </div>
              <div className="overlay-genres">
                {isTV ? 'TV Series' : 'Movie'} • Drama • Action
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="movie-info">
        <h3 className="movie-title">{title}</h3>
      </div>
    </motion.div>
  );
};

export default MovieCard;