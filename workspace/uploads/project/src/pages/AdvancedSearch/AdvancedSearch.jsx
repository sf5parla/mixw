import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, Calendar, Star } from 'lucide-react';
import tmdbApi from '../../services/tmdbApi';
import ContentGrid from '../../components/ContentGrid';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import './AdvancedSearch.css';

const AdvancedSearch = () => {
  const [filters, setFilters] = useState({
    query: '',
    year: '',
    genre: '',
    rating_gte: '',
    rating_lte: '',
    sort_by: 'popularity.desc'
  });
  const [genres, setGenres] = useState([]);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'release_date.desc', label: 'Newest First' },
    { value: 'release_date.asc', label: 'Oldest First' },
    { value: 'title.asc', label: 'A-Z' },
    { value: 'title.desc', label: 'Z-A' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      const response = await tmdbApi.getGenres('movie');
      setGenres(response.genres || []);
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = async (page = 1) => {
    try {
      setLoading(true);
      if (page === 1) {
        setHasSearched(true);
      }
      
      const searchFilters = { ...filters, page };
      const response = await tmdbApi.advancedSearch(searchFilters);
      
      if (page === 1) {
        setContent(response.results || []);
        setCurrentPage(1);
      } else {
        setContent(prev => [...prev, ...(response.results || [])]);
        setCurrentPage(page);
      }
      
      setTotalPages(response.total_pages || 1);
    } catch (error) {
      console.error('Error searching:', error);
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(1);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      year: '',
      genre: '',
      rating_gte: '',
      rating_lte: '',
      sort_by: 'popularity.desc'
    });
    setContent([]);
    setHasSearched(false);
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

  const loadMore = () => {
    if (currentPage < totalPages && !loading) {
      handleSearch(currentPage + 1);
    }
  };

  return (
    <div className="advanced-search-page">
      <VideoPlayer 
        movie={selectedMovie}
        onClose={handleClosePlayer}
        isVisible={showVideoPlayer}
      />

      <div className="advanced-search-content">
        {/* Hero Section */}
        <section className="search-hero">
          <div className="container">
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="hero-icon">
                <Search size={48} />
              </div>
              <h1 className="hero-title">Advanced Search</h1>
              <p className="hero-description">
                Find exactly what you're looking for with our powerful search filters. 
                Discover movies by genre, year, rating, and more.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search Form */}
        <section className="search-form-section">
          <div className="container">
            <form onSubmit={handleSubmit} className="advanced-search-form">
              <div className="form-grid">
                {/* Text Search */}
                <div className="form-group full-width">
                  <label htmlFor="query" className="form-label">
                    <Search size={16} />
                    Search Query
                  </label>
                  <input
                    id="query"
                    type="text"
                    value={filters.query}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                    placeholder="Enter movie title, actor, director..."
                    className="form-input"
                  />
                </div>

                {/* Genre Filter */}
                <div className="form-group">
                  <label htmlFor="genre" className="form-label">
                    <Filter size={16} />
                    Genre
                  </label>
                  <select
                    id="genre"
                    value={filters.genre}
                    onChange={(e) => handleFilterChange('genre', e.target.value)}
                    className="form-select"
                  >
                    <option value="">All Genres</option>
                    {genres.map((genre) => (
                      <option key={genre.id} value={genre.id}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Filter */}
                <div className="form-group">
                  <label htmlFor="year" className="form-label">
                    <Calendar size={16} />
                    Release Year
                  </label>
                  <select
                    id="year"
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="form-select"
                  >
                    <option value="">Any Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Range */}
                <div className="form-group">
                  <label htmlFor="rating_gte" className="form-label">
                    <Star size={16} />
                    Min Rating
                  </label>
                  <select
                    id="rating_gte"
                    value={filters.rating_gte}
                    onChange={(e) => handleFilterChange('rating_gte', e.target.value)}
                    className="form-select"
                  >
                    <option value="">Any Rating</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating}+ Stars
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="rating_lte" className="form-label">
                    <Star size={16} />
                    Max Rating
                  </label>
                  <select
                    id="rating_lte"
                    value={filters.rating_lte}
                    onChange={(e) => handleFilterChange('rating_lte', e.target.value)}
                    className="form-select"
                  >
                    <option value="">Any Rating</option>
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} Stars
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div className="form-group">
                  <label htmlFor="sort_by" className="form-label">
                    <Filter size={16} />
                    Sort By
                  </label>
                  <select
                    id="sort_by"
                    value={filters.sort_by}
                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                    className="form-select"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="search-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      <span>Search Movies</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="clear-btn"
                >
                  <X size={20} />
                  <span>Clear Filters</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Search Results */}
        {hasSearched && (
          <section className="search-results">
            <div className="container">
              {content.length > 0 ? (
                <>
                  <div className="results-header">
                    <h2 className="results-title">
                      Search Results ({content.length} found)
                    </h2>
                  </div>
                  
                  <ContentGrid
                    title=""
                    content={content}
                    loading={false}
                    onPlayClick={handlePlayClick}
                  />

                  {/* Load More Button */}
                  {currentPage < totalPages && (
                    <div className="load-more-container">
                      <button
                        className="load-more-btn"
                        onClick={loadMore}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="loading-spinner" />
                            <span>Loading...</span>
                          </>
                        ) : (
                          <>
                            <span>Load More</span>
                            <span className="load-more-count">
                              ({content.length} of {totalPages * 20})
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-results">
                  <div className="no-results-icon">🔍</div>
                  <h3>No Results Found</h3>
                  <p>Try adjusting your search filters or search terms.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;