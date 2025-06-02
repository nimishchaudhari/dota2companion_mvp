// frontend/src/pages/UserProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fileBackend } from '../services/fileBackend.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import UserPreferences from '../components/UserPreferences.jsx';
import RecommendationCard from '../components/RecommendationCard.jsx';
import FavoritesButton from '../components/FavoritesButton.jsx';

const UserProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [favoriteHeroes, setFavoriteHeroes] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [customBuilds, setCustomBuilds] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load or create user profile
      let userProfile = await fileBackend.getCurrentUserProfile();
      
      if (!userProfile && user) {
        // Create a new profile if none exists
        userProfile = await fileBackend.createUserProfile(
          user.steamId,
          user.personaName,
          {
            skill_level: 'beginner',
            preferred_roles: [],
            playstyle: 'balanced'
          }
        );
      }

      if (userProfile) {
        setProfile(userProfile);
        
        // Load user's favorites and custom data
        const [heroes, items, builds, matches] = await Promise.all([
          fileBackend.getFavoriteHeroes(),
          fileBackend.getFavoriteItems(),
          fileBackend.getCustomBuilds(),
          fileBackend.getCachedMatches(5)
        ]);

        setFavoriteHeroes(heroes);
        setFavoriteItems(items);
        setCustomBuilds(builds);
        setRecentMatches(matches);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const newProfile = await fileBackend.createUserProfile(
        user.steamId,
        user.personaName
      );
      setProfile(newProfile);
      setShowPreferences(true);
    } catch (err) {
      console.error('Error creating profile:', err);
      setError('Failed to create profile');
    }
  };

  const handlePreferencesSave = (preferences) => {
    setProfile(prev => ({ ...prev, preferences }));
    setShowPreferences(false);
  };

  const handleExportData = async () => {
    try {
      const userData = await fileBackend.exportUserData();
      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dota2-companion-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Failed to export data');
    }
  };

  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const userData = JSON.parse(text);
      await fileBackend.importUserData(userData);
      await loadUserData(); // Reload data
    } catch (err) {
      console.error('Error importing data:', err);
      setError('Failed to import data');
    }
  };

  const renderTabButton = (tabId, label) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 py-2 rounded-t-lg transition-colors duration-200 ${
        activeTab === tabId
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto mt-20">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h1>
        <p className="text-gray-600 mb-6">You need to log in to access your profile.</p>
        <Link
          to="/login"
          className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto mt-20">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Dota 2 Companion!</h1>
        <p className="text-gray-600 mb-6">
          Create your profile to start tracking favorites, custom builds, and get personalized recommendations.
        </p>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <button
          onClick={handleCreateProfile}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Create Profile
        </button>
      </div>
    );
  }

  if (showPreferences) {
    return (
      <UserPreferences
        onSave={handlePreferencesSave}
        onCancel={() => setShowPreferences(false)}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {user.avatarUrl && (
              <img
                src={user.avatarUrl}
                alt={profile.persona_name}
                className="w-16 h-16 rounded-full border-4 border-blue-200"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{profile.persona_name}</h1>
              <p className="text-gray-600">Steam ID: {profile.steam_id}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowPreferences(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit Preferences
            </button>
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Export Data
            </button>
            <label className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors cursor-pointer">
              Import Data
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {renderTabButton('profile', 'Profile Overview')}
          {renderTabButton('favorites', `Favorites (${favoriteHeroes.length + favoriteItems.length})`)}
          {renderTabButton('builds', `Custom Builds (${customBuilds.length})`)}
          {renderTabButton('matches', 'Recent Matches')}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Profile Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Preferences</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Skill Level:</span> {profile.preferences?.skill_level || 'Not set'}</p>
                  <p><span className="font-medium">Playstyle:</span> {profile.preferences?.playstyle || 'Not set'}</p>
                  <p><span className="font-medium">Preferred Roles:</span> {
                    profile.preferences?.preferred_roles?.length > 0 
                      ? profile.preferences.preferred_roles.join(', ')
                      : 'None selected'
                  }</p>
                  <p><span className="font-medium">Game Mode:</span> {profile.preferences?.game_mode_preference || 'Not set'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Statistics</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Favorite Heroes:</span> {favoriteHeroes.length}</p>
                  <p><span className="font-medium">Favorite Items:</span> {favoriteItems.length}</p>
                  <p><span className="font-medium">Custom Builds:</span> {customBuilds.length}</p>
                  <p><span className="font-medium">Cached Matches:</span> {recentMatches.length}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/heroes"
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  Browse Heroes
                </Link>
                <Link
                  to="/recommendations"
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                >
                  Get Recommendations
                </Link>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                >
                  View Favorites
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Favorites</h2>
            
            {favoriteHeroes.length === 0 && favoriteItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">You haven't added any favorites yet.</p>
                <Link
                  to="/heroes"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Browse Heroes to Add Favorites
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {favoriteHeroes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      Favorite Heroes ({favoriteHeroes.length})
                    </h3>
                    <div className="space-y-3">
                      {favoriteHeroes.map(hero => (
                        <div key={hero.hero_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-xs font-bold">
                              {hero.hero_name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{hero.hero_name}</p>
                              <p className="text-sm text-gray-600">{hero.role}</p>
                              {hero.notes && (
                                <p className="text-xs text-gray-500 italic">{hero.notes}</p>
                              )}
                            </div>
                          </div>
                          <FavoritesButton
                            type="hero"
                            id={hero.hero_id}
                            name={hero.hero_name}
                            role={hero.role}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {favoriteItems.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      Favorite Items ({favoriteItems.length})
                    </h3>
                    <div className="space-y-3">
                      {favoriteItems.map(item => (
                        <div key={item.item_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-xs font-bold">
                              {item.item_name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{item.item_name}</p>
                              <p className="text-sm text-gray-600">{item.category}</p>
                              {item.notes && (
                                <p className="text-xs text-gray-500 italic">{item.notes}</p>
                              )}
                            </div>
                          </div>
                          <FavoritesButton
                            type="item"
                            id={item.item_id}
                            name={item.item_name}
                            category={item.category}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'builds' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Custom Builds</h2>
            
            {customBuilds.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">You haven't created any custom builds yet.</p>
                <p className="text-sm text-gray-500">Create builds while browsing heroes or items to see them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {customBuilds.map(build => (
                  <RecommendationCard
                    key={build.build_id}
                    type="build"
                    data={build}
                    showFavorites={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Matches</h2>
            
            {recentMatches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No recent matches cached.</p>
                <p className="text-sm text-gray-500">Matches will be cached automatically when you view player profiles.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMatches.map(match => (
                  <div key={match.match_id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">Match ID: {match.match_id}</p>
                        <p className="text-sm text-gray-600">
                          {match.result === 'win' ? '✅' : '❌'} {match.result.toUpperCase()} - {match.duration}s
                        </p>
                        <p className="text-sm text-gray-600">
                          KDA: {match.kda?.kills || 0}/{match.kda?.deaths || 0}/{match.kda?.assists || 0}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(match.cached_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;