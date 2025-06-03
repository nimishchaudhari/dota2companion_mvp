// frontend/src/pages/RecommendationsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaStar, FaTrophy, FaUsers, FaFilter } from 'react-icons/fa';
import { FaShield } from 'react-icons/fa6';
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
  const [selectedRole, setSelectedRole] = useState('Carry');
  const [activeTab, setActiveTab] = useState('role_based');
  const [filters, setFilters] = useState({
    skill_level: '',
    complexity: '',
    meta_only: false
  });

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  useEffect(() => {
    if (recommendations.role_based && selectedRole) {
      // Auto-select first available role if current selection doesn't exist
      const availableRoles = Object.keys(recommendations.role_based);
      if (!availableRoles.includes(selectedRole) && availableRoles.length > 0) {
        setSelectedRole(availableRoles[0]);
      }
    }
  }, [recommendations, selectedRole]);

  const loadRecommendations = useCallback(async () => {
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
  }, [filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // Reload recommendations with new filters
    loadRecommendations();
  };

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
          // Hero selected
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
      <div className="max-w-7xl mx-auto py-8 flex flex-col items-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent"></div>
          <div className="text-slate-400">Loading recommendations...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-20">
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-8 text-center">
          <div className="flex flex-col space-y-6">
            <div className="bg-slate-700 border border-red-500 rounded-md p-4">
              <div className="flex flex-col space-y-2 text-left">
                <h2 className="text-xl font-semibold text-white">
                  Error Loading Recommendations
                </h2>
                <div className="text-slate-400">{error}</div>
              </div>
            </div>
            <button
              onClick={loadRecommendations}
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg text-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20">
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-8 text-center">
          <div className="flex flex-col space-y-6">
            <FaUser className="w-16 h-16 mx-auto text-slate-500" />
            <div className="flex flex-col space-y-2">
              <h1 className="text-2xl font-bold text-white">
                Login Required
              </h1>
              <div className="text-slate-400 leading-relaxed">
                Please log in to get personalized hero recommendations based on your preferences.
              </div>
            </div>
            <Link
              to="/login"
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg text-lg transition-colors w-full block"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const availableRoles = recommendations.role_based ? Object.keys(recommendations.role_based) : [];

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 
            className="text-4xl font-bold text-white mb-4"
            style={{textShadow: '0 0 10px rgba(39, 174, 158, 0.3)'}}
          >
            Hero Recommendations
          </h1>
          <div className="text-slate-400 text-lg">
            Personalized recommendations based on your skill level and preferences
            {userProfile && (
              <span className="ml-2 bg-teal-600 text-white px-2 py-1 text-sm rounded">
                {userProfile.preferences?.skill_level || 'beginner'} level
              </span>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
              <FaFilter className="text-teal-500" />
              <h2 className="text-sm font-semibold text-white">
                Filter Recommendations
              </h2>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center justify-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-slate-400">
                  Skill Level:
                </span>
                <select
                  value={filters.skill_level}
                  onChange={(e) => handleFilterChange('skill_level', e.target.value)}
                  className="text-sm w-auto min-w-[120px] bg-slate-700 border border-slate-600 text-white px-3 py-1 rounded focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-slate-400">
                  Complexity:
                </span>
                <select
                  value={filters.complexity}
                  onChange={(e) => handleFilterChange('complexity', e.target.value)}
                  className="text-sm w-auto min-w-[100px] bg-slate-700 border border-slate-600 text-white px-3 py-1 rounded focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                >
                  <option value="">Any</option>
                  <option value="simple">Simple</option>
                  <option value="moderate">Moderate</option>
                  <option value="complex">Complex</option>
                </select>
              </div>

              <label className="flex items-center space-x-2 text-slate-400 text-sm">
                <input
                  type="checkbox"
                  checked={filters.meta_only}
                  onChange={(e) => handleFilterChange('meta_only', e.target.checked)}
                  className="rounded border-slate-600 text-teal-500 focus:ring-teal-500"
                />
                <span>Meta heroes only</span>
              </label>

              <button
                onClick={loadRecommendations}
                className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-2 transition-colors"
              >
                <FaFilter />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div>
          <div className="bg-slate-800 border border-slate-600 rounded-md p-2">
            <div className="flex flex-wrap gap-1">
              <button 
                onClick={() => setActiveTab('role_based')}
                className={`${activeTab === 'role_based' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'} px-3 py-2 text-sm rounded-md transition-colors flex items-center space-x-2`}
              >
                <FaShield />
                <span>By Role ({availableRoles.length})</span>
              </button>
              {recommendations.beginner_friendly && (
                <button 
                  onClick={() => setActiveTab('beginner_friendly')}
                  className={`${activeTab === 'beginner_friendly' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'} px-3 py-2 text-sm rounded-md transition-colors flex items-center space-x-2`}
                >
                  <FaStar />
                  <span>Beginner Friendly ({recommendations.beginner_friendly.length})</span>
                </button>
              )}
              {recommendations.meta_picks && (
                <button 
                  onClick={() => setActiveTab('meta_picks')}
                  className={`${activeTab === 'meta_picks' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'} px-3 py-2 text-sm rounded-md transition-colors flex items-center space-x-2`}
                >
                  <FaTrophy />
                  <span>Meta Picks ({recommendations.meta_picks.length})</span>
                </button>
              )}
              {recommendations.counter_picks && (
                <button 
                  onClick={() => setActiveTab('counter_picks')}
                  className={`${activeTab === 'counter_picks' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'} px-3 py-2 text-sm rounded-md transition-colors flex items-center space-x-2`}
                >
                  <FaShield />
                  <span>Counters</span>
                </button>
              )}
              {recommendations.synergies?.strong_combos && (
                <button 
                  onClick={() => setActiveTab('synergies')}
                  className={`${activeTab === 'synergies' ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'} px-3 py-2 text-sm rounded-md transition-colors flex items-center space-x-2`}
                >
                  <FaUsers />
                  <span>Synergies ({recommendations.synergies.strong_combos.length})</span>
                </button>
              )}
            </div>
          </div>
          
          {activeTab === 'role_based' && (
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 mt-6">
                <div className="flex flex-col space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {availableRoles.map(role => (
                      <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={`${selectedRole === role ? 'bg-teal-500 text-white' : 'border border-slate-600 text-slate-400 hover:text-white hover:border-teal-500'} px-3 py-1 text-sm rounded-full transition-colors`}
                      >
                        {role} ({recommendations.role_based[role]?.length || 0})
                      </button>
                    ))}
                  </div>

                  {selectedRole && recommendations.role_based[selectedRole] && (
                    <div className="flex flex-col space-y-4">
                      <h2 className="text-xl font-semibold text-white">
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
              </div>
          )}

          {activeTab === 'beginner_friendly' && (
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 mt-6">
                <div className="flex flex-col space-y-6">
                  <div className="flex flex-col space-y-3 text-left">
                    <h2 className="text-xl font-semibold text-white">
                      Beginner Friendly Heroes
                    </h2>
                    <div className="text-slate-400">
                      These heroes are great for learning the game with straightforward mechanics and forgiving gameplay.
                    </div>
                  </div>
                  
                  {recommendations.beginner_friendly && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {recommendations.beginner_friendly.map(hero =>
                        renderHeroCard(hero, 'Perfect for learning the game')
                      )}
                    </div>
                  )}
                </div>
              </div>
          )}

          {activeTab === 'meta_picks' && (
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 mt-6">
                <div className="flex flex-col space-y-6">
                  <div className="flex flex-col space-y-3 text-left">
                    <h2 className="text-xl font-semibold text-white">
                      Current Meta Picks
                    </h2>
                    <div className="text-slate-400">
                      Heroes that are particularly strong in the current meta and ranked matches.
                    </div>
                  </div>
                  
                  {recommendations.meta_picks && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {recommendations.meta_picks.map(hero =>
                        renderHeroCard(hero, 'Strong in current meta')
                      )}
                    </div>
                  )}
                </div>
              </div>
          )}

          {activeTab === 'counter_picks' && (
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 mt-6">
                <div className="flex flex-col space-y-6">
                  <div className="flex flex-col space-y-3 text-left">
                    <h2 className="text-xl font-semibold text-white">
                      Counter Picks
                    </h2>
                    <div className="text-slate-400">
                      Select a hero to see its counters and who it's effective against.
                    </div>
                  </div>
                  
                  {recommendations.counter_picks && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Object.keys(recommendations.counter_picks).slice(0, 12).map(heroId => {
                        const heroName = heroData[heroId]?.localized_name || `Hero ${heroId}`;
                        const counterData = recommendations.counter_picks[heroId];
                        return (
                          <div key={heroId} className="bg-slate-700 border border-slate-600 rounded-lg p-3">
                            <div className="flex flex-col space-y-2 text-left">
                              <h3 className="text-xs font-semibold text-white truncate">
                                {heroName}
                              </h3>
                              <div className="flex flex-col space-y-1 text-xs">
                                <div className="text-slate-400">
                                  Counters: {counterData.counters?.length || 0}
                                </div>
                                <div className="text-slate-400">
                                  Countered by: {counterData.countered_by?.length || 0}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
          )}

          {activeTab === 'synergies' && (
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 mt-6">
                <div className="flex flex-col space-y-6">
                  <div className="flex flex-col space-y-3 text-left">
                    <h2 className="text-xl font-semibold text-white">
                      Hero Synergies
                    </h2>
                    <div className="text-slate-400">
                      Powerful hero combinations that work well together.
                    </div>
                  </div>
                  
                  {recommendations.synergies?.strong_combos && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {recommendations.synergies.strong_combos.map((combo, index) =>
                        renderComboCard({ ...combo, id: index })
                      )}
                    </div>
                  )}
                </div>
              </div>
          )}
        </div>

        {/* No Profile Prompt */}
        {!userProfile && (
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 border border-teal-500 rounded-lg p-8 text-center">
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col space-y-2">
                <h2 className="text-xl font-semibold text-white">
                  Get Personalized Recommendations
                </h2>
                <div className="text-slate-400">
                  Create a user profile to get recommendations tailored to your skill level and preferences.
                </div>
              </div>
              <Link
                to="/profile"
                className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg text-lg transition-colors inline-block"
              >
                Create Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;