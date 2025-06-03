// frontend/src/components/layout/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import PlayerSearch from '../PlayerSearch';

const MotionDiv = motion.div;

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handlePlayerSearchResult = (players) => {
        if (players && players.length === 1) {
            navigate(`/player/${players[0].steamId}`);
        }
    };

    const navItems = [
        { label: 'Home', path: '/' },
        { label: 'Heroes', path: '/heroes' },
        { label: 'Draft', path: '/draft' },
        { label: 'Recommendations', path: '/recommendations' },
    ];

    return (
        <MotionDiv
            className="bg-dota-bg-primary border-b border-dota-bg-tertiary sticky top-0 z-50 backdrop-blur-md"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                {/* Logo/Brand */}
                <MotionDiv
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Link to="/">
                        <span
                            className="text-xl font-bold text-dota-teal-400"
                            style={{ textShadow: "0 0 10px rgba(39, 174, 158, 0.5)" }}
                        >
                            Dota 2 Companion
                        </span>
                    </Link>
                </MotionDiv>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-6">
                    {navItems.map((item, index) => (
                        <motion.div
                            key={item.path}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                        >
                            <Link
                                to={item.path}
                                className="text-dota-text-secondary hover:text-dota-teal-400 hover:-translate-y-0.5 transition-all duration-200 ease-in-out"
                                style={{ 
                                    textShadow: "0 0 8px rgba(39, 174, 158, 0.6)"
                                }}
                            >
                                {item.label}
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Right side - Search and User */}
                <div className="hidden md:flex items-center space-x-4">
                    <div className="max-w-[300px]">
                        <PlayerSearch onResult={handlePlayerSearchResult} />
                    </div>
                    
                    {user ? (
                        <div className="flex items-center space-x-3">
                            {user.avatarUrl && (
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.personaName}
                                        className="w-8 h-8 rounded-full border-2 border-dota-teal-500"
                                        style={{ boxShadow: "0 0 10px rgba(39, 174, 158, 0.3)" }}
                                    />
                                </motion.div>
                            )}
                            <span 
                                className="text-dota-text-primary text-sm font-medium max-w-[120px] truncate"
                            >
                                {user.personaName}
                            </span>
                            <button
                                onClick={logout}
                                className="text-red-400 hover:bg-red-500 hover:text-white hover:-translate-y-0.5 transition-all duration-200 ease-in-out px-3 py-1.5 text-sm rounded-md"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="bg-dota-teal-500 text-white hover:bg-dota-teal-600 hover:-translate-y-0.5 hover:shadow-dota-glow transition-all duration-200 ease-in-out px-4 py-2 text-sm rounded-md font-medium"
                        >
                            Login
                        </Link>
                    )}
                </div>

                {/* Mobile menu button */}
                <button
                    className="flex md:hidden text-dota-text-primary hover:bg-dota-bg-hover hover:text-dota-teal-400 p-2 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle navigation menu"
                >
                    {isMenuOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
                </button>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <MotionDiv
                    className="bg-dota-bg-secondary px-4 py-4 border-t border-dota-bg-tertiary"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <div className="flex flex-col space-y-4">
                        {/* Mobile Search */}
                        <div>
                            <PlayerSearch onResult={handlePlayerSearchResult} />
                        </div>

                        {/* Mobile Nav Items */}
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="text-dota-text-secondary hover:text-dota-teal-400 hover:bg-dota-bg-hover py-2 px-2 rounded-md transition-colors text-left"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}

                        {/* Mobile User Section */}
                        {user ? (
                            <div className="flex flex-col space-y-3 pt-4 border-t border-dota-bg-tertiary">
                                <div className="flex items-center space-x-3">
                                    {user.avatarUrl && (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.personaName}
                                            className="w-8 h-8 rounded-full border-2 border-dota-teal-500"
                                        />
                                    )}
                                    <span className="text-dota-text-primary text-sm font-medium">
                                        {user.personaName}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="text-red-400 hover:bg-red-500 hover:text-white py-2 px-2 rounded-md transition-colors text-left w-full"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-dota-teal-500 text-white hover:bg-dota-teal-600 py-2 px-4 rounded-md transition-colors text-center font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </MotionDiv>
            )}
        </MotionDiv>
    );
};

export default Header;