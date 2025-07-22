import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Eye, Download, Star, Calendar, Clock, Globe } from 'lucide-react';
import VideoModal from '../components/VideoModal';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [videos, setVideos] = useState([]);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [cast, setCast] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('US');
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);

  const languages = [
    { code: 'US', name: 'English', flag: '🇺🇸' },
    { code: 'ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'IT', name: 'Italian', flag: '🇮🇹' },
    { code: 'FR', name: 'French', flag: '🇫🇷' },
    { code: 'DE', name: 'German', flag: '🇩🇪' }
  ];

  const downloadQualities = [
    'SD Quality', 'HQ Quality', 'HD Quality', 
    'Full HD Quality', '4K Quality', '8K Quality'
  ];

  useEffect(() => {
    if (id) {
      fetchMovieDetails();
      fetchMovieVideos();
      fetchRelatedMovies();
      fetchMovieCast();
    }
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      const API_KEY = 'b7cd3340a794e5a2f35e3abb820b497f';
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`
      );
      const data = await response.json();
      setMovie(data);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovieVideos = async () => {
    try {
      const API_KEY = 'b7cd3340a794e5a2f35e3abb820b497f';
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`
      );
      const data = await response.json();
      setVideos(data.results || []);
    } catch (error) {
      console.error('Error fetching movie videos:', error);
    }
  };

  const fetchRelatedMovies = async () => {
    try {
      const API_KEY = 'b7cd3340a794e5a2f35e3abb820b497f';
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/similar?api_key=${API_KEY}`
      );
      const data = await response.json();
      setRelatedMovies(data.results?.slice(0, 6) || []);
    } catch (error) {
      console.error('Error fetching related movies:', error);
    }
  };

  const fetchMovieCast = async () => {
    try {
      const API_KEY = 'b7cd3340a794e5a2f35e3abb820b497f';
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}`
      );
      const data = await response.json();
      setCast(data.cast?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching movie cast:', error);
    }
  };

  const handleDownload = () => {
    alert('Complete the offer to download this movie!');
  };

  const getTrailerKey = () => {
    const trailer = videos.find(video => 
      video.type === 'Trailer' && video.site === 'YouTube'
    );
    return trailer?.key || videos[0]?.key;
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <div className="loading">Loading movie details...</div>;
  }

  if (!movie) {
    return (
      <div className="error">
        <h3>Movie Not Found</h3>
        <p>The requested movie could not be found.</p>
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${movie.backdrop_path}`
    : null;
  
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${movie.poster_path}`
    : 'https://via.placeholder.com/300x450/333/fff?text=No+Image';

  return (
    <div className="movie-detail">
      <div className="movie-hero">
        {backdropUrl && (
          <img 
            src={backdropUrl} 
            alt={movie.title}
            className="movie-backdrop"
          />
        )}
        
        <div className="movie-content">
          <div className="container">
            <motion.div 
              className="movie-details"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="movie-poster-large">
                <img src={posterUrl} alt={movie.title} />
              </div>
              
              <div className="movie-info-large">
                <h1 className="movie-title-large">{movie.title}</h1>
                
                <div className="movie-meta mb-3">
                  <div className="rating">
                    <Star size={16} fill="#ffd700" color="#ffd700" />
                    <span style={{ marginLeft: '0.5rem', color: '#ffd700', fontWeight: '600' }}>
                      {movie.vote_average?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <span className="availability">Available Now</span>
                  <span className="availability" style={{ marginLeft: '1rem' }}>FREE</span>
                </div>

                <div className="movie-stats">
                  <div className="stat-item">
                    <span className="stat-label">
                      <Calendar size={14} /> Release Date
                    </span>
                    <span className="stat-value">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">
                      <Clock size={14} /> Runtime
                    </span>
                    <span className="stat-value">{formatRuntime(movie.runtime)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">
                      <Globe size={14} /> Language
                    </span>
                    <span className="stat-value">{movie.original_language?.toUpperCase() || 'EN'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Budget</span>
                    <span className="stat-value">{formatCurrency(movie.budget)}</span>
                  </div>
                </div>

                {movie.genres && movie.genres.length > 0 && (
                  <div className="genre-tags">
                    {movie.genres.map((genre) => (
                      <span key={genre.id} className="genre-tag">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}

                <p className="movie-description">
                  {movie.overview || 'No description available for this movie.'}
                </p>

                {cast.length > 0 && (
                  <div className="cast-section" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#ffffff' }}>
                      Cast
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {cast.map((actor) => (
                        <div key={actor.id} style={{ color: '#b3b3b3', fontSize: '0.875rem' }}>
                          {actor.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="language-selector">
                  <h3 className="language-title">Select your Language:</h3>
                  <div className="language-flags">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        className={`flag-btn ${selectedLanguage === lang.code ? 'active' : ''}`}
                        onClick={() => setSelectedLanguage(lang.code)}
                        title={lang.name}
                      >
                        <span style={{ fontSize: '2rem' }}>{lang.flag}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="action-buttons">
                  <Link to={`/watch/${movie.id}`} className="btn-watch">
                    <Play size={20} />
                    Watch Now - {languages.find(l => l.code === selectedLanguage)?.name}
                  </Link>
                  <button 
                    className="btn-trailer"
                    onClick={() => setShowTrailer(true)}
                  >
                    <Eye size={20} />
                    Watch Trailer
                  </button>
                </div>

                <div className="download-section">
                  <h3 className="download-title">
                    Download Links - {languages.find(l => l.code === selectedLanguage)?.name} Language
                  </h3>
                  <div className="download-grid">
                    {downloadQualities.map((quality, index) => (
                      <button
                        key={index}
                        className="download-btn"
                        onClick={handleDownload}
                      >
                        <Download size={16} />
                        {quality} - {languages.find(l => l.code === selectedLanguage)?.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Related Movies */}
      {relatedMovies.length > 0 && (
        <section className="content-section">
          <div className="container">
            <h2 className="section-title">More Like This</h2>
            <div className="movie-grid">
              {relatedMovies.map((relatedMovie) => (
                <motion.div
                  key={relatedMovie.id}
                  className="movie-card"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="movie-poster">
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${relatedMovie.poster_path}`}
                      alt={relatedMovie.title}
                      loading="lazy"
                    />
                    <div className="movie-overlay">
                      <div className="movie-overlay-content">
                        <div className="movie-overlay-buttons">
                          <Link to={`/watch/${relatedMovie.id}`} className="overlay-btn overlay-btn-play">
                            <Play size={16} fill="currentColor" />
                          </Link>
                          <Link to={`/movie/${relatedMovie.id}`} className="overlay-btn">
                            <Eye size={16} />
                          </Link>
                        </div>
                        <div className="movie-overlay-info">
                          <h4 className="overlay-title">
                            {relatedMovie.title.length > 20 
                              ? relatedMovie.title.substring(0, 20) + '...'
                              : relatedMovie.title
                            }
                          </h4>
                          <div className="overlay-meta">
                            <span className="match-score">{Math.round(relatedMovie.vote_average * 10)}% Match</span>
                            <span className="duration">{new Date(relatedMovie.release_date).getFullYear()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Video Modal */}
      <VideoModal
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        videoKey={getTrailerKey()}
      />
    </div>
  );
};

export default MovieDetail;