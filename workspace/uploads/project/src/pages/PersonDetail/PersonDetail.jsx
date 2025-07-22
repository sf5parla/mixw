import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  MapPin, 
  Award, 
  Film, 
  Tv,
  ExternalLink,
  Star
} from 'lucide-react';
import tmdbApi from '../../services/tmdbApi';
import './PersonDetail.css';

const PersonDetail = () => {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [movieCredits, setMovieCredits] = useState([]);
  const [tvCredits, setTvCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('biography');

  useEffect(() => {
    if (id) {
      fetchPersonDetails();
    }
  }, [id]);

  const fetchPersonDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await tmdbApi.getPersonDetails(id);
      
      setPerson(data);
      setMovieCredits(data.movie_credits?.cast?.slice(0, 20) || []);
      setTvCredits(data.tv_credits?.cast?.slice(0, 20) || []);
      
    } catch (error) {
      console.error('Error fetching person details:', error);
      setError('Failed to load person details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return tmdbApi.formatDate(dateString, 'full');
  };

  const calculateAge = (birthday, deathday = null) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const endDate = deathday ? new Date(deathday) : new Date();
    const age = endDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = endDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="person-detail-loading">
        <div className="loading-container">
          <div className="loading-spinner" />
          <span>Loading person details...</span>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="person-detail-error">
        <div className="error-container">
          <h2>Oops! Something went wrong</h2>
          <p>{error || 'Person not found'}</p>
          <Link to="/people" className="btn-primary">
            Back to People
          </Link>
        </div>
      </div>
    );
  }

  const profileUrl = tmdbApi.getImageURL(person.profile_path, 'w500');
  const age = calculateAge(person.birthday, person.deathday);

  return (
    <div className="person-detail">
      {/* Hero Section */}
      <section className="person-hero">
        <div className="container">
          <motion.div 
            className="person-header"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="person-photo-container">
              <div className="person-photo-large">
                <img 
                  src={profileUrl || 'https://via.placeholder.com/500x750/333/fff?text=No+Image'} 
                  alt={person.name} 
                />
              </div>
            </div>
            
            <div className="person-info">
              <div className="person-title-section">
                <h1 className="person-name">{person.name}</h1>
                {person.also_known_as && person.also_known_as.length > 0 && (
                  <p className="person-aka">
                    Also known as: {person.also_known_as.slice(0, 3).join(', ')}
                  </p>
                )}
              </div>

              <div className="person-stats">
                <div className="stat-item">
                  <User size={16} />
                  <div className="stat-content">
                    <span className="stat-label">Known For</span>
                    <span className="stat-value">{person.known_for_department || 'Acting'}</span>
                  </div>
                </div>
                
                {person.birthday && (
                  <div className="stat-item">
                    <Calendar size={16} />
                    <div className="stat-content">
                      <span className="stat-label">Born</span>
                      <span className="stat-value">
                        {formatDate(person.birthday)}
                        {age && ` (${age} years old)`}
                      </span>
                    </div>
                  </div>
                )}
                
                {person.place_of_birth && (
                  <div className="stat-item">
                    <MapPin size={16} />
                    <div className="stat-content">
                      <span className="stat-label">Place of Birth</span>
                      <span className="stat-value">{person.place_of_birth}</span>
                    </div>
                  </div>
                )}
                
                {person.deathday && (
                  <div className="stat-item">
                    <Calendar size={16} />
                    <div className="stat-content">
                      <span className="stat-label">Died</span>
                      <span className="stat-value">{formatDate(person.deathday)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="person-popularity">
                <div className="popularity-score">
                  <Star size={20} fill="#ffd700" color="#ffd700" />
                  <span className="popularity-value">
                    {person.popularity?.toFixed(1) || 'N/A'}
                  </span>
                  <span className="popularity-label">Popularity Score</span>
                </div>
              </div>

              {person.homepage && (
                <div className="person-links">
                  <a 
                    href={person.homepage} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="external-link"
                  >
                    <ExternalLink size={16} />
                    Official Website
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="person-content">
        <div className="container">
          <div className="content-tabs">
            <button 
              className={`tab-btn ${activeTab === 'biography' ? 'active' : ''}`}
              onClick={() => setActiveTab('biography')}
            >
              Biography
            </button>
            <button 
              className={`tab-btn ${activeTab === 'movies' ? 'active' : ''}`}
              onClick={() => setActiveTab('movies')}
            >
              Movies ({movieCredits.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'tv' ? 'active' : ''}`}
              onClick={() => setActiveTab('tv')}
            >
              TV Shows ({tvCredits.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'biography' && (
              <motion.div
                className="biography-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {person.biography ? (
                  <div className="biography-text">
                    <h3>Biography</h3>
                    <div className="biography-paragraphs">
                      {person.biography.split('\n\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="no-biography">
                    <p>No biography available for {person.name}.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'movies' && (
              <motion.div
                className="credits-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {movieCredits.length > 0 ? (
                  <div className="credits-grid">
                    {movieCredits.map((movie) => (
                      <CreditCard key={movie.id} credit={movie} type="movie" />
                    ))}
                  </div>
                ) : (
                  <div className="no-credits">
                    <Film size={48} />
                    <p>No movie credits available.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'tv' && (
              <motion.div
                className="credits-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {tvCredits.length > 0 ? (
                  <div className="credits-grid">
                    {tvCredits.map((show) => (
                      <CreditCard key={show.id} credit={show} type="tv" />
                    ))}
                  </div>
                ) : (
                  <div className="no-credits">
                    <Tv size={48} />
                    <p>No TV show credits available.</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

// Credit Card Component
const CreditCard = ({ credit, type }) => {
  const posterUrl = tmdbApi.getImageURL(credit.poster_path, 'w300');
  const title = credit.title || credit.name;
  const releaseDate = credit.release_date || credit.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const rating = tmdbApi.formatRating(credit.vote_average);

  return (
    <motion.div
      className="credit-card"
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/${type}/${credit.id}`} className="credit-link">
        <div className="credit-poster">
          <img 
            src={posterUrl || 'https://via.placeholder.com/300x450/333/fff?text=No+Image'}
            alt={title}
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x450/333/fff?text=No+Image';
            }}
          />
          <div className="credit-overlay">
            <div className="credit-rating">
              <Star size={12} fill="#ffd700" color="#ffd700" />
              <span>{rating.text}</span>
            </div>
          </div>
        </div>
        
        <div className="credit-info">
          <h4 className="credit-title">{title}</h4>
          <p className="credit-character">{credit.character || 'Unknown Role'}</p>
          <p className="credit-year">{year}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default PersonDetail;