import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import FixedCallButton from '../UI/FixedCallButton';
import WhatsAppButton from '../UI/WhatsAppButton';
import ScrollToTopButton from '../UI/ScrollToTopButton';
import AIBookingAssistant from '../UI/AIBookingAssistant';

const Layout = () => {
  return (
    <div className="min-h-screen bg-white">
      <FixedCallButton />
      <Header />
      <main className="pt-32">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTopButton />
      <AIBookingAssistant />
    </div>
  );
};

export default Layout;