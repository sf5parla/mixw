import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Plus,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Star, 
  Calendar, 
  Clock, 
  Globe,
  Users,
  Award,
  ChevronDown,
  X,
  Volume2,
  VolumeX
} from 'lucide-react';
import tmdbApi from '../../services/tmdbApi';
import NetflixRow from '../../components/NetflixRow';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import './MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [videos, setVideos] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showTrailer, setShowTrailer] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' }
  ];

  useEffect(() => {
    if (id) {
      fetchMovieData();
    }
  }, [id]);

  const fetchMovieData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await tmdbApi.getMovieDetails(id);
      
      setMovie(data);
      setCast(data.credits?.cast?.slice(0, 20) || []);
      setCrew(data.credits?.crew?.filter(person => 
        ['Director', 'Producer', 'Executive Producer', 'Screenplay', 'Writer'].includes(person.job)
      ).slice(0, 10) || []);
      setVideos(data.videos?.results || []);
      setReviews(data.reviews?.results?.slice(0, 5) || []);
      setSimilarMovies(data.similar?.results || []);
      setRecommendations(data.recommendations?.results || []);
      
    } catch (error) {
      console.error('Error fetching movie details:', error);
      setError('Failed to load movie details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayClick = () => {
    // Navigate to the combined watch page
    window.location.href = `/watch-with-info/${id}`;
  };

  const handleClosePlayer = () => {
    setShowVideoPlayer(false);
  };

  const handleDownload = (quality) => {
    alert(`Complete the CPA offer to download this movie in ${quality} quality!`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title,
          text: `Check out ${movie.title} on StreamFlix`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const toggleWatchlist = () => {
    setIsInWatchlist(!isInWatchlist);
  };

  const handleRating = (rating) => {
    setUserRating(rating);
  };

  const getTrailerKey = () => {
    const trailer = videos.find(video => 
      video.type === 'Trailer' && video.site === 'YouTube'
    );
    return trailer?.key || videos[0]?.key;
  };

  const getDirector = () => {
    return crew.find(person => person.job === 'Director')?.name || 'N/A';
  };

  const getMatchPercentage = () => {
    return Math.round(movie.vote_average * 10);
  };

  if (loading) {
    return (
      <div className="netflix-loading">
        <div className="netflix-spinner"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="netflix-error">
        <h2>Oops! Something went wrong</h2>
        <p>{error || 'Movie not found'}</p>
        <Link to="/" className="netflix-btn netflix-btn-primary">
          Go Home
        </Link>
      </div>
    );
  }

  const backdropUrl = tmdbApi.getImageURL(movie.backdrop_path, 'w1920_and_h800_multi_faces');
  const posterUrl = tmdbApi.getImageURL(movie.poster_path, 'w600_and_h900_bestv2');
  const rating = tmdbApi.formatRating(movie.vote_average);
  const releaseYear = tmdbApi.formatDate(movie.release_date);
  const runtime = tmdbApi.formatRuntime(movie.runtime);

  return (
    <div className="netflix-movie-detail">
      {/* Video Player */}
      <VideoPlayer 
        movie={movie}
        onClose={handleClosePlayer}
        isVisible={showVideoPlayer}
      />

      {/* Netflix Hero */}
      <div className="netflix-movie-hero">
        {backdropUrl && (
          <div className="netflix-hero-background">
            <img src={backdropUrl} alt={movie.title} />
            <div className="netflix-hero-gradient" />
          </div>
        )}
        
        <div className="netflix-hero-content">
          <div className="netflix-hero-info">
            <motion.h1 
              className="netflix-hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {movie.title}
            </motion.h1>
            
            <motion.div 
              className="netflix-hero-meta"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="netflix-match">{getMatchPercentage()}% Match</span>
              <span className="netflix-year">{releaseYear}</span>
              <span className="netflix-rating">HD</span>
              <span className="netflix-runtime">{runtime}</span>
            </motion.div>
            
            <motion.p 
              className="netflix-hero-overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {movie.overview?.length > 300 ? `${movie.overview.substring(0, 300)}...` : movie.overview}
            </motion.p>

            {movie.genres && (
              <motion.div 
                className="netflix-genres"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {movie.genres.slice(0, 3).map((genre, index) => (
                  <span key={genre.id}>
                    {genre.name}
                    {index < Math.min(movie.genres.length, 3) - 1 && ' • '}
                  </span>
                ))}
              </motion.div>
            )}
            
            <motion.div 
              className="netflix-hero-buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <button 
                className="netflix-btn netflix-btn-play"
                onClick={handlePlayClick}
              >
                <Play size={20} fill="currentColor" />
                Play
              </button>
              <button 
                className="netflix-btn netflix-btn-info"
                onClick={() => setShowMoreInfo(true)}
              >
                <Plus size={20} />
                My List
              </button>
              <button 
                className="netflix-icon-btn"
                onClick={() => handleRating('up')}
                title="I like this"
              >
                <ThumbsUp size={20} fill={userRating === 'up' ? 'currentColor' : 'none'} />
              </button>
              <button 
                className="netflix-icon-btn"
                onClick={() => handleRating('down')}
                title="Not for me"
              >
                <ThumbsDown size={20} fill={userRating === 'down' ? 'currentColor' : 'none'} />
              </button>
              <button 
                className="netflix-icon-btn"
                onClick={handleShare}
                title="Share"
              >
                <Share2 size={20} />
              </button>
            </motion.div>
          </div>

          <div className="netflix-hero-controls">
            <button 
              className="netflix-volume-btn"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
            
            <div className="netflix-maturity-rating">
              18+
            </div>
          </div>
        </div>
      </div>

      {/* Movie Info Section */}
      <div className="netflix-movie-info">
        <div className="netflix-info-container">
          <div className="netflix-info-main">
            <div className="netflix-info-left">
              <div className="netflix-cast-info">
                <p><span>Cast:</span> {cast.slice(0, 4).map(actor => actor.name).join(', ')}</p>
                <p><span>Genres:</span> {movie.genres?.map(g => g.name).join(', ')}</p>
                <p><span>Director:</span> {getDirector()}</p>
              </div>
            </div>
            
            <div className="netflix-info-right">
              <div className="netflix-episodes-info">
                <h3>About {movie.title}</h3>
                <p><span>Director:</span> {getDirector()}</p>
                <p><span>Cast:</span> {cast.slice(0, 6).map(actor => actor.name).join(', ')}</p>
                <p><span>Genres:</span> {movie.genres?.map(g => g.name).join(', ')}</p>
                <p><span>This movie is:</span> {movie.genres?.slice(0, 2).map(g => g.name).join(', ')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Section */}
      <div className="netflix-download-section">
        <div className="netflix-info-container">
          <h2>Download Options</h2>
          <div className="netflix-download-grid">
            {[
              { quality: 'SD', size: '1.2 GB' },
              { quality: 'HD', size: '2.8 GB' },
              { quality: 'Full HD', size: '4.5 GB' },
              { quality: '4K', size: '8.2 GB' }
            ].map((item, index) => (
              <div key={index} className="netflix-download-card">
                <div className="download-info">
                  <h4>{item.quality} Quality</h4>
                  <p>{item.size}</p>
                </div>
                <button
                  className="netflix-download-btn"
                  onClick={() => handleDownload(item.quality)}
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Similar Movies */}
      {similarMovies.length > 0 && (
        <NetflixRow
          title="More Like This"
          content={similarMovies}
          onPlayClick={handlePlayClick}
        />
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <NetflixRow
          title="Because you watched this"
          content={recommendations}
          onPlayClick={handlePlayClick}
        />
      )}

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && (
          <motion.div
            className="netflix-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTrailer(false)}
          >
            <motion.div
              className="netflix-modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="netflix-modal-close"
                onClick={() => setShowTrailer(false)}
              >
                <X size={24} />
              </button>
              <div className="netflix-video-container">
                <iframe
                  width="100%"
                  height="400"
                  src={`https://www.youtube.com/embed/${getTrailerKey()}?autoplay=1`}
                  title="Movie Trailer"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MovieDetail;