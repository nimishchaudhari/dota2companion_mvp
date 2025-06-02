// frontend/src/components/layout/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PlayerSearch from '../PlayerSearch';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Handle navigation to player profile from search result
    const handlePlayerSearchResult = (players) => {
        if (!players || players.length === 0) return;
        if (players.length === 1) {
            navigate(`/player/${players[0].steamId}`);
        }
        // If multiple, let PlayerSearch show the list for disambiguation
    };

    return (
        <header className="bg-gray-800 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold hover:text-gray-300">Dota2 Companion POC</Link>
                <nav className="space-x-4">
                    <Link to="/" className="hover:text-gray-300">Home</Link>
                    <Link to="/heroes" className="hover:text-gray-300">Heroes</Link>
                    {/* Future: <Link to="/profile" className="hover:text-gray-300">My Profile</Link> */}
                </nav>
                <div className="flex items-center gap-4">
                    <PlayerSearch onResult={handlePlayerSearchResult} />
                    {user ? (
                        <>
                            {user.avatarUrl && (
                                <img 
                                    src={user.avatarUrl} 
                                    alt={user.personaName} 
                                    className="w-8 h-8 rounded-full mr-3 border-2 border-gray-600" 
                                />
                            )}
                            <span className="mr-3 font-medium">{user.personaName}</span>
                            <button 
                                onClick={logout} 
                                className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition duration-150 ease-in-out"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link 
                            to="/login" 
                            className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-150 ease-in-out"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};
export default Header;
