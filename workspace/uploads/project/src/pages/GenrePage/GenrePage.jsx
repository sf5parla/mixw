import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Tv, Filter } from 'lucide-react';
import tmdbApi from '../../services/tmdbApi';
import ContentGrid from '../../components/ContentGrid';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import './GenrePage.css';

const GenrePage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const genreName = searchParams.get('name') || 'Genre';
  
  const [activeMediaType, setActiveMediaType] = useState('movie');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('popularity.desc');

  const mediaTypes = [
    { id: 'movie', label: 'Movies', icon: Film },
    { id: 'tv', label: 'TV Shows', icon: Tv }
  ];

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'release_date.desc', label: 'Newest First' },
    { value: 'release_date.asc', label: 'Oldest First' }
  ];

  useEffect(() => {
    fetchGenreContent();
  }, [id, activeMediaType, sortBy, currentPage]);

  const fetchGenreContent = async () => {
    try {
      setLoading(true);
      const response = await tmdbApi.getMoviesByGenre(id, currentPage, sortBy);
      
      if (currentPage === 1) {
        setContent(response.results || []);
      } else {
        setContent(prev => [...prev, ...(response.results || [])]);
      }
      
      setTotalPages(response.total_pages || 1);
    } catch (error) {
      console.error('Error fetching genre content:', error);
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaTypeChange = (mediaType) => {
    if (mediaType === activeMediaType) return;
    setActiveMediaType(mediaType);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) return;
    setSortBy(newSortBy);
    setCurrentPage(1);
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

  const loadMore = () => {
    if (currentPage < totalPages && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="genre-page">
      <VideoPlayer 
        movie={selectedMovie}
        onClose={handleClosePlayer}
        isVisible={showVideoPlayer}
      />

      <div className="genre-content">
        {/* Hero Section */}
        <section className="genre-hero">
          <div className="container">
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="hero-icon">
                <Film size={48} />
              </div>
              <h1 className="hero-title">{genreName}</h1>
              <p className="hero-description">
                Explore the best {genreName.toLowerCase()} movies and TV shows. 
                Discover your next favorite in this curated collection.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filter Controls */}
        <section className="genre-filters">
          <div className="container">
            <div className="filters-container">
              {/* Media Type Toggle */}
              <div className="filter-group">
                <h3 className="filter-title">Content Type</h3>
                <div className="toggle-group">
                  {mediaTypes.map((mediaType) => {
                    const IconComponent = mediaType.icon;
                    return (
                      <button
                        key={mediaType.id}
                        className={`toggle-btn ${activeMediaType === mediaType.id ? 'active' : ''}`}
                        onClick={() => handleMediaTypeChange(mediaType.id)}
                        disabled={loading}
                      >
                        <IconComponent size={16} />
                        <span>{mediaType.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort Options */}
              <div className="filter-group">
                <h3 className="filter-title">Sort By</h3>
                <div className="sort-dropdown">
                  <Filter size={16} />
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="sort-select"
                    disabled={loading}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <section className="genre-results">
          <div className="container">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeMediaType}-${sortBy}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <ContentGrid
                  title=""
                  content={content}
                  loading={loading && currentPage === 1}
                  onPlayClick={handlePlayClick}
                />
              </motion.div>
            </AnimatePresence>

            {/* Load More Button */}
            {content.length > 0 && currentPage < totalPages && (
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
          </div>
        </section>

        {/* Stats Section */}
        <section className="genre-stats">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{content.length}</div>
                <div className="stat-label">{genreName} Items</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {activeMediaType === 'movie' ? 'Movies' : 'TV Shows'}
                </div>
                <div className="stat-label">Content Type</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {sortOptions.find(s => s.value === sortBy)?.label}
                </div>
                <div className="stat-label">Sort Order</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">HD</div>
                <div className="stat-label">Quality</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default GenrePage;