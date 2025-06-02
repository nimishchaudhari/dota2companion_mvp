// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { mockAuth } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await mockAuth.checkAuth();
                if (response.success) {
                    setUser(response.user);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (username) => { // No password for POC test login
        try {
            const response = await mockAuth.login(username);
            if (response.success) {
                setUser(response.user);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed', error);
            setUser(null); // Ensure user is null on failed login
            return false;
        }
    };

    const logout = async () => {
        try {
            await mockAuth.logout();
            setUser(null);
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
