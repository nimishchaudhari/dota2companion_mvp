// frontend/src/components/layout/MainLayout.jsx
import { memo } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import OfflineNotice from '../OfflineNotice';
import UpdateNotification from '../UpdateNotification';

const MainLayout = memo(() => {
    return (
        <div className="flex flex-col min-h-screen bg-slate-900 text-white">
            <UpdateNotification />
            <Header />
            <OfflineNotice />
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 w-full">
                <Outlet /> {/* Child routes will render here */}
            </main>
            <Footer />
        </div>
    );
});

MainLayout.displayName = 'MainLayout';
export default MainLayout;
