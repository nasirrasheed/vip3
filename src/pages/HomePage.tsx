import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Shield, Users, Globe, Award } from 'lucide-react';
import Hero from '../components/UI/Hero';
import ServiceCard from '../components/UI/ServiceCard';
import TestimonialSlider from '../components/UI/TestimonialSlider';
import { supabase, Service, Testimonial } from '../lib/supabase';

const HomePage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesResponse, testimonialsResponse] = await Promise.all([
          supabase
            .from('services')
            .select('*')
            .eq('is_active', true)
            .order('order_index'),
          supabase
            .from('testimonials')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
        ]);

        if (servicesResponse.data) setServices(servicesResponse.data);
        if (testimonialsResponse.data) setTestimonials(testimonialsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const whyChooseUsItems = [
    {
      icon: Shield,
      title: 'Professional Chauffeurs',
      description: 'Fully licensed, uniformed chauffeurs with extensive training and local knowledge'
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Round-the-clock availability for all your transport requirements'
    },
    {
      icon: Users,
      title: 'Tailored Service',
      description: 'Bespoke transport solutions designed around your specific needs'
    },
    {
      icon: CheckCircle,
      title: 'Reliability & Punctuality',
      description: 'Guaranteed on-time service with real-time journey monitoring'
    },
    {
      icon: Award,
      title: 'Premium Fleet',
      description: 'Luxury vehicles maintained to the highest standards'
    },
    {
      icon: Globe,
      title: 'UK Wide Coverage',
      description: 'Comprehensive coverage across London and the entire UK'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <Hero
        title="VIP Transport and Security Services"
        subtitle="Professional chauffeur-driven transport and security solutions across the UK"
        backgroundImage="https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg"
        ctaText="Explore Services"
        onCtaClick={() => navigate('/services')}
      />

      {/* Services Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              Professional Transport & Security Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive chauffeur and security solutions for discerning clients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                title={service.title}
                description={service.short_description}
                icon={service.icon || 'Car'}
                slug={service.slug}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              Why Choose VIP Transport and Security
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Uncompromising standards in professional transport and security services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUsItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialSlider testimonials={testimonials} />

      {/* Contact CTA */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Speak With Our Team Today
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Ready to experience premium transport services? Contact us for a personalized quote.
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="bg-yellow-400 text-black px-8 py-4 rounded-md font-medium hover:bg-yellow-500 transition-colors duration-200"
            >
              Enquire Now
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;