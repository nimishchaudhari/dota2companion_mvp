// frontend/src/components/layout/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Header />
            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8"> 
                {/* p-4 for small screens, p-6 for sm, p-8 for lg. Container mx-auto centers content. */}
                <Outlet /> {/* Child routes will render here */}
            </main>
            <Footer />
        </div>
    );
};
export default MainLayout;
