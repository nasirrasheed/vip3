import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout/Layout';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ServicesManager from './pages/admin/ServicesManager';
import BlogManager from './pages/admin/BlogManager';
import GalleryManager from './pages/admin/GalleryManager';
import CompanyLogosManager from './pages/admin/CompanyLogosManager';
import InquiriesManager from './pages/admin/InquiriesManager';
import TestimonialsManager from './pages/admin/TestimonialsManager';
import AIBookingsManager from './pages/admin/AIBookingsManager';
import ChatConversations from './pages/admin/ChatConversations';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ExperiencePage from './pages/ExperiencePage';

import GalleryPage from './pages/GalleryPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import ContactPage from './pages/ContactPage';
import ReviewSubmissionPage from './pages/ReviewSubmissionPage';
import TestimonialsPage from './pages/TestimonialsPage';
import CloseProtectionPage from './pages/CloseProtectionPage';
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="experience" element={<ExperiencePage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogPostPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/:slug" element={<ServiceDetailPage />} />
          <Route path="close-protection" element={<CloseProtectionPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="reviews" element={<ReviewSubmissionPage />} />
          <Route path="testimonials" element={<TestimonialsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
         
        </Route>

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="services" element={<ServicesManager />} />
          <Route path="blog" element={<BlogManager />} />
          <Route path="gallery" element={<GalleryManager />} />
          <Route path="company-logos" element={<CompanyLogosManager />} />
          <Route path="inquiries" element={<InquiriesManager />} />
          <Route path="testimonials" element={<TestimonialsManager />} />
          <Route path="ai-bookings" element={<AIBookingsManager />} />
          <Route path="conversations" element={<ChatConversations />} />
          
          <Route index element={<Navigate to="/admin/dashboard" />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
