// frontend/src/pages/MatchDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';

// Simple game mode mapping (can be expanded)
const gameModeMap = {
    0: 'Unknown', 1: 'All Pick', 2: 'Captains Mode', 3: 'Random Draft', 4: 'Single Draft', 
    5: 'All Random', 22: 'Ranked All Pick', 23: 'Turbo' 
};

const MatchDetailPage = () => {
    const { matchId } = useParams();
    const [matchData, setMatchData] = useState(null);
    const [heroesData, setHeroesData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMatchAndHeroes = async () => {
            setLoading(true);
            setError(null);
            try {
                if (Object.keys(heroesData).length === 0) {
                    const heroes = await api.getHeroes();
                    const heroesMap = heroes.reduce((map, hero) => {
                        map[hero.id] = hero;
                        return map;
                    }, {});
                    setHeroesData(heroesMap);
                }
                const matchData = await api.getMatchDetails(matchId);
                setMatchData(matchData);
            } catch (err) {
                console.error("Failed to fetch match or hero details", err);
                setError(err.message || 'Failed to load data.');
            } finally {
                setLoading(false);
            }
        };
        fetchMatchAndHeroes();
    }, [matchId]); // heroesData removed from deps to avoid loop if it's set inside

    const getHeroInfo = (heroId) => {
        return heroesData[heroId] || { localized_name: `Hero ID: ${heroId}`, icon: '', img: '' };
    };

    if (loading) return <div className="text-center p-10">Loading match details...</div>;
    if (error) return <div className="text-center p-10 text-red-500 font-semibold">Error: {error}</div>;
    if (!matchData) return <div className="text-center p-10 text-gray-600">No match data found for Match ID: {matchId}.</div>;

    const { radiant_win, duration, radiant_score, dire_score, players, start_time, game_mode } = matchData;

    const radiantPlayers = players.filter(p => p.player_slot < 128);
    const direPlayers = players.filter(p => p.player_slot >= 128);
    
    const renderPlayerRow = (player, teamColor) => {
        const heroInfo = getHeroInfo(player.hero_id);
        return (
            <tr key={player.player_slot} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-700">
                    {player.account_id && player.account_id !== 0 ? 
                        <Link to={`/player/${player.account_id}`} className={`font-medium text-blue-600 hover:text-blue-800 hover:underline`}>
                            {player.personaname || `Player ${player.player_slot}`}
                        </Link> : 
                        <span className="text-gray-500">{player.personaname || `Anonymous`}</span>
                    }
                </td>
                <td className="py-3 px-4 text-sm text-gray-700 flex items-center">
                    {heroInfo.icon && <img src={heroInfo.icon} alt={heroInfo.localized_name} className="w-8 h-auto mr-2 rounded-sm"/>}
                    {heroInfo.localized_name}
                </td>
                <td className={`py-3 px-4 text-sm text-center font-medium ${teamColor === 'green' ? 'text-green-600' : 'text-red-600'}`}>
                    {player.kills}/{player.deaths}/{player.assists}
                </td>
            </tr>
        );
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Match Details: <span className="text-blue-600">{matchId}</span></h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-md shadow-inner">
                <div><strong className="block text-sm text-gray-500">Date:</strong> <span className="text-gray-700">{new Date(start_time * 1000).toLocaleDateString()}</span></div>
                <div><strong className="block text-sm text-gray-500">Winner:</strong> <span className={`font-bold ${radiant_win ? 'text-green-500' : 'text-red-500'}`}>{radiant_win ? 'Radiant' : 'Dire'}</span></div>
                <div><strong className="block text-sm text-gray-500">Score:</strong> <span className="text-green-500">{radiant_score}</span> - <span className="text-red-500">{dire_score}</span></div>
                <div><strong className="block text-sm text-gray-500">Duration:</strong> <span className="text-gray-700">{Math.floor(duration / 60)}m {duration % 60}s</span></div>
                <div><strong className="block text-sm text-gray-500">Game Mode:</strong> <span className="text-gray-700">{gameModeMap[game_mode] || `Mode ID: ${game_mode}`}</span></div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Radiant Team */}
                <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-green-600 mb-3">Radiant Victory: {radiant_score}</h2>
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-green-50">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Player</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Hero</th>
                                    <th className="py-3 px-4 text-center text-xs font-medium text-green-700 uppercase tracking-wider">K/D/A</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {radiantPlayers.map(p => renderPlayerRow(p, 'green'))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Dire Team */}
                <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-red-600 mb-3">Dire Defeat: {dire_score}</h2>
                     <div className="overflow-x-auto bg-white rounded-lg shadow">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-red-50">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Player</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Hero</th>
                                    <th className="py-3 px-4 text-center text-xs font-medium text-red-700 uppercase tracking-wider">K/D/A</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {direPlayers.map(p => renderPlayerRow(p, 'red'))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default MatchDetailPage;
