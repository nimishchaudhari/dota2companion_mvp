// frontend/src/pages/HomePage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const HomePage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        if (/^\d+$/.test(searchTerm.trim())) { 
            navigate(`/player/${searchTerm.trim()}`);
            return;
        }
        
        setSearchLoading(true);
        setSearchError('');
        setSearchResults([]);
        try {
            const response = await axios.get(`${API_URL}/api/search?q=${encodeURIComponent(searchTerm.trim())}`, { withCredentials: true });
            setSearchResults(response.data);
        } catch (err) {
            console.error("Search failed", err);
            setSearchError(err.response?.data?.message || "Search failed. Try an exact player name or a known Account ID.");
        } finally {
            setSearchLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-gray-700 mb-2">Player Search</h1>
            <p className="text-gray-600 mb-6">
                Welcome to the Dota 2 Companion POC! Search for a player by name or enter a Dota 2 Account ID directly.
            </p>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
                <input 
                    type="text" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter Player Name or Account ID"
                    className="flex-grow p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <button 
                    type="submit" 
                    className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-sm"
                >
                    Search
                </button>
            </form>
            
            {searchLoading && <p className="text-blue-500">Searching...</p>}
            {searchError && <p className="text-red-500 font-semibold">{searchError}</p>}
            
            {searchResults && searchResults.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Search Results:</h2>
                    <ul className="space-y-3">
                        {searchResults.map(player => (
                            <li key={player.account_id} className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-md shadow-sm transition border border-gray-200">
                                {player.avatarfull && (
                                    <img 
                                        src={player.avatarfull} 
                                        alt={player.personaname} 
                                        className="w-12 h-12 rounded-full mr-4 border-2 border-gray-300"
                                    />
                                )}
                                <div>
                                    <Link 
                                        to={`/player/${player.account_id}`} 
                                        className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        {player.personaname || `Account ID: ${player.account_id}`}
                                    </Link>
                                    <p className="text-sm text-gray-500">
                                        Last seen: {player.last_match_time ? new Date(player.last_match_time * 1000).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {searchResults && searchResults.length === 0 && !searchLoading && searchTerm && !searchError && (
                <p className="mt-4 text-gray-600">No players found for "{searchTerm}". Try a different name or ensure the Account ID is correct.</p>
            )}
        </div>
    );
};
export default HomePage;
