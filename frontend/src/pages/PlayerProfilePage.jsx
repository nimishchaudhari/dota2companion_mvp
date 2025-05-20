// frontend/src/pages/PlayerProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const PlayerProfilePage = () => {
    const { playerId } = useParams(); 
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Simple hero data store for this page, ideally this comes from a context or is fetched more globally
    const [heroesData, setHeroesData] = useState({}); 

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch heroes data if not already available - simplified for POC
                if (Object.keys(heroesData).length === 0) {
                    const heroesRes = await axios.get(`${API_URL}/api/heroes`, { withCredentials: true });
                    const heroesMap = heroesRes.data.reduce((map, hero) => {
                        map[hero.id] = hero;
                        return map;
                    }, {});
                    setHeroesData(heroesMap);
                }

                const response = await axios.get(`${API_URL}/api/player/${playerId}/summary`, { withCredentials: true });
                setPlayerData(response.data);
            } catch (err) {
                console.error("Failed to fetch player summary", err);
                setError(err.response?.data?.message || 'Failed to load player data.');
                setPlayerData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [playerId]); // heroesData dependency removed to avoid re-fetching profile if only heroesData changes internally

    const getHeroInfo = (heroId) => {
        return heroesData[heroId] || { localized_name: `Hero ID: ${heroId}`, icon: '' };
    };

    if (loading && !playerData) return <div className="text-center p-10">Loading player profile...</div>; // Show loading only if no data yet
    if (error) return <div className="text-center p-10 text-red-500 font-semibold">Error: {error}</div>;
    if (!playerData && !loading) return <div className="text-center p-10 text-gray-600">No player data found for Account ID: {playerId}. It might be a private profile or an invalid ID.</div>;

    const { profile, mmr_estimate, winLoss, recentMatches } = playerData || {}; // Destructure safely

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            {profile ? (
                <div className="flex flex-col sm:flex-row items-center mb-6 pb-6 border-b border-gray-200">
                    <img 
                        src={profile.avatarfull} 
                        alt={profile.personaname} 
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mr-0 sm:mr-6 mb-4 sm:mb-0 border-4 border-gray-200 shadow-md" 
                    />
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">{profile.personaname}</h1>
                        <p className="text-gray-600">Account ID: {profile.account_id}</p>
                        {profile.steamid && <p className="text-sm text-gray-500">Steam ID: {profile.steamid}</p>}
                        {mmr_estimate?.estimate && <p className="text-xl text-blue-600 font-semibold mt-1">MMR Estimate: {mmr_estimate.estimate}</p>}
                    </div>
                </div>
            ) : <p className="text-gray-500 text-center sm:text-left">Core profile data not available.</p>}
            
            {winLoss && (
                <div className="mb-6 text-center sm:text-left">
                    <p className="text-xl font-semibold text-gray-700">
                        Wins: <span className="text-green-500">{winLoss.win}</span> / Losses: <span className="text-red-500">{winLoss.lose}</span>
                    </p>
                </div>
            )}

            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Recent Matches (Last 10)</h2>
            {recentMatches && recentMatches.length > 0 ? (
                <ul className="space-y-4">
                    {recentMatches.map(match => {
                        const heroInfo = getHeroInfo(match.hero_id);
                        const playerWon = (match.radiant_win && match.player_slot < 128) || (!match.radiant_win && match.player_slot >= 128);
                        return (
                            <li key={match.match_id} className={`p-4 rounded-lg shadow-md border ${playerWon ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <div className="flex items-center mb-2 sm:mb-0">
                                        {heroInfo.icon && <img src={heroInfo.icon} alt={heroInfo.localized_name} className="w-10 h-6 mr-3 rounded-sm"/>}
                                        <div>
                                            <Link to={`/matches/${match.match_id}`} className="text-blue-600 hover:underline font-semibold">Match ID: {match.match_id}</Link>
                                            <p className={`text-sm font-bold ${playerWon ? 'text-green-700' : 'text-red-700'}`}>
                                                {playerWon ? 'Win' : 'Loss'} - {heroInfo.localized_name}
                                            </p>
                                        </div>
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
    );
};
export default PlayerProfilePage;
