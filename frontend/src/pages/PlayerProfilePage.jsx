// frontend/src/pages/PlayerProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
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
    const [userProfile, setUserProfile] = useState(null);
    const [showAnalysisTab, setShowAnalysisTab] = useState(false); 

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch heroes data if not already available - simplified for POC
                if (Object.keys(heroesData).length === 0) {
                    const heroes = await api.getHeroes();
                    const heroesMap = heroes.reduce((map, hero) => {
                        map[hero.id] = hero;
                        return map;
                    }, {});
                    setHeroesData(heroesMap);
                }

                const playerData = await api.getPlayerSummary(playerId);
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
    }, [playerId, user]); // heroesData dependency removed to avoid re-fetching profile if only heroesData changes internally

    const getHeroInfo = (heroId) => {
        return heroesData[heroId] || { localized_name: `Hero ID: ${heroId}`, icon: '' };
    };

    if (loading && !playerData) return <div className="text-center p-10">Loading player profile...</div>; // Show loading only if no data yet
    if (error) return <div className="text-center p-10 text-red-500 font-semibold">Error: {error}</div>;
    if (!playerData && !loading) return <div className="text-center p-10 text-gray-600">No player data found for Account ID: {playerId}. It might be a private profile or an invalid ID.</div>;

    const { profile, mmr_estimate, winLoss, recentMatches } = playerData || {}; // Destructure safely

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6">
                {profile ? (
                    <div className="flex flex-col sm:flex-row items-center mb-6 pb-6 border-b border-gray-200">
                        <img 
                            src={profile.avatarfull} 
                            alt={profile.personaname} 
                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mr-0 sm:mr-6 mb-4 sm:mb-0 border-4 border-gray-200 shadow-md" 
                        />
                        <div className="text-center sm:text-left flex-1">
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">{profile.personaname}</h1>
                            <p className="text-gray-600">Account ID: {profile.account_id}</p>
                            {profile.steamid && <p className="text-sm text-gray-500">Steam ID: {profile.steamid}</p>}
                            {mmr_estimate?.estimate && <p className="text-xl text-blue-600 font-semibold mt-1">MMR Estimate: {mmr_estimate.estimate}</p>}
                        </div>
                        {user && (
                            <div className="flex flex-col space-y-2">
                                <Link
                                    to="/profile"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm text-center"
                                >
                                    My Profile
                                </Link>
                                <Link
                                    to="/recommendations"
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm text-center"
                                >
                                    Get Recommendations
                                </Link>
                            </div>
                        )}
                    </div>
                ) : <p className="text-gray-500 text-center sm:text-left">Core profile data not available.</p>}
                
                {winLoss && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="text-center sm:text-left">
                            <p className="text-xl font-semibold text-gray-700">
                                Wins: <span className="text-green-500">{winLoss.win}</span>
                            </p>
                        </div>
                        <div className="text-center sm:text-left">
                            <p className="text-xl font-semibold text-gray-700">
                                Losses: <span className="text-red-500">{winLoss.lose}</span>
                            </p>
                        </div>
                        <div className="text-center sm:text-left">
                            <p className="text-xl font-semibold text-gray-700">
                                Win Rate: <span className={winLoss.win / (winLoss.win + winLoss.lose) >= 0.5 ? 'text-green-500' : 'text-red-500'}>
                                    {((winLoss.win / (winLoss.win + winLoss.lose)) * 100).toFixed(1)}%
                                </span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => setShowAnalysisTab(false)}
                        className={`px-4 py-2 rounded-t-lg transition-colors ${
                            !showAnalysisTab ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Recent Matches
                    </button>
                    {user && heroRecommendations.length > 0 && (
                        <button
                            onClick={() => setShowAnalysisTab(true)}
                            className={`px-4 py-2 rounded-t-lg transition-colors ${
                                showAnalysisTab ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Recommendations ({heroRecommendations.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Tab Content */}
            {!showAnalysisTab ? (
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Recent Matches (Last 5)</h2>
                    {recentMatches && recentMatches.length > 0 ? (
                        <ul className="space-y-4">
                            {recentMatches.map(match => {
                                const heroInfo = getHeroInfo(match.hero_id);
                                const playerWon = (match.radiant_win && match.player_slot < 128) || (!match.radiant_win && match.player_slot >= 128);
                                return (
                                    <li key={match.match_id} className={`p-4 rounded-lg shadow-md border ${playerWon ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                            <div className="flex items-center mb-2 sm:mb-0 flex-1">
                                                {heroInfo.icon && <img src={heroInfo.icon} alt={heroInfo.localized_name} className="w-10 h-6 mr-3 rounded-sm"/>}
                                                <div className="flex-1">
                                                    <Link to={`/matches/${match.match_id}`} className="text-blue-600 hover:underline font-semibold">Match ID: {match.match_id}</Link>
                                                    <p className={`text-sm font-bold ${playerWon ? 'text-green-700' : 'text-red-700'}`}>
                                                        {playerWon ? 'Win' : 'Loss'} - {heroInfo.localized_name}
                                                    </p>
                                                </div>
                                                {user && (
                                                    <FavoritesButton
                                                        type="hero"
                                                        id={match.hero_id}
                                                        name={heroInfo.localized_name}
                                                        role={heroInfo.roles?.[0]}
                                                        className="mr-3"
                                                    />
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600 text-left sm:text-right">
                                                <p>KDA: {match.kills}/{match.deaths}/{match.assists}</p>
                                                <p>Duration: {Math.floor(match.duration / 60)}m {match.duration % 60}s</p>
                                                <p>Date: {new Date(match.start_time * 1000).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : <p className="text-gray-600">No recent matches found or data is not public.</p>}
                </div>
            ) : (
                // Recommendations Tab
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Recommended Heroes for You</h2>
                    <p className="text-gray-600 mb-6">
                        Based on your profile preferences and excluding recently played heroes.
                    </p>
                    
                    {heroRecommendations.length > 0 ? (
                        <div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
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
                                                // Optional: Navigate to hero detail or show more info
                                                console.log('Hero selected:', cardData);
                                            }}
                                        />
                                    );
                                })}
                            </div>
                            
                            <div className="text-center">
                                <Link
                                    to="/recommendations"
                                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    View All Recommendations
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-600 mb-4">No recommendations available.</p>
                            <Link
                                to="/profile"
                                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Set Up Your Profile
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
export default PlayerProfilePage;
