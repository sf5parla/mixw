import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  SkipBack, 
  SkipForward,
  Settings,
  X,
  Star,
  Calendar,
  Clock,
  Users
} from 'lucide-react';

const VideoPlayer = ({ movie, onClose, isVisible }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showCPAOffer, setShowCPAOffer] = useState(false);
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Demo video URL
  const demoVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const pauseTime = 10; // seconds

  useEffect(() => {
    if (isVisible && videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setShowCPAOffer(false);
    }
  }, [isVisible, movie]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      // Show CPA offer after pause time
      if (video.currentTime >= pauseTime && !showCPAOffer && isPlaying) {
        video.pause();
        setIsPlaying(false);
        setShowCPAOffer(true);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [isPlaying, showCPAOffer]);

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

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const handleCPAComplete = () => {
    setShowCPAOffer(false);
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  if (!isVisible || !movie) return null;

  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${movie.backdrop_path}`
    : null;

  return (
    <AnimatePresence>
      <motion.div
        className="video-player-container"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
      >
        <div 
          ref={containerRef}
          className={`video-player-wrapper ${isFullscreen ? 'fullscreen' : ''}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          <button className="close-btn" onClick={onClose} aria-label="Close video player">
            <X size={24} />
          </button>

          <video
            ref={videoRef}
            className="video-element"
            poster={backdropUrl}
            preload="metadata"
            onClick={togglePlay}
          >
            <source src={demoVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Video Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                className="video-controls"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="controls-top">
                  <div className="video-info">
                    <h2 className="video-title">{movie.title || movie.name}</h2>
                    <div className="video-meta">
                      <span className="rating">
                        <Star size={14} fill="currentColor" />
                        {movie.vote_average?.toFixed(1)}
                      </span>
                      <span className="year">
                        <Calendar size={14} />
                        {new Date(movie.release_date || movie.first_air_date).getFullYear()}
                      </span>
                      <span className="duration">
                        <Clock size={14} />
                        {formatTime(duration)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="controls-bottom">
                  <div className="progress-container">
                    <div 
                      className="progress-bar"
                      onClick={handleSeek}
                    >
                      <div 
                        className="progress-fill"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                      <div 
                        className="progress-thumb"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="controls-row">
                    <div className="controls-left">
                      <button onClick={togglePlay} className="control-btn" aria-label={isPlaying ? 'Pause' : 'Play'}>
                        {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
                      </button>
                      
                      <button className="control-btn" aria-label="Skip backward 10 seconds">
                        <SkipBack size={20} />
                      </button>
                      
                      <button className="control-btn" aria-label="Skip forward 10 seconds">
                        <SkipForward size={20} />
                      </button>

                      <div className="volume-control">
                        <button onClick={toggleMute} className="control-btn" aria-label={isMuted ? 'Unmute' : 'Mute'}>
                          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="volume-slider"
                          aria-label="Volume"
                        />
                      </div>

                      <div className="time-display">
                        <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                      </div>
                    </div>

                    <div className="controls-right">
                      <button className="control-btn" aria-label="Settings">
                        <Settings size={20} />
                      </button>
                      
                      <button onClick={toggleFullscreen} className="control-btn" aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CPA Offer Overlay */}
          <AnimatePresence>
            {showCPAOffer && (
              <motion.div
                className="cpa-overlay"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className="cpa-content">
                  <h3>Continue Watching</h3>
                  <p>To continue watching this movie, please complete a quick offer below.</p>
                  <button onClick={handleCPAComplete} className="cpa-btn">
                    Complete Offer & Continue
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Movie Information Panel */}
        <div className="movie-info-panel">
          <div className="container">
            <div className="movie-details">
              <div className="movie-poster">
                <img 
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : 'https://via.placeholder.com/300x450/1a1a1a/666?text=No+Image'}
                  alt={`${movie.title || movie.name} poster`}
                />
              </div>
              
              <div className="movie-info">
                <h1>{movie.title || movie.name}</h1>
                
                <div className="movie-meta-detailed">
                  <div className="meta-item">
                    <Star size={16} fill="currentColor" />
                    <span>{movie.vote_average?.toFixed(1)} / 10</span>
                  </div>
                  <div className="meta-item">
                    <Calendar size={16} />
                    <span>{new Date(movie.release_date || movie.first_air_date).getFullYear()}</span>
                  </div>
                  <div className="meta-item">
                    <Users size={16} />
                    <span>{movie.vote_count?.toLocaleString()} votes</span>
                  </div>
                </div>

                {movie.genres && (
                  <div className="genre-tags">
                    {movie.genres.slice(0, 3).map((genre) => (
                      <span key={genre.id} className="genre-tag">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}

                <p className="movie-description">
                  {movie.overview || 'No description available for this content.'}
                </p>

                <div className="movie-actions">
                  <button className="action-btn primary">
                    <Play size={16} fill="currentColor" />
                    Watch Now
                  </button>
                  <button className="action-btn secondary">
                    <Plus size={16} />
                    Add to List
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoPlayer;