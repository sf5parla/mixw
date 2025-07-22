import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share2, Settings, Maximize, Volume2, VolumeX } from 'lucide-react';
import tmdbApi from '../services/tmdbApi';
import NetflixRow from '../components/NetflixRow';

const WatchMovie = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCPAOffer, setShowCPAOffer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
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

  const handlePlayClick = async (item) => {
    // Navigate to watch page for the selected movie
    window.location.href = `/watch/${item.id}`;
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

  return (
    <div className="netflix-watch-page">
      {/* Video Player */}
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
            <button className="netflix-video-action-btn" title="Share">
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
                {isPlaying ? '⏸️' : '▶️'}
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

      {/* Related Movies */}
      {relatedMovies.length > 0 && (
        <div className="netflix-related-section">
          <NetflixRow
            title="More Like This"
            content={relatedMovies}
            onPlayClick={handlePlayClick}
          />
        </div>
      )}
    </div>
  );
};

export default WatchMovie;