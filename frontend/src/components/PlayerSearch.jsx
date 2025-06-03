import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { enhancedApi } from '../services/enhancedApiWithSync.js';

const MotionDiv = motion.div;

const PlayerSearch = ({ onResult }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResults(null);
    if (!query.trim()) {
      setError('Please enter a Steam ID, Dota 2 ID, or persona name.');
      return;
    }
    setLoading(true);
    try {
      const data = await enhancedApi.searchPlayers(query);
      if (data.error) {
        setError(data.error);
      } else if (data.players && data.players.length === 0) {
        setError('No players found.');
      } else {
        setResults(data.players);
        if (onResult) onResult(data.players);
        
        // Show demo indicator if using demo data
        if (data.isDemo && data.message) {
          console.log(data.message);
        }
      }
    } catch (error) {
      setError('Search failed. Showing demo players.');
      // Set demo players as fallback
      setResults([
        {
          steamId: "76561197960287930",
          personaName: "Arteezy (Demo)",
          avatar: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/df/df778904318914107338066888cf9389f6972978_full.jpg"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlayer = (player) => {
    navigate(`/player/${player.steamId}`);
    setResults(null);
    setQuery('');
  };

  return (
    <MotionDiv 
      className="w-full max-w-md mx-auto relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSearch} className="flex flex-col space-y-4 mb-4">
        <div className="flex w-full space-x-3">
          <MotionDiv 
            className="flex-1"
            whileFocus={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <input
              type="text"
              placeholder="Search by Steam ID, Dota 2 ID, or persona name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-600 text-white placeholder-slate-400 rounded-lg text-lg transition-all duration-300 ease-in-out focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none hover:border-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            />
          </MotionDiv>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <button
              type="submit"
              className="px-6 py-3 min-w-[120px] bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Searching...</span>
                </div>
              ) : (
                'Search'
              )}
            </button>
          </motion.div>
        </div>
      </form>
      
      <AnimatePresence>
        {error && (
          <MotionDiv
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-red-900/80 border border-red-500 text-white rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-400">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {results && results.length > 1 && (
          <MotionDiv
            className="absolute z-20 w-full mt-1 max-h-80 overflow-y-auto bg-slate-900/95 backdrop-blur-sm border-2 border-slate-600/80 rounded-lg shadow-2xl"
            style={{
              backdropFilter: 'blur(8px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(148, 163, 184, 0.1)'
            }}
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 bg-gradient-to-b from-slate-800/50 to-slate-900/50 rounded-lg">
              <div className="font-semibold text-white mb-3 flex items-center space-x-2">
                <span className="text-teal-400">👥</span>
                <span>Multiple players found. Please select:</span>
              </div>
              <div className="space-y-2">
                {results.map((player, index) => (
                  <MotionDiv
                    key={player.steamId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ transition: `opacity 0.3s ease ${index * 0.1}s, transform 0.3s ease ${index * 0.1}s` }}
                  >
                    <button
                      className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-600/50 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:border-teal-400/60 hover:shadow-lg focus:bg-slate-700/80 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all duration-200 text-left group"
                      onClick={() => handleSelectPlayer(player)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={player.avatar || '/placeholder-hero.svg'}
                            alt={player.personaName}
                            className="w-12 h-12 rounded-full border-2 border-slate-500 group-hover:border-teal-400 transition-colors duration-200"
                          />
                          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate group-hover:text-teal-100 transition-colors duration-200 flex items-center">
                            {player.personaName}
                            {player.isDemo && (
                              <span className="ml-2 px-2 py-1 text-xs bg-orange-500/20 text-orange-300 rounded-full">
                                DEMO
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-400 truncate group-hover:text-slate-300 transition-colors duration-200">
                            Steam ID: {player.steamId}
                          </div>
                        </div>
                        <div className="text-slate-500 group-hover:text-teal-400 transition-colors duration-200">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  </MotionDiv>
                ))}
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {results && results.length === 1 && (
          <MotionDiv
            className="absolute z-20 w-full mt-1 bg-slate-900/95 backdrop-blur-sm border-2 border-slate-600/80 rounded-lg shadow-2xl"
            style={{
              backdropFilter: 'blur(8px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(148, 163, 184, 0.1)'
            }}
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 bg-gradient-to-b from-slate-800/50 to-slate-900/50 rounded-lg">
              <div className="font-semibold text-white mb-3 flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>Player found:</span>
              </div>
              <MotionDiv
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-600/50 hover:bg-gradient-to-r hover:from-slate-700/80 hover:to-slate-600/80 hover:border-teal-400/60 hover:shadow-lg focus:bg-slate-700/80 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all duration-200 text-left group"
                  onClick={() => handleSelectPlayer(results[0])}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={results[0].avatar || '/placeholder-hero.svg'}
                        alt={results[0].personaName}
                        className="w-12 h-12 rounded-full border-2 border-slate-500 group-hover:border-teal-400 transition-colors duration-200"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate group-hover:text-teal-100 transition-colors duration-200 flex items-center">
                        {results[0].personaName}
                        {results[0].isDemo && (
                          <span className="ml-2 px-2 py-1 text-xs bg-orange-500/20 text-orange-300 rounded-full">
                            DEMO
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-400 truncate group-hover:text-slate-300 transition-colors duration-200">
                        Steam ID: {results[0].steamId}
                      </div>
                    </div>
                    <div className="text-slate-500 group-hover:text-teal-400 transition-colors duration-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              </MotionDiv>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
      
      {/* Loading skeleton overlay */}
      <AnimatePresence>
        {loading && (
          <MotionDiv
            className="absolute top-[60px] left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-2 border-slate-600/80 rounded-lg p-4 shadow-2xl"
            style={{
              backdropFilter: 'blur(8px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(148, 163, 184, 0.1)'
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 rounded-lg p-2">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-white text-sm font-medium">Searching players...</span>
              </div>
              <div className="space-y-3">
                <div className="flex w-full space-x-3">
                  <div className="w-12 h-12 bg-slate-700/50 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-700/50 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-slate-700/50 rounded animate-pulse w-3/4"></div>
                  </div>
                </div>
                <div className="flex w-full space-x-3">
                  <div className="w-12 h-12 bg-slate-700/50 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-700/50 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-slate-700/50 rounded animate-pulse w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
};

export default PlayerSearch;