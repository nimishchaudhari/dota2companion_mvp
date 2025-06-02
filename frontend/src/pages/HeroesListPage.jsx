// frontend/src/pages/HeroesListPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { fileBackend } from '../services/fileBackend.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import FavoritesButton from '../components/FavoritesButton.jsx';
import RecommendationCard from '../components/RecommendationCard.jsx';

const HeroesListPage = () => {
    const { user } = useAuth();
    const [heroes, setHeroes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterName, setFilterName] = useState('');
    const [filterAttr, setFilterAttr] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [selectedHero, setSelectedHero] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [favoriteHeroes, setFavoriteHeroes] = useState([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load heroes from API
            const heroesData = await api.getHeroes();
            setHeroes(heroesData);

            // Load user favorites if logged in
            if (user) {
                try {
                    const favorites = await fileBackend.getFavoriteHeroes();
                    setFavoriteHeroes(favorites);

                    // Load beginner-friendly recommendations
                    const recs = await fileBackend.getBeginnerFriendlyHeroes();
                    setRecommendations(recs.slice(0, 6)); // Show top 6 recommendations
                } catch (backendError) {
                    console.warn('Failed to load user data:', backendError);
                    // Continue without user-specific data
                }
            }
        } catch (err) {
            console.error("Failed to fetch heroes", err);
            setError(err.message || 'Failed to load hero data.');
        } finally {
            setLoading(false);
        }
    };

    const handleFavoriteToggle = () => {
        // Refresh favorites after any change
        if (user) {
            fileBackend.getFavoriteHeroes()
                .then(setFavoriteHeroes)
                .catch(console.error);
        }
    };

    const filteredHeroes = heroes.filter(hero => {
        const matchesName = hero.localized_name.toLowerCase().includes(filterName.toLowerCase());
        const matchesAttr = filterAttr === '' || hero.primary_attr === filterAttr;
        const matchesRole = filterRole === '' || (hero.roles && hero.roles.includes(filterRole));
        
        if (showFavoritesOnly) {
            const isFavorite = favoriteHeroes.some(fav => fav.hero_id === hero.id);
            return matchesName && matchesAttr && matchesRole && isFavorite;
        }
        
        return matchesName && matchesAttr && matchesRole;
    });

    const uniqueRoles = [...new Set(heroes.flatMap(hero => hero.roles || []))].sort();

    if (loading) return <div className="text-center p-10">Loading heroes...</div>;
    if (error) return <div className="text-center p-10 text-red-500 font-semibold">Error: {error}</div>;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-700 mb-2">Dota 2 Heroes</h1>
                {user && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Favorites: {favoriteHeroes.length}</span>
                        <Link 
                            to="/recommendations" 
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Get Personalized Recommendations →
                        </Link>
                    </div>
                )}
            </div>

            {/* Recommendations Section */}
            {user && recommendations.length > 0 && (
                <div className="bg-blue-50 p-6 rounded-lg mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Recommended for You</h2>
                        <Link 
                            to="/recommendations"
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                            View All Recommendations
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recommendations.map(hero => (
                            <RecommendationCard
                                key={hero.id || hero.hero_id}
                                type="hero"
                                data={hero}
                                size="small"
                                onClick={() => setSelectedHero(hero)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Filter and Controls */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <input 
                            type="text" 
                            placeholder="Filter by name..." 
                            value={filterName} 
                            onChange={e => setFilterName(e.target.value)}
                            className="flex-grow p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                        <select 
                            value={filterAttr} 
                            onChange={e => setFilterAttr(e.target.value)} 
                            className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                        >
                            <option value="">All Attributes</option>
                            <option value="str">Strength</option>
                            <option value="agi">Agility</option>
                            <option value="int">Intelligence</option>
                            <option value="all">Universal</option> 
                        </select>
                        <select 
                            value={filterRole} 
                            onChange={e => setFilterRole(e.target.value)} 
                            className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                        >
                            <option value="">All Roles</option>
                            {uniqueRoles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {user && (
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showFavoritesOnly}
                                    onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Favorites only</span>
                            </label>
                        )}
                        
                        <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'} rounded-l-md transition-colors`}
                                title="Grid view"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'} rounded-r-md transition-colors`}
                                title="List view"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="text-sm text-gray-600">
                    Showing {filteredHeroes.length} of {heroes.length} heroes
                </div>
            </div>

            {/* Modal for Selected Hero */}
            {selectedHero && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full mx-auto">
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">{selectedHero.localized_name}</h2>
                            <div className="flex items-center space-x-2">
                                {user && (
                                    <FavoritesButton
                                        type="hero"
                                        id={selectedHero.id}
                                        name={selectedHero.localized_name}
                                        role={selectedHero.roles?.[0]}
                                    />
                                )}
                                <button onClick={() => setSelectedHero(null)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                            </div>
                        </div>
                        <img 
                            src={selectedHero.img} 
                            alt={selectedHero.localized_name} 
                            className="w-full max-w-xs mx-auto h-auto rounded-md mb-4 shadow"
                        />
                        <div className="space-y-2">
                            <p className="text-gray-700"><strong className="font-medium">Attribute:</strong> {selectedHero.primary_attr?.toUpperCase()}</p>
                            <p className="text-gray-700"><strong className="font-medium">Attack Type:</strong> {selectedHero.attack_type}</p>
                            <p className="text-gray-700"><strong className="font-medium">Roles:</strong> {selectedHero.roles?.join(', ')}</p>
                            {selectedHero.reason && (
                                <p className="text-blue-600 italic text-sm">{selectedHero.reason}</p>
                            )}
                        </div>
                        <div className="mt-6 flex space-x-3">
                            <button 
                                onClick={() => setSelectedHero(null)} 
                                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                            >
                                Close
                            </button>
                            <Link
                                to={`/recommendations?hero=${selectedHero.id}`}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-center"
                                onClick={() => setSelectedHero(null)}
                            >
                                View Counters
                            </Link>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Heroes Grid/List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredHeroes.map(hero => {
                            const isFavorite = favoriteHeroes.some(fav => fav.hero_id === hero.id);
                            return (
                                <div 
                                    key={hero.id} 
                                    className="relative border border-gray-200 bg-gray-50 p-3 rounded-lg text-center cursor-pointer shadow-sm hover:shadow-lg hover:scale-105 transform transition-all duration-200 ease-in-out"
                                    onClick={() => setSelectedHero(hero)}
                                >
                                    {user && (
                                        <div className="absolute top-1 right-1" onClick={(e) => e.stopPropagation()}>
                                            <FavoritesButton
                                                type="hero"
                                                id={hero.id}
                                                name={hero.localized_name}
                                                role={hero.roles?.[0]}
                                                className="!p-1"
                                            />
                                        </div>
                                    )}
                                    <img 
                                        src={hero.icon} 
                                        alt={hero.localized_name} 
                                        className="w-full h-auto max-w-[80px] mx-auto mb-2 rounded"
                                    />
                                    <p className="text-sm font-medium text-gray-700">{hero.localized_name}</p>
                                    {hero.primary_attr && (
                                        <div className={`inline-block mt-1 w-4 h-4 rounded-full text-xs font-bold text-white flex items-center justify-center
                                            ${hero.primary_attr === 'str' ? 'bg-red-500' : 
                                              hero.primary_attr === 'agi' ? 'bg-green-500' : 
                                              hero.primary_attr === 'int' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                                            {hero.primary_attr === 'str' ? 'S' : 
                                             hero.primary_attr === 'agi' ? 'A' : 
                                             hero.primary_attr === 'int' ? 'I' : 'U'}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredHeroes.map(hero => {
                            const isFavorite = favoriteHeroes.some(fav => fav.hero_id === hero.id);
                            return (
                                <div 
                                    key={hero.id} 
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200"
                                    onClick={() => setSelectedHero(hero)}
                                >
                                    <div className="flex items-center space-x-4">
                                        <img 
                                            src={hero.icon} 
                                            alt={hero.localized_name} 
                                            className="w-12 h-12 rounded"
                                        />
                                        <div>
                                            <h3 className="font-medium text-gray-800">{hero.localized_name}</h3>
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                <span className={`px-2 py-1 rounded text-xs font-medium text-white
                                                    ${hero.primary_attr === 'str' ? 'bg-red-500' : 
                                                      hero.primary_attr === 'agi' ? 'bg-green-500' : 
                                                      hero.primary_attr === 'int' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                                                    {hero.primary_attr?.toUpperCase() || 'UNI'}
                                                </span>
                                                <span>{hero.roles?.slice(0, 2).join(', ')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {user && (
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <FavoritesButton
                                                type="hero"
                                                id={hero.id}
                                                name={hero.localized_name}
                                                role={hero.roles?.[0]}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                
                {filteredHeroes.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 mb-4">
                            {showFavoritesOnly 
                                ? 'No favorite heroes match your filters.' 
                                : 'No heroes match your filters.'
                            }
                        </p>
                        {showFavoritesOnly && (
                            <button
                                onClick={() => setShowFavoritesOnly(false)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Show all heroes
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default HeroesListPage;
