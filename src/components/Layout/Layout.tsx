import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import FixedCallButton from '../UI/FixedCallButton';
import TopBanner from '../UI/TopBanner';
import WhatsAppButton from '../UI/WhatsAppButton';
import ScrollToTopButton from '../UI/ScrollToTopButton';

const Layout = () => {
  return (
    <div className="min-h-screen bg-white">
      <FixedCallButton />
      <TopBanner />
      <Header />
      <main className="pt-32">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTopButton />
    </div>
  );
};

export default Layout;