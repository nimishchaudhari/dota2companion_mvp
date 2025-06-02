// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import MainLayout from './components/layout/MainLayout'; // Assuming MainLayout is used
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import HeroesListPage from './pages/HeroesListPage';
import PlayerProfilePage from './pages/PlayerProfilePage';
import MatchDetailPage from './pages/MatchDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import RecommendationsPage from './pages/RecommendationsPage';

// Simple ProtectedRoute component for POC
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth(); // Also check loading state

    if (loading) {
        return <div>Checking authentication...</div>; // Or a spinner
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    const { loading: authLoading } = useAuth(); // Renamed to avoid conflict if App had its own loading

    if (authLoading) {
        return <div>Loading application...</div>;
    }

    return (
        <Router>
            <Routes>
                <Route element={<MainLayout />}> {/* Wraps all pages with Header/Footer */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/heroes" element={
                        <ProtectedRoute>
                            <HeroesListPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/recommendations" element={
                        <ProtectedRoute>
                            <RecommendationsPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <UserProfilePage />
                        </ProtectedRoute>
                    } />
                    <Route path="/player/:playerId" element={
                        <ProtectedRoute>
                            <PlayerProfilePage />
                        </ProtectedRoute>
                    } />
                     <Route path="/matches/:matchId" element={
                        <ProtectedRoute>
                            <MatchDetailPage />
                        </ProtectedRoute>
                    } />
                    {/* Add more routes as needed */}
                    <Route path="*" element={<Navigate to="/" replace />} /> {/* Basic catch-all */}
                </Route>
            </Routes>
        </Router>
    );
}
export default App;
