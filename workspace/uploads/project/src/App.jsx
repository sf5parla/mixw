import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header/Header';
import Home from './pages/Home';
import Trending from './pages/Trending/Trending';
import TopRated from './pages/TopRated/TopRated';
import Upcoming from './pages/Upcoming/Upcoming';
import SearchResults from './pages/SearchResults';
import MovieDetail from './pages/MovieDetail/MovieDetail';
import WatchMovie from './pages/WatchMovie';
import WatchMovieWithInfo from './pages/WatchMovieWithInfo';
import GenrePage from './pages/GenrePage/GenrePage';
import AdvancedSearch from './pages/AdvancedSearch/AdvancedSearch';
import People from './pages/People/People';
import PersonDetail from './pages/PersonDetail/PersonDetail';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { initializeCriticalImages } from './utils/criticalImageCSS';
import { imageOptimizer } from './utils/imageOptimization';
import './App.css';

function App() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Load user preferences
    const savedTheme = localStorage.getItem('streamflix-theme') || 'dark';
    setTheme(savedTheme);
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Initialize image optimizations
    initializeCriticalImages();
    imageOptimizer.lazyLoadImages();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('streamflix-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <div className={`App theme-${theme}`}>
            <Header />
            
            <AnimatePresence mode="wait">
              <motion.main
                key={window.location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/trending" element={<Trending />} />
                  <Route path="/top-rated" element={<TopRated />} />
                  <Route path="/upcoming" element={<Upcoming />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/advanced-search" element={<AdvancedSearch />} />
                  <Route path="/movie/:id" element={<MovieDetail />} />
                  <Route path="/tv/:id" element={<MovieDetail />} />
                  <Route path="/watch/:id" element={<WatchMovie />} />
                  <Route path="/watch-with-info/:id" element={<WatchMovieWithInfo />} />
                  <Route path="/genre/:id" element={<GenrePage />} />
                  <Route path="/people" element={<People />} />
                  <Route path="/person/:id" element={<PersonDetail />} />
                  <Route path="*" element={
                    <div className="not-found">
                      <div className="not-found-content">
                        <h1>404</h1>
                        <h2>Page Not Found</h2>
                        <p>The page you're looking for doesn't exist.</p>
                        <a href="/" className="btn-primary">Go Home</a>
                      </div>
                    </div>
                  } />
                </Routes>
              </motion.main>
            </AnimatePresence>

            {/* Theme Toggle Button */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Scroll to Top Button */}
            <ScrollToTop />
          </div>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

// Scroll to Top Component
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          className="scroll-to-top"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Scroll to top"
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default App;