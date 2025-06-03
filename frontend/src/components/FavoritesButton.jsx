// frontend/src/components/FavoritesButton.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { fileBackend } from '../services/fileBackend.js';

const MotionButton = motion.button;

// CSS Spinner component
const Spinner = ({ className = "" }) => (
  <div className={`animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent ${className}`} />
);

// Simple tooltip component
const Tooltip = ({ children, label, ...props }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-800 rounded-md whitespace-nowrap z-50 border border-slate-600">
          {label}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
        </div>
      )}
    </div>
  );
};

// Heart icon component
const HeartIcon = ({ filled = false, ...props }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

// Animation variants for Framer Motion
const pulseVariants = {
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};


const FavoritesButton = ({ 
  type, // 'hero' or 'item'
  id, 
  name, 
  role = null, // for heroes
  category = null, // for items
  className = ''
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkFavoriteStatus();
  }, [checkFavoriteStatus]);

  const checkFavoriteStatus = useCallback(async () => {
    try {
      if (type === 'hero') {
        const favorites = await fileBackend.getFavoriteHeroes();
        setIsFavorite(favorites.some(fav => fav.hero_id === id));
      } else if (type === 'item') {
        const favorites = await fileBackend.getFavoriteItems();
        setIsFavorite(favorites.some(fav => fav.item_id === id));
      }
    } catch (err) {
      console.error('Error checking favorite status:', err);
      setError('Failed to check favorite status');
    }
  }, [type, id]);

  const toggleFavorite = async (e) => {
    e.stopPropagation(); // Prevent triggering parent click events
    setLoading(true);
    setError(null);

    try {
      if (isFavorite) {
        // Remove from favorites
        if (type === 'hero') {
          await fileBackend.removeFavoriteHero(id);
        } else if (type === 'item') {
          await fileBackend.removeFavoriteItem(id);
        }
        setIsFavorite(false);
      } else {
        // Add to favorites
        if (type === 'hero') {
          await fileBackend.addFavoriteHero(id, name, role);
        } else if (type === 'item') {
          await fileBackend.addFavoriteItem(id, name, category);
        }
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError('Failed to update favorite');
      // Revert the optimistic update
      checkFavoriteStatus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Tooltip
        label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <MotionButton
          onClick={toggleFavorite}
          disabled={loading}
          aria-label={`${isFavorite ? 'Remove from' : 'Add to'} favorites`}
          className={`
            relative p-2 rounded-md border transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-800
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isFavorite 
              ? 'bg-red-400/10 text-red-400 border-red-400 hover:bg-red-400/20 hover:shadow-lg hover:shadow-red-400/30' 
              : 'bg-slate-700/50 text-slate-400 border-transparent hover:bg-red-400/10 hover:text-red-400 hover:border-red-400'
            }
            hover:-translate-y-0.5 active:scale-90
            ${isFavorite ? 'scale-110' : 'scale-100'}
            ${className}
          `}
          whileHover={{ scale: isFavorite ? 1.2 : 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {loading ? (
            <Spinner />
          ) : (
            <div className="relative">
              <HeartIcon
                filled={isFavorite}
                style={{
                  transition: "all 0.3s ease",
                  transform: isFavorite ? "scale(1.1)" : "scale(1)",
                }}
              />
              {isFavorite && (
                <motion.div
                  className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-slate-800"
                  variants={pulseVariants}
                  animate="animate"
                />
              )}
            </div>
          )}
        </MotionButton>
      </Tooltip>
      
      {error && (
        <div className="absolute top-full left-0 mt-1 px-3 py-2 text-xs text-white bg-red-600 rounded-md shadow-lg whitespace-nowrap z-10 max-w-[200px] border border-red-500">
          <div className="flex items-center gap-1">
            <span className="text-yellow-300">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesButton;