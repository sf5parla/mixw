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
  Users,
  Download,
  Share2
} from 'lucide-react';
import tmdbApi from '../../services/tmdbApi';
import './VideoPlayer.css';

const VideoPlayer = ({ movie, onClose, isVisible }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showCPAOffer, setShowCPAOffer] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState('HD');
  
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressRef = useRef(null);

  // Demo video URL - replace with actual video service
  const demoVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const pauseTime = 10; // seconds for CPA offer

  // Initialize video when visible
  useEffect(() => {
    if (isVisible && videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setShowCPAOffer(false);
      setIsPlaying(false);
    }
  }, [isVisible, movie]);

  // Video event listeners
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

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedPercent = (bufferedEnd / video.duration) * 100;
        setBuffered(bufferedPercent);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [isPlaying, showCPAOffer]);

  // Fullscreen event listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isVisible) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'ArrowLeft':
          skipTime(-10);
          break;
        case 'ArrowRight':
          skipTime(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          } else {
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, isFullscreen]);

  // Control functions
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const adjustVolume = (delta) => {
    if (videoRef.current) {
      const newVolume = Math.max(0, Math.min(1, volume + delta));
      videoRef.current.volume = newVolume;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
  };

  const skipTime = (seconds) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      videoRef.current.currentTime = newTime;
    }
  };

  const handleSeek = (e) => {
    if (!progressRef.current || !videoRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    videoRef.current.currentTime = Math.max(0, Math.min(duration, newTime));
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current?.requestFullscreen();
      } catch (error) {
        console.error('Error entering fullscreen:', error);
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.error('Error exiting fullscreen:', error);
      }
    }
  };

  const changePlaybackRate = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSettings(false);
    }
  };

  const formatTime = (time) => {
    if (!time || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettings) setShowControls(false);
    }, 3000);
  };

  const handleCPAComplete = () => {
    setShowCPAOffer(false);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleDownload = () => {
    alert('Complete the CPA offer to download this movie!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title || movie.name,
          text: `Watch ${movie.title || movie.name} on StreamFlix`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (!isVisible || !movie) return null;

  const backdropUrl = tmdbApi.getImageURL(movie.backdrop_path, 'w1920_and_h800_multi_faces');
  const rating = tmdbApi.formatRating(movie.vote_average);
  const releaseYear = tmdbApi.formatDate(movie.release_date || movie.first_air_date);
  const runtime = tmdbApi.formatRuntime(movie.runtime);

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
          onMouseLeave={() => isPlaying && !showSettings && setShowControls(false)}
        >
          <button 
            className="close-btn" 
            onClick={onClose} 
            aria-label="Close video player"
          >
            <X size={24} />
          </button>

          <video
            ref={videoRef}
            className="video-element"
            poster={backdropUrl}
            preload="metadata"
            onClick={togglePlay}
            playsInline
          >
            <source src={demoVideoUrl} type="video/mp4" />
            <track kind="captions" src="" srcLang="en" label="English" />
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
                        {rating.text}
                      </span>
                      <span className="year">
                        <Calendar size={14} />
                        {releaseYear}
                      </span>
                      <span className="duration">
                        <Clock size={14} />
                        {runtime}
                      </span>
                      <span className="quality-indicator">{quality}</span>
                    </div>
                  </div>

                  <div className="video-actions">
                    <button 
                      className="action-btn"
                      onClick={handleDownload}
                      title="Download"
                    >
                      <Download size={20} />
                    </button>
                    <button 
                      className="action-btn"
                      onClick={handleShare}
                      title="Share"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="controls-bottom">
                  <div className="progress-container">
                    <div 
                      ref={progressRef}
                      className="progress-bar"
                      onClick={handleSeek}
                    >
                      <div 
                        className="progress-buffer"
                        style={{ width: `${buffered}%` }}
                      />
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
                      <button 
                        onClick={togglePlay} 
                        className="control-btn play-btn" 
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
                      </button>
                      
                      <button 
                        className="control-btn" 
                        onClick={() => skipTime(-10)}
                        aria-label="Skip backward 10 seconds"
                      >
                        <SkipBack size={20} />
                      </button>
                      
                      <button 
                        className="control-btn" 
                        onClick={() => skipTime(10)}
                        aria-label="Skip forward 10 seconds"
                      >
                        <SkipForward size={20} />
                      </button>

                      <div className="volume-control">
                        <button 
                          onClick={toggleMute} 
                          className="control-btn" 
                          aria-label={isMuted ? 'Unmute' : 'Mute'}
                        >
                          {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={isMuted ? 0 : volume}
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
                      <div className="settings-container">
                        <button 
                          className="control-btn" 
                          onClick={() => setShowSettings(!showSettings)}
                          aria-label="Settings"
                        >
                          <Settings size={20} />
                        </button>

                        <AnimatePresence>
                          {showSettings && (
                            <motion.div
                              className="settings-menu"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                            >
                              <div className="settings-section">
                                <h4>Playback Speed</h4>
                                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                  <button
                                    key={rate}
                                    className={`settings-option ${playbackRate === rate ? 'active' : ''}`}
                                    onClick={() => changePlaybackRate(rate)}
                                  >
                                    {rate}x
                                  </button>
                                ))}
                              </div>
                              <div className="settings-section">
                                <h4>Quality</h4>
                                {['Auto', '1080p', '720p', '480p'].map((q) => (
                                  <button
                                    key={q}
                                    className={`settings-option ${quality === q ? 'active' : ''}`}
                                    onClick={() => setQuality(q)}
                                  >
                                    {q}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <button 
                        onClick={toggleFullscreen} 
                        className="control-btn" 
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                      >
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
                  <div className="cpa-icon">🎬</div>
                  <h3>Continue Watching</h3>
                  <p>To continue watching this movie, please complete a quick offer below.</p>
                  <div className="cpa-benefits">
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>Unlimited streaming</span>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>HD quality</span>
                    </div>
                    <div className="benefit-item">
                      <span className="benefit-icon">✓</span>
                      <span>No ads</span>
                    </div>
                  </div>
                  <button onClick={handleCPAComplete} className="cpa-btn">
                    Complete Offer & Continue
                  </button>
                  <p className="cpa-disclaimer">
                    This helps us keep the service free for everyone
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading indicator */}
          {duration === 0 && (
            <div className="video-loading">
              <div className="loading-spinner" />
              <span>Loading video...</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoPlayer;