// frontend/src/pages/PlayerProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaUser, FaTrophy, FaGamepad, FaStar } from 'react-icons/fa';
import { enhancedApi } from '../services/enhancedApiWithSync.js';
import { fileBackend } from '../services/fileBackend.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import FavoritesButton from '../components/FavoritesButton.jsx';
import RecommendationCard from '../components/RecommendationCard.jsx';

const PlayerProfilePage = () => {
    const { playerId } = useParams(); 
    const { user } = useAuth();
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Simple hero data store for this page, ideally this comes from a context or is fetched more globally
    const [heroesData, setHeroesData] = useState({});
    const [heroRecommendations, setHeroRecommendations] = useState([]);
    const [_userProfile, setUserProfile] = useState(null);
    const [showAnalysisTab, setShowAnalysisTab] = useState(false); 

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch heroes data if not already available - simplified for POC
                if (Object.keys(heroesData).length === 0) {
                    const heroes = await enhancedApi.getHeroes();
                    const heroesMap = heroes.reduce((map, hero) => {
                        map[hero.id] = hero;
                        return map;
                    }, {});
                    setHeroesData(heroesMap);
                }

                const playerData = await enhancedApi.getPlayerSummary(playerId);
                setPlayerData(playerData);

                // Load user profile and recommendations if logged in
                if (user) {
                    try {
                        const profile = await fileBackend.getCurrentUserProfile();
                        setUserProfile(profile);

                        // Get hero recommendations based on player's most played heroes
                        if (playerData?.recentMatches?.length > 0) {
                            const playedHeroes = [...new Set(playerData.recentMatches.map(m => m.hero_id))];
                            const recommendations = await fileBackend.getHeroRecommendations({
                                exclude_heroes: playedHeroes.slice(0, 5) // Exclude recently played
                            });
                            
                            // Get beginner friendly or role-based recommendations
                            const recsList = recommendations.beginner_friendly || 
                                           Object.values(recommendations.role_based || {})[0] || [];
                            setHeroRecommendations(recsList.slice(0, 4));
                        }

                        // Cache this match data if it's the user's own profile
                        if (profile && playerData?.recentMatches?.length > 0) {
                            for (const match of playerData.recentMatches.slice(0, 3)) {
                                await fileBackend.cacheMatchData({
                                    match_id: match.match_id,
                                    hero_id: match.hero_id,
                                    result: (match.radiant_win && match.player_slot < 128) || 
                                           (!match.radiant_win && match.player_slot >= 128) ? 'win' : 'loss',
                                    duration: match.duration,
                                    kda: {
                                        kills: match.kills,
                                        deaths: match.deaths,
                                        assists: match.assists
                                    },
                                    items: [] // Could extract item data if available
                                });
                            }
                        }
                    } catch (backendError) {
                        console.warn('Failed to load user recommendations:', backendError);
                        // Continue without recommendations
                    }
                }
            } catch (err) {
                console.error("Failed to fetch player summary", err);
                setError(err.message || 'Failed to load player data.');
                setPlayerData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [playerId, user, heroesData]);

    const getHeroInfo = (heroId) => {
        return heroesData[heroId] || { localized_name: `Hero ID: ${heroId}`, icon: '' };
    };

    if (loading && !playerData) {
        return (
            <div className="max-w-7xl mx-auto py-8 flex flex-col items-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400">Loading player profile...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-8">
                <div className="bg-slate-800 border border-red-500 rounded-md p-4">
                    <p className="text-white">Error: {error}</p>
                </div>
            </div>
        );
    }
    
    if (!playerData && !loading) {
        return (
            <div className="max-w-7xl mx-auto py-8">
                <div className="bg-slate-800 border border-yellow-500 rounded-md p-4">
                    <p className="text-white">
                        No player data found for Account ID: {playerId}. It might be a private profile or an invalid ID.
                    </p>
                </div>
            </div>
        );
    }

    const { profile, mmr_estimate, winLoss, recentMatches } = playerData || {}; // Destructure safely

    return (
        <div className="max-w-6xl mx-auto py-6">
            <div className="flex flex-col space-y-8">
                {/* Profile Header */}
                <div className="bg-slate-800 border border-slate-700 p-4 sm:p-6 relative overflow-hidden rounded-lg">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-purple-500"></div>
                    {profile ? (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row items-center w-full gap-6">
                                <img
                                    src={profile.avatarfull}
                                    alt={profile.personaname}
                                    className="w-20 h-20 sm:w-32 sm:h-32 rounded-full border-4 border-teal-500 shadow-lg"
                                />
                                
                                <div className="flex-1 flex flex-col items-center sm:items-start space-y-3">
                                    <div className="flex flex-col items-center sm:items-start space-y-2">
                                        <h1 className="text-xl sm:text-3xl font-bold text-white text-center sm:text-left">
                                            {profile.personaname}
                                        </h1>
                                        <div className="flex flex-col items-center sm:items-start space-y-1">
                                            <p className="text-slate-400 text-sm">
                                                Account ID: {profile.account_id}
                                            </p>
                                            {profile.steamid && (
                                                <p className="text-slate-500 text-xs">
                                                    Steam ID: {profile.steamid}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {mmr_estimate?.estimate && (
                                        <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                            MMR: {mmr_estimate.estimate}
                                        </span>
                                    )}
                                </div>
                                
                                {user && (
                                    <div className="flex flex-col space-y-2">
                                        <Link
                                            to="/profile"
                                            className="flex items-center justify-center px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors text-sm"
                                        >
                                            <FaUser className="w-4 h-4 mr-2" />
                                            My Profile
                                        </Link>
                                        <Link
                                            to="/recommendations"
                                            className="flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                                        >
                                            <FaStar className="w-4 h-4 mr-2" />
                                            Get Recommendations
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center">
                            Core profile data not available.
                        </p>
                    )}
                    
                    {/* Win/Loss Statistics */}
                    {winLoss && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
                            <div className="text-center sm:text-left">
                                <div className="space-y-1">
                                    <p className="text-slate-400 text-sm">Wins</p>
                                    <p className="text-green-400 text-2xl font-bold">
                                        {winLoss.win}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="text-center sm:text-left">
                                <div className="space-y-1">
                                    <p className="text-slate-400 text-sm">Losses</p>
                                    <p className="text-red-400 text-2xl font-bold">
                                        {winLoss.lose}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="text-center sm:text-left">
                                <div className="space-y-1">
                                    <p className="text-slate-400 text-sm">Win Rate</p>
                                    <p className={`text-2xl font-bold ${
                                        winLoss.win / (winLoss.win + winLoss.lose) >= 0.5 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {((winLoss.win / (winLoss.win + winLoss.lose)) * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tab Content */}
                <div>
                    <div className="bg-slate-800 border border-slate-700 rounded-md p-2">
                        <div className="flex space-x-1">
                            <button 
                                onClick={() => setShowAnalysisTab(false)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                                    !showAnalysisTab 
                                        ? 'bg-teal-600 text-white' 
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                            >
                                <FaGamepad />
                                <span>Recent Matches</span>
                            </button>
                            {user && heroRecommendations.length > 0 && (
                                <button 
                                    onClick={() => setShowAnalysisTab(true)}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                                        showAnalysisTab 
                                            ? 'bg-teal-600 text-white' 
                                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                    }`}
                                >
                                    <FaStar />
                                    <span>Recommendations ({heroRecommendations.length})</span>
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {!showAnalysisTab && (
                        <div className="bg-slate-800 border border-slate-700 p-6 mt-6 rounded-lg">
                            <div className="flex flex-col space-y-6">
                                <h2 className="text-lg font-semibold text-white">
                                    Recent Matches (Last 5)
                                </h2>
                                    
                                {recentMatches && recentMatches.length > 0 ? (
                                    <div className="flex flex-col space-y-4">
                                        {recentMatches.map(match => {
                                            const heroInfo = getHeroInfo(match.hero_id);
                                            const playerWon = (match.radiant_win && match.player_slot < 128) || (!match.radiant_win && match.player_slot >= 128);
                                            return (
                                                <div
                                                    key={match.match_id}
                                                    className={`p-4 border-2 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                                                        playerWon 
                                                            ? 'bg-green-50 border-green-400' 
                                                            : 'bg-red-50 border-red-400'
                                                    }`}
                                                >
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                        <div className="flex items-center space-x-4 flex-1">
                                                            {heroInfo.icon && (
                                                                <img 
                                                                    src={heroInfo.icon} 
                                                                    alt={heroInfo.localized_name} 
                                                                    className="w-10 h-6 rounded-sm"
                                                                />
                                                            )}
                                                                
                                                            <div className="flex flex-col items-start space-y-1 flex-1">
                                                                <Link
                                                                    to={`/matches/${match.match_id}`}
                                                                    className="text-teal-500 font-semibold text-sm hover:underline"
                                                                >
                                                                    Match ID: {match.match_id}
                                                                </Link>
                                                                    
                                                                <div className="flex items-center space-x-2">
                                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                                        playerWon ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                                                                    }`}>
                                                                        {playerWon ? 'WIN' : 'LOSS'}
                                                                    </span>
                                                                    <span className="text-sm text-slate-900 font-medium">
                                                                        {heroInfo.localized_name}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                                
                                                            {user && (
                                                                <FavoritesButton
                                                                    type="hero"
                                                                    id={match.hero_id}
                                                                    name={heroInfo.localized_name}
                                                                    role={heroInfo.roles?.[0]}
                                                                />
                                                            )}
                                                        </div>
                                                            
                                                        <div className="flex flex-col items-start sm:items-end space-y-1 text-sm text-slate-600">
                                                            <p className="font-medium">
                                                                KDA: {match.kills}/{match.deaths}/{match.assists}
                                                            </p>
                                                            <p>
                                                                Duration: {Math.floor(match.duration / 60)}m {match.duration % 60}s
                                                            </p>
                                                            <p className="text-xs">
                                                                {new Date(match.start_time * 1000).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                );
                                            })}
                                    </div>
                                ) : (
                                    <p className="text-slate-400 text-center py-8">
                                        No recent matches found or data is not public.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                        
                    {showAnalysisTab && (
                        <div className="bg-slate-800 border border-slate-700 p-6 mt-6 rounded-lg">
                            <div className="flex flex-col space-y-6">
                                <div className="flex flex-col space-y-3 items-start">
                                    <h2 className="text-lg font-semibold text-white">
                                        Recommended Heroes for You
                                    </h2>
                                    <p className="text-slate-400 text-sm">
                                        Based on your profile preferences and excluding recently played heroes.
                                    </p>
                                </div>
                                    
                                {heroRecommendations.length > 0 ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                                                {heroRecommendations.map(hero => {
                                                    const heroInfo = getHeroInfo(hero.id || hero.hero_id);
                                                    const cardData = {
                                                        ...heroInfo,
                                                        ...hero,
                                                        reason: hero.reason || `Recommended based on your preferences`
                                                    };
                                                    return (
                                                        <RecommendationCard
                                                            key={hero.id || hero.hero_id}
                                                            type="hero"
                                                            data={cardData}
                                                            onClick={() => {
                                                                // Hero selected
                                                            }}
                                                        />
                                                    );
                                                })}
                                        </div>
                                        
                                        <div className="text-center">
                                            <Link
                                                to="/recommendations"
                                                className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors font-medium"
                                            >
                                                View All Recommendations
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center space-y-4 py-8 text-center">
                                        <p className="text-slate-400">
                                            No recommendations available.
                                        </p>
                                        <Link
                                            to="/profile"
                                            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                                        >
                                            Set Up Your Profile
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlayerProfilePage;
