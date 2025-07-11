import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import TopBanner from '../UI/TopBanner';
import WhatsAppButton from '../UI/WhatsAppButton';
import ScrollToTopButton from '../UI/ScrollToTopButton';

const Layout = () => {
  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      <main className="pt-20">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTopButton />
    </div>
  );
};

export default Layout;