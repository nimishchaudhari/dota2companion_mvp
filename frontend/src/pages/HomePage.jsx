// frontend/src/pages/HomePage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaUsers, FaChartLine } from 'react-icons/fa';
import { FaShieldAlt as FaShield } from 'react-icons/fa';
import PlayerSearch from '../components/PlayerSearch';
import { useAuth } from '../contexts/AuthContext';

// Create motion components
const MotionDiv = motion.div;

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const features = [
        {
            icon: FaSearch,
            title: "Player Analytics",
            description: "Deep dive into player statistics and match history",
            color: "text-teal-400",
            gradient: "from-teal-500 to-teal-700"
        },
        {
            icon: FaShield,
            title: "Hero Mastery",
            description: "Track your hero performance and get recommendations",
            color: "text-purple-400",
            gradient: "from-purple-500 to-purple-700"
        },
        {
            icon: FaChartLine,
            title: "Match Analysis",
            description: "Detailed breakdown of your recent matches",
            color: "text-blue-400",
            gradient: "from-blue-500 to-blue-700"
        }
    ];

    const handlePlayerSearchResult = (players) => {
        if (players && players.length === 1) {
            navigate(`/player/${players[0].steamId}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
                {/* Hero Section */}
                <MotionDiv
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        Welcome to{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
                            Dota 2 Companion
                        </span>
                    </h1>
                    <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                        Your ultimate tool for Dota 2 analysis, hero recommendations, and match insights.
                        Elevate your game with data-driven strategies.
                    </p>

                    {/* Search Section */}
                    <div className="max-w-md mx-auto mb-12">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            🔍 Search for any player
                        </h3>
                        <PlayerSearch onResult={handlePlayerSearchResult} />
                    </div>

                    {/* CTA Buttons - Now Public Access */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => navigate('/heroes')}
                            className="px-8 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                            🛡️ Explore Heroes
                        </button>
                        <button
                            onClick={() => navigate('/draft')}
                            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                            ⚔️ Draft Assistant
                        </button>
                        {user ? (
                            <button
                                onClick={() => navigate('/recommendations')}
                                className="px-8 py-3 border-2 border-teal-400 text-teal-400 font-semibold rounded-lg hover:bg-teal-400 hover:text-slate-900 transition-all duration-200"
                            >
                                📈 Get Recommendations
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="px-8 py-3 border-2 border-teal-400 text-teal-400 font-semibold rounded-lg hover:bg-teal-400 hover:text-slate-900 transition-all duration-200"
                            >
                                🔐 Login for More
                            </button>
                        )}
                    </div>
                </MotionDiv>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {features.map((feature, index) => (
                        <MotionDiv
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className={`bg-gradient-to-br ${feature.gradient} p-6 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300`}
                        >
                            <div className="text-white mb-4">
                                <feature.icon size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-slate-100">
                                {feature.description}
                            </p>
                        </MotionDiv>
                    ))}
                </div>

                {/* Stats Section */}
                <MotionDiv
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="bg-slate-800 rounded-xl p-8 shadow-xl border border-slate-700"
                >
                    <h2 className="text-3xl font-bold text-white text-center mb-8">
                        Why Choose Dota 2 Companion?
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-teal-400 mb-2">100%</div>
                            <div className="text-slate-300">Free Forever</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400 mb-2">⚡</div>
                            <div className="text-slate-300">Lightning Fast</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-400 mb-2">📱</div>
                            <div className="text-slate-300">Works Offline</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-400 mb-2">🔒</div>
                            <div className="text-slate-300">Privacy First</div>
                        </div>
                    </div>
                </MotionDiv>

                {/* Live Demo Section */}
                <MotionDiv
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-16"
                >
                    <h2 className="text-3xl font-bold text-white text-center mb-8">
                        🎮 Experience the Power
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Quick Demo Cards */}
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                                <span className="text-2xl mr-2">⚡</span>
                                Try Without Login
                            </h3>
                            <p className="text-slate-300 mb-4">
                                Explore all core features instantly - no signup required!
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-slate-400">
                                    <span className="text-green-400 mr-2">✓</span>
                                    Browse 123+ heroes with detailed stats
                                </div>
                                <div className="flex items-center text-sm text-slate-400">
                                    <span className="text-green-400 mr-2">✓</span>
                                    Real-time player search & analysis
                                </div>
                                <div className="flex items-center text-sm text-slate-400">
                                    <span className="text-green-400 mr-2">✓</span>
                                    Advanced draft assistance
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-teal-900/50 to-blue-900/50 rounded-xl p-6 border border-teal-500/30">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                                <span className="text-2xl mr-2">📊</span>
                                Live Meta Analysis
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-300">Top Win Rate Hero</span>
                                    <span className="text-green-400 font-bold">Techies (58%)</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-300">Most Picked</span>
                                    <span className="text-blue-400 font-bold">Invoker (18%)</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-300">Most Banned</span>
                                    <span className="text-red-400 font-bold">Techies (45%)</span>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-600">
                                    <div className="text-xs text-slate-400">
                                        Data updated daily from OpenDota & DotaBuff
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="text-center mt-8">
                        <p className="text-slate-300 mb-6 text-lg">
                            🚀 Ready to dominate your games? Start exploring now!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/heroes')}
                                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                            >
                                🔥 Explore Heroes Now
                            </button>
                            <button
                                onClick={() => navigate('/draft')}
                                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-indigo-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                            >
                                ⚔️ Try Draft Assistant
                            </button>
                        </div>
                    </div>
                </MotionDiv>
            </div>
        </div>
    );
};

export default HomePage;