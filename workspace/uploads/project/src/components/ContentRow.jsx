import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

const ContentRow = ({ title, movies, loading = false, isTV = false }) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="content-row">
        <div className="content-row-header">
          <h2 className="content-row-title">{title}</h2>
        </div>
        <div className="content-row-loading">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="movie-card-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="content-row">
      <div className="content-row-header">
        <h2 className="content-row-title">{title}</h2>
        <span className="content-row-explore">Explore All</span>
      </div>
      
      <div className="content-row-container">
        <button 
          className="scroll-btn scroll-btn-left"
          onClick={() => scroll('left')}
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="content-row-slider" ref={scrollContainerRef}>
          {movies.map((movie, index) => (
            <div key={`${movie.id}-${index}`} className="content-row-item">
              <MovieCard movie={movie} isTV={isTV} />
            </div>
          ))}
        </div>
        
        <button 
          className="scroll-btn scroll-btn-right"
          onClick={() => scroll('right')}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default ContentRow;