// frontend/src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import MainLayout from './components/layout/MainLayout';
import LoadingSkeleton from './components/LoadingSkeleton';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for optimal code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const HeroesListPage = lazy(() => import('./pages/HeroesListPage'));
const PlayerProfilePage = lazy(() => import('./pages/PlayerProfilePage'));
const MatchDetailPage = lazy(() => import('./pages/MatchDetailPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage'));
const DraftPage = lazy(() => import('./pages/DraftPage'));
const OfflinePage = lazy(() => import('./pages/OfflinePage'));

// Enhanced loading component
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <span className="text-slate-300 text-lg">Loading Dota 2 Companion...</span>
        </div>
    </div>
);

// Enhanced ProtectedRoute component
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

function App() {
    const { loading: authLoading } = useAuth();

    if (authLoading) {
        return <LoadingSpinner />;
    }

    return (
        <ErrorBoundary>
            <Router basename={import.meta.env.PROD ? '/dota2companion_mvp' : '/'}>
                <Routes>
                    <Route path="/" element={<MainLayout />}>
                        {/* Public Routes */}
                        <Route index element={
                            <Suspense fallback={<LoadingSkeleton />}>
                                <HomePage />
                            </Suspense>
                        } />
                        <Route path="login" element={
                            <Suspense fallback={<LoadingSkeleton />}>
                                <LoginPage />
                            </Suspense>
                        } />
                        <Route path="offline" element={
                            <Suspense fallback={<LoadingSkeleton />}>
                                <OfflinePage />
                            </Suspense>
                        } />

                        {/* Public Routes - No Auth Required */}
                        <Route path="heroes" element={
                            <Suspense fallback={<LoadingSkeleton />}>
                                <HeroesListPage />
                            </Suspense>
                        } />
                        <Route path="draft" element={
                            <Suspense fallback={<LoadingSkeleton />}>
                                <DraftPage />
                            </Suspense>
                        } />
                        <Route path="player/:playerId" element={
                            <Suspense fallback={<LoadingSkeleton />}>
                                <PlayerProfilePage />
                            </Suspense>
                        } />
                        <Route path="matches/:matchId" element={
                            <Suspense fallback={<LoadingSkeleton />}>
                                <MatchDetailPage />
                            </Suspense>
                        } />

                        {/* Protected Routes - Auth Required */}
                        <Route path="recommendations" element={
                            <ProtectedRoute>
                                <Suspense fallback={<LoadingSkeleton />}>
                                    <RecommendationsPage />
                                </Suspense>
                            </ProtectedRoute>
                        } />
                        <Route path="profile" element={
                            <ProtectedRoute>
                                <Suspense fallback={<LoadingSkeleton />}>
                                    <UserProfilePage />
                                </Suspense>
                            </ProtectedRoute>
                        } />
                        
                        {/* Catch all - redirect to home */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </Router>
        </ErrorBoundary>
    );
}

export default App;