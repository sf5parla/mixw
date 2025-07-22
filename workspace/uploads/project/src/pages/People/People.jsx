import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Star, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import tmdbApi from '../../services/tmdbApi';
import './People.css';

const People = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchPopularPeople();
  }, [currentPage]);

  const fetchPopularPeople = async () => {
    try {
      setLoading(true);
      // Using trending people as popular people endpoint
      const response = await tmdbApi.getTrending('person', 'week', currentPage);
      
      if (currentPage === 1) {
        setPeople(response.results || []);
      } else {
        setPeople(prev => [...prev, ...(response.results || [])]);
      }
      
      setTotalPages(response.total_pages || 1);
    } catch (error) {
      console.error('Error fetching popular people:', error);
      setPeople([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await tmdbApi.request('/search/person', { query: query.trim() });
      setSearchResults(response.results?.slice(0, 20) || []);
    } catch (error) {
      console.error('Error searching people:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const loadMore = () => {
    if (currentPage < totalPages && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const displayPeople = searchQuery.trim() ? searchResults : people;
  const showLoadMore = !searchQuery.trim() && currentPage < totalPages;

  return (
    <div className="people-page">
      <div className="people-content">
        {/* Hero Section */}
        <section className="people-hero">
          <div className="container">
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="hero-icon">
                <Users size={48} />
              </div>
              <h1 className="hero-title">Popular People</h1>
              <p className="hero-description">
                Discover the most popular actors, directors, and celebrities in the entertainment industry.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search Section */}
        <section className="people-search">
          <div className="container">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <div className="search-input-wrapper">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for actors, directors, celebrities..."
                  className="search-input"
                />
                <button type="submit" className="search-btn" disabled={isSearching}>
                  {isSearching ? (
                    <div className="loading-spinner" />
                  ) : (
                    <Search size={16} />
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* People Grid */}
        <section className="people-results">
          <div className="container">
            {searchQuery.trim() && (
              <div className="results-header">
                <h2 className="results-title">
                  {isSearching ? 'Searching...' : `Search Results (${searchResults.length} found)`}
                </h2>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={searchQuery}
                className="people-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {displayPeople.map((person, index) => (
                  <PersonCard key={person.id} person={person} index={index} />
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Load More Button */}
            {showLoadMore && (
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
                        ({people.length} of {totalPages * 20})
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* No Results */}
            {searchQuery.trim() && searchResults.length === 0 && !isSearching && (
              <div className="no-results">
                <div className="no-results-icon">👤</div>
                <h3>No People Found</h3>
                <p>Try searching with different keywords.</p>
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="people-stats">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{displayPeople.length}</div>
                <div className="stat-label">People Listed</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  <Star size={24} fill="#ffd700" color="#ffd700" />
                </div>
                <div className="stat-label">Top Rated</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">Global</div>
                <div className="stat-label">Coverage</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Updated</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// Person Card Component
const PersonCard = ({ person, index }) => {
  const profileUrl = tmdbApi.getImageURL(person.profile_path, 'w300');
  const knownFor = person.known_for?.slice(0, 3).map(item => item.title || item.name).join(', ') || 'Various works';

  return (
    <motion.div
      className="person-card"
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <Link to={`/person/${person.id}`} className="person-link">
        <div className="person-photo">
          <img 
            src={profileUrl || 'https://via.placeholder.com/300x450/333/fff?text=No+Image'}
            alt={person.name}
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x450/333/fff?text=No+Image';
            }}
          />
          <div className="person-overlay">
            <div className="overlay-content">
              <div className="person-popularity">
                <Star size={16} fill="#ffd700" color="#ffd700" />
                <span>{person.popularity?.toFixed(1) || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="person-info">
          <h3 className="person-name">{person.name}</h3>
          <p className="person-department">{person.known_for_department || 'Acting'}</p>
          <p className="person-known-for">
            Known for: {knownFor.length > 50 ? knownFor.substring(0, 50) + '...' : knownFor}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default People;