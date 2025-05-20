// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
// import { useNavigate } from 'react-router-dom'; // If using react-router

const LoginPage = () => {
    const [username, setUsername] = useState('testuser'); // Default to testuser
    const { login } = useAuth();
    // const navigate = useNavigate(); // Uncomment if you want to redirect after login

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(username);
        if (success) {
            // navigate('/'); // Example: redirect to home page
            alert('Login successful! You can now navigate to other pages.');
        } else {
            alert('Login failed. Please use "testuser" for this POC.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]"> {/* Adjust 160px based on header/footer height */}
            <div className="max-w-md w-full mx-auto mt-4 p-8 bg-white rounded-lg shadow-xl">
                <h1 className="text-2xl font-bold text-center text-gray-700 mb-6">Test Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-1">
                            Username (use "testuser")
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="testuser"
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-sm"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};
export default LoginPage;
