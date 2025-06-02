// frontend/src/components/UserPreferences.jsx
import React, { useState, useEffect } from 'react';
import { fileBackend } from '../services/fileBackend.js';

const UserPreferences = ({ onSave, onCancel, showTitle = true }) => {
  const [preferences, setPreferences] = useState({
    skill_level: 'beginner',
    preferred_roles: [],
    playstyle: 'balanced',
    game_mode_preference: 'all_pick',
    hero_complexity_preference: 'simple',
    communication_style: 'friendly',
    meta_focus: true,
    experimental_builds: false,
    show_beginner_tips: true,
    auto_save_builds: true,
    notification_preferences: {
      patch_updates: true,
      meta_changes: true,
      favorite_hero_updates: true
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      setLoading(true);
      const profile = await fileBackend.getCurrentUserProfile();
      if (profile?.preferences) {
        setPreferences(profile.preferences);
      }
    } catch (err) {
      console.error('Error loading user preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      await fileBackend.updateUserProfile({ preferences });
      
      if (onSave) {
        onSave(preferences);
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleToggle = (role) => {
    setPreferences(prev => ({
      ...prev,
      preferred_roles: prev.preferred_roles.includes(role)
        ? prev.preferred_roles.filter(r => r !== role)
        : [...prev.preferred_roles, role]
    }));
  };

  const handleNotificationChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      {showTitle && <h2 className="text-2xl font-bold text-gray-800 mb-6">User Preferences</h2>}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Skill Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skill Level
          </label>
          <select
            value={preferences.skill_level}
            onChange={(e) => setPreferences(prev => ({ ...prev, skill_level: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        {/* Preferred Roles */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Roles (select multiple)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['Carry', 'Support', 'Nuker', 'Disabler', 'Initiator', 'Durable', 'Escape', 'Pusher'].map(role => (
              <label key={role} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.preferred_roles.includes(role)}
                  onChange={() => handleRoleToggle(role)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{role}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Playstyle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Playstyle
          </label>
          <select
            value={preferences.playstyle}
            onChange={(e) => setPreferences(prev => ({ ...prev, playstyle: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="aggressive">Aggressive</option>
            <option value="defensive">Defensive</option>
            <option value="balanced">Balanced</option>
            <option value="farming">Farming-focused</option>
            <option value="fighting">Fighting-focused</option>
          </select>
        </div>

        {/* Game Mode Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Game Mode Preference
          </label>
          <select
            value={preferences.game_mode_preference}
            onChange={(e) => setPreferences(prev => ({ ...prev, game_mode_preference: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all_pick">All Pick</option>
            <option value="ranked_matchmaking">Ranked Matchmaking</option>
            <option value="single_draft">Single Draft</option>
            <option value="random_draft">Random Draft</option>
            <option value="captain_mode">Captain's Mode</option>
          </select>
        </div>

        {/* Hero Complexity Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Complexity Preference
          </label>
          <select
            value={preferences.hero_complexity_preference}
            onChange={(e) => setPreferences(prev => ({ ...prev, hero_complexity_preference: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="simple">Simple heroes</option>
            <option value="moderate">Moderate complexity</option>
            <option value="complex">Complex heroes</option>
            <option value="any">Any complexity</option>
          </select>
        </div>

        {/* Boolean Preferences */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-700">Preferences</h3>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.meta_focus}
              onChange={(e) => setPreferences(prev => ({ ...prev, meta_focus: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Focus on meta heroes</span>
              <p className="text-xs text-gray-500">Prioritize currently strong heroes in recommendations</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.experimental_builds}
              onChange={(e) => setPreferences(prev => ({ ...prev, experimental_builds: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Show experimental builds</span>
              <p className="text-xs text-gray-500">Include unconventional item builds and strategies</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.show_beginner_tips}
              onChange={(e) => setPreferences(prev => ({ ...prev, show_beginner_tips: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Show beginner tips</span>
              <p className="text-xs text-gray-500">Display helpful tips and explanations</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.auto_save_builds}
              onChange={(e) => setPreferences(prev => ({ ...prev, auto_save_builds: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Auto-save custom builds</span>
              <p className="text-xs text-gray-500">Automatically save your item builds</p>
            </div>
          </label>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-700">Notifications</h3>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.notification_preferences.patch_updates}
              onChange={(e) => handleNotificationChange('patch_updates', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Patch updates</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.notification_preferences.meta_changes}
              onChange={(e) => handleNotificationChange('meta_changes', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Meta changes</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.notification_preferences.favorite_hero_updates}
              onChange={(e) => handleNotificationChange('favorite_hero_updates', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Favorite hero updates</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end space-x-3">
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center space-x-2"
        >
          {saving && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
        </button>
      </div>
    </div>
  );
};

export default UserPreferences;