// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; // Ensure axios is installed

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'; // From .env file

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_URL}/auth/me`, { withCredentials: true }) // Important for cookies
            .then(response => {
                if (response.data.success) {
                    setUser(response.data.user);
                }
            })
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = async (username) => { // No password for POC test login
        try {
            const response = await axios.post(`${API_URL}/auth/test/login`, { username }, { withCredentials: true });
            if (response.data.success) {
                setUser(response.data.user);
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
            await axios.post(`${API_URL}/auth/test/logout`, {}, { withCredentials: true });
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
