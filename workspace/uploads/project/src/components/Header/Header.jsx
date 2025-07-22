import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  Film, 
  Tv, 
  TrendingUp, 
  Star,
  Calendar,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import tmdbApi from '../../services/tmdbApi';
import SearchDropdown from './SearchDropdown';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [genres, setGenres] = useState([]);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const genreRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Navigation items
  const navItems = [
    { name: 'Home', path: '/', icon: Film },
    { name: 'Trending', path: '/trending', icon: TrendingUp },
    { name: 'Top Rated', path: '/top-rated', icon: Star },
    { name: 'Upcoming', path: '/upcoming', icon: Calendar },
    { name: 'People', path: '/people', icon: Users }
  ];

  // Scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Header background on scroll
      setIsScrolled(currentScrollY > 50);
      
      // Smart hide/show behavior
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Load genres
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const response = await tmdbApi.getGenres('movie');
        setGenres(response.genres || []);
      } catch (error) {
        console.error('Error loading genres:', error);
      }
    };
    loadGenres();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const response = await tmdbApi.searchMulti(searchQuery.trim());
          setSearchResults(response.results?.slice(0, 8) || []);
          setShowSearchDropdown(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (genreRef.current && !genreRef.current.contains(event.target)) {
        setShowGenreDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearchDropdown(false);
      setIsMobileMenuOpen(false);
    }
  };

  // Handle search result click
  const handleSearchResultClick = (item) => {
    const path = item.media_type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;
    navigate(path);
    setSearchQuery('');
    setShowSearchDropdown(false);
    setIsMobileMenuOpen(false);
  };

  // Handle genre click
  const handleGenreClick = (genre) => {
    navigate(`/genre/${genre.id}?name=${encodeURIComponent(genre.name)}`);
    setShowGenreDropdown(false);
    setIsMobileMenuOpen(false);
  };

  // Check if route is active
  const isActiveRoute = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.header 
      className={`header ${isScrolled ? 'scrolled' : ''}`}
      initial={{ y: 0 }}
      animate={{ y: headerVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <motion.div 
              className="logo-icon"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🎬
            </motion.div>
            <span className="logo-text">StreamFlix</span>
          </Link>

          <nav className="desktop-nav">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-item ${isActiveRoute(item.path) ? 'active' : ''}`}
              >
                <item.icon size={16} />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Genres Dropdown */}
            <div className="dropdown" ref={genreRef}>
              <button
                className="nav-item dropdown-trigger"
                onClick={() => setShowGenreDropdown(!showGenreDropdown)}
              >
                <span>Genres</span>
                <ChevronDown 
                  size={16} 
                  className={`dropdown-arrow ${showGenreDropdown ? 'open' : ''}`}
                />
              </button>

              <AnimatePresence>
                {showGenreDropdown && (
                  <motion.div
                    className="dropdown-menu"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="dropdown-grid">
                      {genres.map((genre) => (
                        <button
                          key={genre.id}
                          className="dropdown-item"
                          onClick={() => handleGenreClick(genre)}
                        >
                          {genre.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>
        </div>

        <div className="header-right">
          {/* Desktop Search */}
          <div className="search-container desktop-search" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="search-form">
              <Search size={18} className="search-icon" />
              <input
                type="search"
                placeholder="Search movies, TV shows, people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
              />
              {isSearching && <div className="search-loading" />}
            </form>

            <SearchDropdown
              isVisible={showSearchDropdown}
              results={searchResults}
              onResultClick={handleSearchResultClick}
              isLoading={isSearching}
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="mobile-menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              className="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <div className="mobile-menu-content">
                {/* Mobile Search */}
                <div className="mobile-search">
                  <form onSubmit={handleSearchSubmit} className="search-form">
                    <Search size={18} className="search-icon" />
                    <input
                      type="search"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                    />
                  </form>
                </div>

                {/* Mobile Navigation */}
                <nav className="mobile-nav">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`mobile-nav-item ${isActiveRoute(item.path) ? 'active' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon size={20} />
                      <span>{item.name}</span>
                    </Link>
                  ))}

                  {/* Mobile Genres */}
                  <div className="mobile-genres">
                    <h3 className="mobile-section-title">Genres</h3>
                    <div className="mobile-genre-grid">
                      {genres.slice(0, 12).map((genre) => (
                        <button
                          key={genre.id}
                          className="mobile-genre-item"
                          onClick={() => handleGenreClick(genre)}
                        >
                          {genre.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;