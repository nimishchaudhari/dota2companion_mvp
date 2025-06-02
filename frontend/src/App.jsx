// frontend/src/App.jsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { useAuth } from './contexts/AuthContext';
import { pageTransitions, getReducedMotionVariant } from './utils/animations-lite';

import MainLayout from './components/layout/MainLayout'; // Assuming MainLayout is used
import LoadingSkeleton from './components/LoadingSkeleton';

// Lazy load pages for better code splitting
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const HeroesListPage = React.lazy(() => import('./pages/HeroesListPage'));
const PlayerProfilePage = React.lazy(() => import('./pages/PlayerProfilePage'));
const MatchDetailPage = React.lazy(() => import('./pages/MatchDetailPage'));
const UserProfilePage = React.lazy(() => import('./pages/UserProfilePage'));
const RecommendationsPage = React.lazy(() => import('./pages/RecommendationsPage'));

// Enhanced loading component with animation
const LoadingSpinner = () => (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen"
    >
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"
        />
        <span className="ml-3 text-gray-600">Loading...</span>
    </motion.div>
);

// Simple ProtectedRoute component with animation support
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// Animated page wrapper component
const AnimatedPage = ({ children }) => {
    const location = useLocation();
    
    return (
        <motion.div
            key={location.pathname}
            {...getReducedMotionVariant(pageTransitions.slideIn)}
            className="w-full"
        >
            {children}
        </motion.div>
    );
};

// Routes component with animation support
const AnimatedRoutes = () => {
    const location = useLocation();
    
    return (
        <AnimatePresence mode="wait" initial={false}>
            <Suspense fallback={<LoadingSkeleton />}>
                <Routes location={location} key={location.pathname}>
                <Route element={<MainLayout />}> {/* Wraps all pages with Header/Footer */}
                    <Route path="/" element={
                        <AnimatedPage>
                            <HomePage />
                        </AnimatedPage>
                    } />
                    <Route path="/login" element={
                        <AnimatedPage>
                            <LoginPage />
                        </AnimatedPage>
                    } />
                    <Route path="/heroes" element={
                        <ProtectedRoute>
                            <AnimatedPage>
                                <HeroesListPage />
                            </AnimatedPage>
                        </ProtectedRoute>
                    } />
                    <Route path="/recommendations" element={
                        <ProtectedRoute>
                            <AnimatedPage>
                                <RecommendationsPage />
                            </AnimatedPage>
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <AnimatedPage>
                                <UserProfilePage />
                            </AnimatedPage>
                        </ProtectedRoute>
                    } />
                    <Route path="/player/:playerId" element={
                        <ProtectedRoute>
                            <AnimatedPage>
                                <PlayerProfilePage />
                            </AnimatedPage>
                        </ProtectedRoute>
                    } />
                    <Route path="/matches/:matchId" element={
                        <ProtectedRoute>
                            <AnimatedPage>
                                <MatchDetailPage />
                            </AnimatedPage>
                        </ProtectedRoute>
                    } />
                    {/* Add more routes as needed */}
                    <Route path="*" element={<Navigate to="/" replace />} /> {/* Basic catch-all */}
                </Route>
            </Routes>
            </Suspense>
        </AnimatePresence>
    );
};

function App() {
    const { loading: authLoading } = useAuth();

    if (authLoading) {
        return <LoadingSpinner />;
    }

    return (
        <Router basename={import.meta.env.PROD ? '/dota2companion_mvp' : '/'}>
            <AnimatedRoutes />
        </Router>
    );
}
export default App;
