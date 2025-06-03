// frontend/src/pages/HeroesListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaList, FaFilter, FaStar } from 'react-icons/fa';
import { FaGripVertical as FaGrid3X3 } from 'react-icons/fa';
import { enhancedApi } from '../services/enhancedApiWithSync.js';
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
    }, [loadData]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Load heroes from API (with offline support)
            const heroesData = await enhancedApi.getHeroes();
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
    }, [user]);


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

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-8 flex flex-col items-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent"></div>
                    <div className="text-slate-400">Loading heroes...</div>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-8">
                <div className="bg-slate-800 border border-red-500 rounded-md p-4">
                    <div className="flex items-center">
                        <FaStar className="text-red-500 mr-3" />
                        <div className="text-white">Error: {error}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-6">
            <div className="flex flex-col space-y-8">
                {/* Header Section */}
                <div>
                    <div className="flex flex-col space-y-4 items-start">
                        <h1 className="text-4xl font-bold text-white" style={{textShadow: '0 0 10px rgba(39, 174, 158, 0.3)'}}>
                            Dota 2 Heroes
                        </h1>
                        {user && (
                            <div className="flex flex-wrap items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                    <FaStar className="text-teal-500" />
                                    <span className="text-slate-400 text-sm">
                                        Favorites: {favoriteHeroes.length}
                                    </span>
                                </div>
                                <Link
                                    to="/recommendations"
                                    className="text-teal-500 hover:text-teal-400 text-sm transition-colors"
                                >
                                    Get Personalized Recommendations →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recommendations Section */}
                {user && recommendations.length > 0 && (
                    <div className="bg-slate-800 border border-teal-500 rounded-lg p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-purple-500"></div>
                        <div className="flex flex-col space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-white">
                                    Recommended for You
                                </h2>
                                <Link
                                    to="/recommendations"
                                    className="border border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white px-3 py-1 rounded text-sm transition-colors"
                                >
                                    View All
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
                    </div>
                )}

                {/* Filter and Controls */}
                <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
                    <div className="flex flex-col space-y-6">
                        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                                <input 
                                    placeholder="Filter by name..." 
                                    value={filterName} 
                                    onChange={e => setFilterName(e.target.value)}
                                    className="bg-slate-700 border border-slate-600 text-white placeholder-slate-400 px-3 py-2 rounded focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                                />
                                <select 
                                    value={filterAttr} 
                                    onChange={e => setFilterAttr(e.target.value)}
                                    className="bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none min-w-[180px]"
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
                                    className="bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none min-w-[140px]"
                                >
                                    <option value="">All Roles</option>
                                    {uniqueRoles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="flex justify-between lg:justify-end items-center space-x-4">
                                {user && (
                                    <label className="flex items-center space-x-2 text-slate-400 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={showFavoritesOnly}
                                            onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                                            className="rounded border-slate-600 text-teal-500 focus:ring-teal-500"
                                        />
                                        <span>Favorites only</span>
                                    </label>
                                )}
                                
                                <div className="flex border border-slate-600 rounded-md">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`px-3 py-2 text-sm rounded-l-md transition-colors ${
                                            viewMode === 'grid' 
                                                ? 'bg-teal-500 text-white' 
                                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                        }`}
                                        title="Grid view"
                                    >
                                        <FaGrid3X3 />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`px-3 py-2 text-sm rounded-r-md transition-colors ${
                                            viewMode === 'list' 
                                                ? 'bg-teal-500 text-white' 
                                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                        }`}
                                        title="List view"
                                    >
                                        <FaList />
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-sm text-slate-500">
                            Showing {filteredHeroes.length} of {heroes.length} heroes
                        </div>
                    </div>
                </div>

                {/* Hero Detail Card (replaces modal) */}
                {selectedHero && (
                    <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-purple-500"></div>
                        <div className="flex flex-col space-y-6">
                            <div className="flex justify-between items-center w-full">
                                <h2 className="text-2xl font-bold text-white">
                                    {selectedHero.localized_name}
                                </h2>
                                <div className="flex items-center space-x-2">
                                    {user && (
                                        <FavoritesButton
                                            type="hero"
                                            id={selectedHero.id}
                                            name={selectedHero.localized_name}
                                            role={selectedHero.roles?.[0]}
                                        />
                                    )}
                                    <button
                                        onClick={() => setSelectedHero(null)}
                                        className="text-slate-400 hover:text-white px-2 py-1 text-sm transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 w-full">
                                <div>
                                    <img 
                                        src={selectedHero.img} 
                                        alt={selectedHero.localized_name} 
                                        className="w-full max-w-[200px] rounded-lg shadow-lg"
                                    />
                                </div>
                                
                                <div className="flex flex-col space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-semibold text-slate-400">Attribute:</span>
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                                            selectedHero.primary_attr === 'str' ? 'bg-red-600 text-white' :
                                            selectedHero.primary_attr === 'agi' ? 'bg-green-600 text-white' :
                                            selectedHero.primary_attr === 'int' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                                        }`}>
                                            {selectedHero.primary_attr?.toUpperCase()}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <span className="font-semibold text-slate-400">Attack Type:</span>
                                        <span className="text-white">{selectedHero.attack_type}</span>
                                    </div>
                                    
                                    <div className="flex flex-col space-y-2">
                                        <span className="font-semibold text-slate-400">Roles:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedHero.roles?.map(role => (
                                                <span key={role} className="border border-teal-500 text-teal-500 px-2 py-1 text-xs rounded">
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {selectedHero.reason && (
                                        <div className="p-3 bg-slate-700 rounded-md border-l-4 border-teal-500">
                                            <div className="text-sm text-slate-400 italic">
                                                {selectedHero.reason}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex space-x-3 pt-4">
                                        <button 
                                            onClick={() => setSelectedHero(null)}
                                            className="flex-1 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                                        >
                                            Close
                                        </button>
                                        <Link
                                            to={`/recommendations?hero=${selectedHero.id}`}
                                            onClick={() => setSelectedHero(null)}
                                            className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded text-center transition-colors"
                                        >
                                            View Counters
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            
                {/* Heroes Grid/List */}
                <div className="bg-slate-800 border border-slate-600 rounded-lg p-6">
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {filteredHeroes.map(hero => (
                                <div key={hero.id}>
                                    <div
                                        className="relative bg-slate-700 border border-slate-600 p-3 text-center cursor-pointer transition-all duration-200 ease-in-out rounded-lg hover:-translate-y-1 hover:scale-105 hover:shadow-lg hover:border-teal-500"
                                        onClick={() => setSelectedHero(hero)}
                                    >
                                        {user && (
                                            <div 
                                                className="absolute top-1 right-1 z-10"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <FavoritesButton
                                                    type="hero"
                                                    id={hero.id}
                                                    name={hero.localized_name}
                                                    role={hero.roles?.[0]}
                                                    className="!p-1"
                                                />
                                            </div>
                                        )}
                                        
                                        <div className="flex flex-col space-y-2">
                                            <div className="relative">
                                                <img 
                                                    src={hero.icon} 
                                                    alt={hero.localized_name} 
                                                    className="w-full max-w-[80px] mx-auto rounded-md border-2 border-slate-600"
                                                />
                                            </div>
                                            
                                            <div className="text-xs font-medium text-white leading-tight line-clamp-2">
                                                {hero.localized_name}
                                            </div>
                                            
                                            {hero.primary_attr && (
                                                <span className={`inline-block px-1 py-0.5 text-xs font-medium rounded ${
                                                    hero.primary_attr === 'str' ? 'bg-red-600 text-white' :
                                                    hero.primary_attr === 'agi' ? 'bg-green-600 text-white' :
                                                    hero.primary_attr === 'int' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                                                }`}>
                                                    {hero.primary_attr === 'str' ? 'STR' :
                                                     hero.primary_attr === 'agi' ? 'AGI' :
                                                     hero.primary_attr === 'int' ? 'INT' : 'UNI'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-3">
                            {filteredHeroes.map(hero => (
                                <div
                                    key={hero.id}
                                    className="bg-slate-700 border border-slate-600 p-4 cursor-pointer transition-all duration-200 ease-in-out rounded-lg hover:shadow-md hover:border-teal-500 hover:-translate-y-0.5"
                                    onClick={() => setSelectedHero(hero)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-4 flex-1">
                                            <img 
                                                src={hero.icon} 
                                                alt={hero.localized_name} 
                                                className="w-12 h-12 rounded-md border-2 border-slate-600"
                                            />
                                            
                                            <div className="flex flex-col space-y-1">
                                                <h3 className="text-sm font-semibold text-white">
                                                    {hero.localized_name}
                                                </h3>
                                                <div className="flex items-center space-x-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                                                        hero.primary_attr === 'str' ? 'bg-red-600 text-white' :
                                                        hero.primary_attr === 'agi' ? 'bg-green-600 text-white' :
                                                        hero.primary_attr === 'int' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                                                    }`}>
                                                        {hero.primary_attr?.toUpperCase() || 'UNI'}
                                                    </span>
                                                    <span className="text-sm text-slate-400">
                                                        {hero.roles?.slice(0, 2).join(', ')}
                                                    </span>
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
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {filteredHeroes.length === 0 && !loading && (
                        <div className="flex flex-col items-center space-y-4 py-12 text-center">
                            <div className="text-slate-400 text-lg">
                                {showFavoritesOnly 
                                    ? 'No favorite heroes match your filters.' 
                                    : 'No heroes match your filters.'
                                }
                            </div>
                            {showFavoritesOnly && (
                                <button
                                    onClick={() => setShowFavoritesOnly(false)}
                                    className="border border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white px-3 py-1 rounded text-sm transition-colors"
                                >
                                    Show all heroes
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HeroesListPage;
