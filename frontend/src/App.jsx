// frontend/src/App.jsx
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import MainLayout from './components/layout/MainLayout';
import LoadingSkeleton from './components/LoadingSkeleton';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for better code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const HeroesListPage = lazy(() => import('./pages/HeroesListPage'));
const PlayerProfilePage = lazy(() => import('./pages/PlayerProfilePage'));
const MatchDetailPage = lazy(() => import('./pages/MatchDetailPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage'));

// Enhanced loading component
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-gray-600">Loading...</span>
    </div>
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
                        <Route path="heroes" element={
                            <ProtectedRoute>
                                <Suspense fallback={<LoadingSkeleton />}>
                                    <HeroesListPage />
                                </Suspense>
                            </ProtectedRoute>
                        } />
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
                        <Route path="player/:playerId" element={
                            <ProtectedRoute>
                                <Suspense fallback={<LoadingSkeleton />}>
                                    <PlayerProfilePage />
                                </Suspense>
                            </ProtectedRoute>
                        } />
                        <Route path="matches/:matchId" element={
                            <ProtectedRoute>
                                <Suspense fallback={<LoadingSkeleton />}>
                                    <MatchDetailPage />
                                </Suspense>
                            </ProtectedRoute>
                        } />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </Router>
        </ErrorBoundary>
    );
}

export default App;