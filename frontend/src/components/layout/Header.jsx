// frontend/src/components/layout/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fileBackend } from '../../services/fileBackend.js';
import PlayerSearch from '../PlayerSearch';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [favoriteCount, setFavoriteCount] = useState(0);
    const menuRef = useRef(null);

    // Handle navigation to player profile from search result
    const handlePlayerSearchResult = (players) => {
        if (!players || players.length === 0) return;
        if (players.length === 1) {
            navigate(`/player/${players[0].steamId}`);
        }
        // If multiple, let PlayerSearch show the list for disambiguation
    };

    // Load favorite count for badge
    useEffect(() => {
        const loadFavoriteCount = async () => {
            if (user) {
                try {
                    const [heroes, items] = await Promise.all([
                        fileBackend.getFavoriteHeroes(),
                        fileBackend.getFavoriteItems()
                    ]);
                    setFavoriteCount(heroes.length + items.length);
                } catch (error) {
                    console.warn('Failed to load favorite count:', error);
                }
            }
        };

        loadFavoriteCount();
    }, [user]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        setShowUserMenu(false);
        logout();
    };

    return (
        <header className="bg-gray-800 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold hover:text-gray-300">Dota2 Companion</Link>
                
                <nav className="hidden md:flex space-x-6">
                    <Link to="/" className="hover:text-gray-300 transition-colors">Home</Link>
                    <Link to="/heroes" className="hover:text-gray-300 transition-colors">Heroes</Link>
                    {user && (
                        <>
                            <Link to="/recommendations" className="hover:text-gray-300 transition-colors">
                                Recommendations
                            </Link>
                            <Link to="/profile" className="hover:text-gray-300 transition-colors relative">
                                My Profile
                                {favoriteCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {favoriteCount > 9 ? '9+' : favoriteCount}
                                    </span>
                                )}
                            </Link>
                        </>
                    )}
                </nav>

                <div className="flex items-center gap-4">
                    <PlayerSearch onResult={handlePlayerSearchResult} />
                    
                    {user ? (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-2 hover:bg-gray-700 rounded-md p-2 transition-colors"
                            >
                                {user.avatarUrl && (
                                    <img 
                                        src={user.avatarUrl} 
                                        alt={user.personaName} 
                                        className="w-8 h-8 rounded-full border-2 border-gray-600" 
                                    />
                                )}
                                <span className="font-medium hidden sm:block">{user.personaName}</span>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>My Profile</span>
                                            {favoriteCount > 0 && (
                                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                    {favoriteCount}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                    <Link
                                        to="/recommendations"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        Get Recommendations
                                    </Link>
                                    <Link
                                        to="/heroes"
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        Browse Heroes
                                    </Link>
                                    <div className="border-t border-gray-100"></div>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
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

            {/* Mobile Navigation */}
            {user && (
                <nav className="md:hidden mt-4 pt-4 border-t border-gray-700">
                    <div className="flex flex-wrap gap-4">
                        <Link to="/heroes" className="text-sm hover:text-gray-300 transition-colors">Heroes</Link>
                        <Link to="/recommendations" className="text-sm hover:text-gray-300 transition-colors">Recommendations</Link>
                        <Link to="/profile" className="text-sm hover:text-gray-300 transition-colors relative">
                            Profile
                            {favoriteCount > 0 && (
                                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                    {favoriteCount > 9 ? '9+' : favoriteCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </nav>
            )}
        </header>
    );
};
export default Header;
