// frontend/src/pages/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerSearch from '../components/PlayerSearch';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-gray-700 mb-2">Player Search</h1>
            <p className="text-gray-600 mb-6">
                Search for a Dota 2 player by Steam ID, Dota 2 ID, or persona name.
            </p>
            <PlayerSearch onResult={(players) => {
                if (players && players.length === 1) {
                    navigate(`/player/${players[0].steamId}`);
                }
            }} />
        </div>
    );
};

export default HomePage;
