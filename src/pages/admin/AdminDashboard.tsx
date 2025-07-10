import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Car, 
  FileText, 
  MessageSquare, 
  Calendar,
  TrendingUp,
  Mail,
  Star
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalServices: 0,
    totalBlogPosts: 0,
    totalTestimonials: 0,
    totalInquiries: 0,
    recentInquiries: 0,
    publishedPosts: 0,
    activeServices: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          servicesResponse,
          blogPostsResponse,
          testimonialsResponse,
          inquiriesResponse,
          recentInquiriesResponse,
          publishedPostsResponse,
          activeServicesResponse,
        ] = await Promise.all([
          supabase.from('services').select('*', { count: 'exact' }),
          supabase.from('blog_posts').select('*', { count: 'exact' }),
          supabase.from('testimonials').select('*', { count: 'exact' }),
          supabase.from('inquiries').select('*', { count: 'exact' }),
          supabase.from('inquiries').select('*', { count: 'exact' }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('blog_posts').select('*', { count: 'exact' }).eq('is_published', true),
          supabase.from('services').select('*', { count: 'exact' }).eq('is_active', true),
        ]);

        // Calculate average rating
        const { data: testimonials } = await supabase.from('testimonials').select('rating');
        const avgRating = testimonials && testimonials.length > 0 
          ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length 
          : 0;

        setStats({
          totalServices: servicesResponse.count || 0,
          totalBlogPosts: blogPostsResponse.count || 0,
          totalTestimonials: testimonialsResponse.count || 0,
          totalInquiries: inquiriesResponse.count || 0,
          recentInquiries: recentInquiriesResponse.count || 0,
          publishedPosts: publishedPostsResponse.count || 0,
          activeServices: activeServicesResponse.count || 0,
          avgRating: Math.round(avgRating * 10) / 10,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Services',
      value: stats.totalServices,
      subtitle: `${stats.activeServices} active`,
      icon: Car,
      color: 'bg-blue-500',
    },
    {
      title: 'Blog Posts',
      value: stats.totalBlogPosts,
      subtitle: `${stats.publishedPosts} published`,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      title: 'Testimonials',
      value: stats.totalTestimonials,
      subtitle: `${stats.avgRating}/5 avg rating`,
      icon: Star,
      color: 'bg-yellow-500',
    },
    {
      title: 'Inquiries',
      value: stats.totalInquiries,
      subtitle: `${stats.recentInquiries} this week`,
      icon: Mail,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back, Administrator
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500">{card.subtitle}</p>
              </div>
              <div className={`p-3 rounded-full ${card.color}`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
            <Car className="h-6 w-6 text-yellow-400 mb-2" />
            <h3 className="font-medium text-gray-900">Add Service</h3>
            <p className="text-sm text-gray-600">Create new transport service</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
            <FileText className="h-6 w-6 text-yellow-400 mb-2" />
            <h3 className="font-medium text-gray-900">Write Post</h3>
            <p className="text-sm text-gray-600">Create new blog article</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
            <MessageSquare className="h-6 w-6 text-yellow-400 mb-2" />
            <h3 className="font-medium text-gray-900">Add Testimonial</h3>
            <p className="text-sm text-gray-600">Add client feedback</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left">
            <Mail className="h-6 w-6 text-yellow-400 mb-2" />
            <h3 className="font-medium text-gray-900">View Inquiries</h3>
            <p className="text-sm text-gray-600">Check new messages</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">New inquiry received from potential client</span>
            <span className="text-gray-400">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Blog post "Professional Chauffeurs" published</span>
            <span className="text-gray-400">1 day ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600">New testimonial added to website</span>
            <span className="text-gray-400">2 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;