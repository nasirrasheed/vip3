import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Filter } from 'lucide-react';
import { supabase, Testimonial } from '../lib/supabase';

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All');

  const serviceTypes = ['All', 'Chauffeur Service', 'Airport Transfers', 'Wedding Transport', 'Corporate Transport', 'Security Services', 'Event Transport'];
  const ratings = ['All', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('is_active', true)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTestimonials(data || []);
        setFilteredTestimonials(data || []);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    let filtered = testimonials;

    if (selectedService !== 'All') {
      filtered = filtered.filter(testimonial => testimonial.service_type === selectedService);
    }

    if (selectedRating !== 'All') {
      const ratingValue = parseInt(selectedRating.charAt(0));
      filtered = filtered.filter(testimonial => testimonial.rating === ratingValue);
    }

    setFilteredTestimonials(filtered);
  }, [testimonials, selectedService, selectedRating]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            Client Testimonials
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Read what our valued clients say about their experiences with our professional transport and security services.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-50 rounded-lg p-6 mb-12"
        >
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filter Reviews</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-400 focus:border-yellow-400"
              >
                {serviceTypes.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-yellow-400 focus:border-yellow-400"
              >
                {ratings.map(rating => (
                  <option key={rating} value={rating}>{rating}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Results Summary */}
        <div className="mb-8">
          <p className="text-gray-600">
            Showing {filteredTestimonials.length} of {testimonials.length} reviews
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTestimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonial.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-gray-700 mb-4 leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              {/* Client Info */}
              <div className="border-t border-gray-200 pt-4">
                <p className="font-medium text-gray-900 mb-1">
                  {testimonial.client_initial}
                </p>
                {testimonial.service_type && (
                  <p className="text-sm text-gray-500 mb-2">
                    {testimonial.service_type}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  {new Date(testimonial.created_at).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredTestimonials.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No testimonials found matching your filters.
            </p>
          </div>
        )}

        {/* Contact CTA */}
        <section className="mt-16 text-center bg-black text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 rounded-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Experience Our Service
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join our satisfied clients and experience professional transport services that exceed expectations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/contact'}
                className="bg-yellow-400 text-black px-8 py-4 rounded-md font-medium hover:bg-yellow-500 transition-colors duration-200"
              >
                Book Our Service
              </button>
              <button
                onClick={() => window.location.href = '/reviews'}
                className="border border-yellow-400 text-yellow-400 px-8 py-4 rounded-md font-medium hover:bg-yellow-400 hover:text-black transition-colors duration-200"
              >
                Leave a Review
              </button>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default TestimonialsPage;