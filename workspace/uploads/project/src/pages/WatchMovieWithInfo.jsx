import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Settings, 
  Maximize, 
  Volume2, 
  VolumeX,
  Play,
  Pause,
  Star,
  Calendar,
  Clock,
  Plus,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import tmdbApi from '../services/tmdbApi';
import NetflixRow from '../components/NetflixRow';
import './WatchMovieWithInfo.css';

const WatchMovieWithInfo = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCPAOffer, setShowCPAOffer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [userRating, setUserRating] = useState(null);
  const videoRef = useRef(null);

  const demoVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const pauseTime = 10; // seconds

  useEffect(() => {
    if (id) {
      fetchMovieDetails();
      fetchRelatedMovies();
    }
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      const data = await tmdbApi.getMovieDetails(id);
      setMovie(data);
      setCast(data.credits?.cast?.slice(0, 20) || []);
      setCrew(data.credits?.crew?.filter(person => 
        ['Director', 'Producer', 'Executive Producer', 'Screenplay', 'Writer'].includes(person.job)
      ).slice(0, 10) || []);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedMovies = async () => {
    try {
      const data = await tmdbApi.getMovieDetails(id);
      setRelatedMovies(data.similar?.results || []);
    } catch (error) {
      console.error('Error fetching related movies:', error);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= pauseTime && !showCPAOffer && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowCPAOffer(true);
    }
  };

  const handleCPAComplete = () => {
    setShowCPAOffer(false);
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
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

  const handleRating = (rating) => {
    setUserRating(rating);
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

  if (!movie) {
    return (
      <div className="netflix-error">
        <h2>Movie Not Found</h2>
        <p>The requested movie could not be found.</p>
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
    <div className="combined-watch-page">
      {/* Video Player Section */}
      <div className="netflix-video-player">
        <div className="netflix-video-header">
          <Link to={`/movie/${id}`} className="netflix-back-btn">
            <ArrowLeft size={24} />
          </Link>
          <h2>{movie.title}</h2>
          <div className="netflix-video-actions">
            <button className="netflix-video-action-btn" title="Download">
              <Download size={20} />
            </button>
            <button className="netflix-video-action-btn" title="Share" onClick={handleShare}>
              <Share2 size={20} />
            </button>
            <button className="netflix-video-action-btn" title="Settings">
              <Settings size={20} />
            </button>
            <button className="netflix-video-action-btn" title="Fullscreen">
              <Maximize size={20} />
            </button>
          </div>
        </div>

        <div className="netflix-video-container">
          <video
            ref={videoRef}
            className="netflix-video"
            poster={backdropUrl}
            controls={false}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
          >
            <source src={demoVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Custom Controls */}
          <div className={`netflix-video-controls ${showControls ? 'visible' : ''}`}>
            <div className="netflix-controls-overlay">
              <button 
                className="netflix-play-pause-btn"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause size={40} /> : <Play size={40} fill="currentColor" />}
              </button>
              
              <div className="netflix-volume-controls">
                <button onClick={toggleMute}>
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* CPA Offer Overlay */}
          {showCPAOffer && (
            <motion.div
              className="netflix-cpa-overlay"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="netflix-cpa-content">
                <h2>Continue Watching</h2>
                <p>To continue watching this movie, please complete a quick offer below.</p>
                <button
                  onClick={handleCPAComplete}
                  className="netflix-btn netflix-btn-primary"
                >
                  Complete Offer & Continue
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Movie Information Section */}
      <div className="movie-info-section">
        <div className="movie-info-container">
          <div className="movie-info-main">
            {/* Left side - Poster and basic info */}
            <div className="movie-info-left">
              <div className="movie-poster">
                <img src={posterUrl} alt={movie.title} />
              </div>
            </div>

            {/* Right side - Details */}
            <div className="movie-info-right">
              <div className="movie-details">
                <h1 className="movie-title">{movie.title}</h1>
                
                <div className="movie-meta">
                  <span className="movie-rating">
                    <Star size={16} fill="currentColor" />
                    {rating.text}
                  </span>
                  <span className="movie-year">
                    <Calendar size={16} />
                    {releaseYear}
                  </span>
                  <span className="movie-runtime">
                    <Clock size={16} />
                    {runtime}
                  </span>
                  <span className="match-percentage">{getMatchPercentage()}% Match</span>
                </div>

                <div className="movie-genres">
                  {movie.genres?.map((genre, index) => (
                    <span key={genre.id} className="genre-tag">
                      {genre.name}
                      {index < movie.genres.length - 1 && ' • '}
                    </span>
                  ))}
                </div>

                <p className="movie-overview">{movie.overview}</p>

                <div className="movie-action-buttons">
                  <button className="netflix-btn netflix-btn-secondary">
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
                </div>

                <div className="movie-cast-crew">
                  <div className="cast-info">
                    <p><span>Cast:</span> {cast.slice(0, 4).map(actor => actor.name).join(', ')}</p>
                    <p><span>Director:</span> {getDirector()}</p>
                    <p><span>Genres:</span> {movie.genres?.map(g => g.name).join(', ')}</p>
                  </div>
                </div>
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

      {/* Related Movies */}
      {relatedMovies.length > 0 && (
        <div className="netflix-related-section">
          <NetflixRow
            title="More Like This"
            content={relatedMovies}
            onPlayClick={(item) => window.location.href = `/watch-with-info/${item.id}`}
          />
        </div>
      )}
    </div>
  );
};

export default WatchMovieWithInfo;