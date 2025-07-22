import React from 'react';
import { motion } from 'framer-motion';

const NetflixToggle = ({ activeMode, onModeChange, loading = false }) => {
  const modes = [
    { id: 'movies', label: 'Movies' },
    { id: 'tv', label: 'TV Shows' }
  ];

  return (
    <div className="netflix-toggle-container">
      <div className="netflix-toggle">
        {modes.map((mode, index) => (
          <button
            key={mode.id}
            className={`netflix-toggle-btn ${activeMode === mode.id ? 'active' : ''}`}
            onClick={() => !loading && onModeChange(mode.id)}
            disabled={loading}
          >
            {mode.label}
            {activeMode === mode.id && (
              <motion.div
                className="netflix-toggle-indicator"
                layoutId="netflix-toggle-indicator"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NetflixToggle;