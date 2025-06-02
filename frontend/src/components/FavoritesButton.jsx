// frontend/src/components/FavoritesButton.jsx
import React, { useState, useEffect } from 'react';
import { fileBackend } from '../services/fileBackend.js';

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
  }, [type, id]);

  const checkFavoriteStatus = async () => {
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
  };

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

  const buttonClass = `
    relative group inline-flex items-center justify-center p-2 rounded-md transition-all duration-200 ease-in-out
    ${isFavorite 
      ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100' 
      : 'text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50'
    }
    ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  return (
    <div className="relative">
      <button
        onClick={toggleFavorite}
        disabled={loading}
        className={buttonClass}
        title={`${isFavorite ? 'Remove from' : 'Add to'} favorites`}
        aria-label={`${isFavorite ? 'Remove from' : 'Add to'} favorites`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
        ) : (
          <svg 
            className={`w-5 h-5 transition-transform duration-200 ${isFavorite ? 'scale-110' : 'scale-100 group-hover:scale-110'}`}
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
        )}
        {isFavorite && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
        )}
      </button>
      
      {error && (
        <div className="absolute top-full left-0 mt-1 px-2 py-1 bg-red-100 text-red-600 text-xs rounded shadow-lg whitespace-nowrap z-10">
          {error}
        </div>
      )}
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      </div>
    </div>
  );
};

export default FavoritesButton;