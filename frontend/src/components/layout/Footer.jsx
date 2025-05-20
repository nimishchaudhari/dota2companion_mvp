// frontend/src/components/layout/Footer.jsx
import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-700 text-white p-4 text-center mt-auto">
            <p>&copy; {new Date().getFullYear()} Dota 2 Companion POC</p>
        </footer>
    );
};
export default Footer;
