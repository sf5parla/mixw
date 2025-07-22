import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, User, Menu, X, Home, Film, Tv, TrendingUp, Bookmark } from 'lucide-react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const navItems = [
    { name: 'Movies', path: '/movies', icon: Film, active: location.pathname === '/movies' || location.pathname === '/' },
    { name: 'TV Shows', path: '/tv-shows', icon: Tv, active: location.pathname === '/tv-shows' },
    { name: 'Popular People', path: '/people', icon: TrendingUp, active: location.pathname === '/people' }
  ];

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          <div className="header-left">
            <Link to="/" className="logo" aria-label="StreamFlix Home">
              <div className="logo-icon">
                <span className="logo-text">🎬</span>
              </div>
            </Link>
            
            <nav className="nav desktop-nav" role="navigation" aria-label="Main navigation">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`nav-item ${item.active ? 'active' : ''}`}
                    aria-current={item.active ? 'page' : undefined}
                  >
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="header-right">
            <div className="search-container desktop-search">
              <form onSubmit={handleSearchSubmit} className="search-form" role="search">
                <Search size={18} className="search-icon" />
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  aria-label="Search content"
                />
              </form>
            </div>

            <button className="header-icon-btn" aria-label="Notifications">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>

            <div className="user-menu">
              <button className="user-avatar" aria-label="User profile">
                <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2" alt="User avatar" />
              </button>
            </div>

            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <div className="mobile-search">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <Search size={18} className="search-icon" />
              <input
                type="search"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </form>
          </div>

          <nav className="mobile-nav" role="navigation">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`mobile-nav-item ${item.active ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <IconComponent size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Header;