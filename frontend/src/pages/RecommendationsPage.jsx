// frontend/src/pages/RecommendationsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fileBackend } from '../services/fileBackend.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import RecommendationCard from '../components/RecommendationCard.jsx';

const RecommendationsPage = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState({});
  const [heroData, setHeroData] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('role_based');
  const [selectedRole, setSelectedRole] = useState('Carry');
  const [filters, setFilters] = useState({
    skill_level: '',
    complexity: '',
    meta_only: false
  });

  useEffect(() => {
    loadRecommendations();
  }, []);

  useEffect(() => {
    if (recommendations.role_based && selectedRole) {
      // Auto-select first available role if current selection doesn't exist
      const availableRoles = Object.keys(recommendations.role_based);
      if (!availableRoles.includes(selectedRole) && availableRoles.length > 0) {
        setSelectedRole(availableRoles[0]);
      }
    }
  }, [recommendations, selectedRole]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user profile for personalized recommendations
      const profile = await fileBackend.getCurrentUserProfile();
      setUserProfile(profile);

      // Load recommendations with user preferences
      const recData = await fileBackend.getHeroRecommendations(filters);
      setRecommendations(recData);

      // Load hero data for additional info (optional fallback)
      try {
        const response = await fetch('https://api.opendota.com/api/heroes');
        if (response.ok) {
          const heroes = await response.json();
          const heroMap = heroes.reduce((map, hero) => {
            map[hero.id] = hero;
            return map;
          }, {});
          setHeroData(heroMap);
        }
      } catch (apiError) {
        console.warn('Failed to load additional hero data from OpenDota API:', apiError);
        // Continue without external data
      }
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // Reload recommendations with new filters
    loadRecommendations();
  };

  const renderCategoryTab = (categoryId, label, count = null) => (
    <button
      onClick={() => setActiveCategory(categoryId)}
      className={`px-4 py-2 rounded-t-lg transition-colors duration-200 ${
        activeCategory === categoryId
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {label} {count !== null && `(${count})`}
    </button>
  );

  const renderHeroCard = (hero, reason = null) => {
    const heroInfo = heroData[hero.id] || heroData[hero.hero_id] || hero;
    const cardData = {
      ...heroInfo,
      ...hero,
      reason: reason || hero.reason
    };

    return (
      <RecommendationCard
        key={hero.id || hero.hero_id}
        type="hero"
        data={cardData}
        onClick={() => {
          // Optional: Navigate to hero detail page
          console.log('Hero selected:', cardData);
        }}
      />
    );
  };

  const renderComboCard = (combo) => (
    <RecommendationCard
      key={combo.name || combo.id}
      type="combo"
      data={combo}
      showFavorites={false}
    />
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto mt-20">
        <div className="text-red-600 text-center">
          <h2 className="text-xl font-bold mb-4">Error Loading Recommendations</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={loadRecommendations}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto mt-20">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h1>
        <p className="text-gray-600 mb-6">
          Please log in to get personalized hero recommendations based on your preferences.
        </p>
        <Link
          to="/login"
          className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const availableRoles = recommendations.role_based ? Object.keys(recommendations.role_based) : [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Hero Recommendations</h1>
        <p className="text-gray-600">
          Personalized recommendations based on your skill level and preferences
          {userProfile && ` (${userProfile.preferences?.skill_level || 'beginner'} level)`}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Skill Level:</label>
            <select
              value={filters.skill_level}
              onChange={(e) => handleFilterChange('skill_level', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Complexity:</label>
            <select
              value={filters.complexity}
              onChange={(e) => handleFilterChange('complexity', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any</option>
              <option value="simple">Simple</option>
              <option value="moderate">Moderate</option>
              <option value="complex">Complex</option>
            </select>
          </div>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.meta_only}
              onChange={(e) => handleFilterChange('meta_only', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Meta heroes only</span>
          </label>

          <button
            onClick={loadRecommendations}
            className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {renderCategoryTab('role_based', 'By Role', availableRoles.length)}
          {recommendations.beginner_friendly && renderCategoryTab('beginner', 'Beginner Friendly', recommendations.beginner_friendly.length)}
          {recommendations.meta_picks && renderCategoryTab('meta', 'Meta Picks', recommendations.meta_picks.length)}
          {recommendations.counter_picks && renderCategoryTab('counters', 'Counters')}
          {recommendations.synergies?.strong_combos && renderCategoryTab('synergies', 'Synergies', recommendations.synergies.strong_combos.length)}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeCategory === 'role_based' && (
          <div>
            <div className="flex flex-wrap gap-2 mb-6">
              {availableRoles.map(role => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedRole === role
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {role} ({recommendations.role_based[role]?.length || 0})
                </button>
              ))}
            </div>

            {selectedRole && recommendations.role_based[selectedRole] && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Recommended {selectedRole} Heroes
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {recommendations.role_based[selectedRole].map(hero =>
                    renderHeroCard(hero, `Great ${selectedRole.toLowerCase()} for your skill level`)
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeCategory === 'beginner' && recommendations.beginner_friendly && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Beginner Friendly Heroes</h2>
            <p className="text-gray-600 mb-6">
              These heroes are great for learning the game with straightforward mechanics and forgiving gameplay.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recommendations.beginner_friendly.map(hero =>
                renderHeroCard(hero, 'Perfect for learning the game')
              )}
            </div>
          </div>
        )}

        {activeCategory === 'meta' && recommendations.meta_picks && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Meta Picks</h2>
            <p className="text-gray-600 mb-6">
              Heroes that are particularly strong in the current meta and ranked matches.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recommendations.meta_picks.map(hero =>
                renderHeroCard(hero, 'Strong in current meta')
              )}
            </div>
          </div>
        )}

        {activeCategory === 'counters' && recommendations.counter_picks && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Counter Picks</h2>
            <p className="text-gray-600 mb-6">
              Select a hero to see its counters and who it's effective against.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.keys(recommendations.counter_picks).slice(0, 12).map(heroId => {
                const heroName = heroData[heroId]?.localized_name || `Hero ${heroId}`;
                const counterData = recommendations.counter_picks[heroId];
                return (
                  <div key={heroId} className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-sm text-gray-800 mb-2">{heroName}</h3>
                    <p className="text-xs text-gray-600">
                      Counters: {counterData.counters?.length || 0}
                    </p>
                    <p className="text-xs text-gray-600">
                      Countered by: {counterData.countered_by?.length || 0}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeCategory === 'synergies' && recommendations.synergies?.strong_combos && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Hero Synergies</h2>
            <p className="text-gray-600 mb-6">
              Powerful hero combinations that work well together.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recommendations.synergies.strong_combos.map((combo, index) =>
                renderComboCard({ ...combo, id: index })
              )}
            </div>
          </div>
        )}

        {/* No Profile Prompt */}
        {!userProfile && (
          <div className="text-center py-8 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Get Personalized Recommendations
            </h3>
            <p className="text-gray-600 mb-4">
              Create a user profile to get recommendations tailored to your skill level and preferences.
            </p>
            <Link
              to="/profile"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;