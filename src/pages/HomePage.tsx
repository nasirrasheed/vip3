import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Shield, Users, Globe, Award } from 'lucide-react';
import Hero from '../components/UI/Hero';
import ServiceCard from '../components/UI/ServiceCard';
import TestimonialSlider from '../components/UI/TestimonialSlider';
import CompanyLogos from '../components/UI/CompanyLogos';
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
      title: 'SIA Close Protection',
      description: 'SIA registered Close Protection and Security Protocols available',
      iconUrl: 'https://i.pinimg.com/1200x/86/8e/d2/868ed2b33dd489ffb8f313c60b0de43e.jpg' // SIA badge/security professional
    },
     {
        icon: Clock,
       title: '24/7 Availability',
       description: '24/7 Availability* Free No-obligation Quotation and subject to additional charges',
       iconUrl: 'https://i.pinimg.com/736x/b1/73/01/b1730120124ec0d53fd4a0a63de494a3.jpg' // Professional clock/time concept
     },
    {
       icon: Users,
      title: 'Professional Chauffeurs',
      description: 'Fully licensed, uniformed chauffeurs with extensive training and local knowledge',
      iconUrl: 'https://i.pinimg.com/1200x/1a/6f/73/1a6f73d363992d25ca4497d5f7b3a3ac.jpg' // Professional chauffeurs
    },
    {
       icon: CheckCircle,
      title: 'Reliability & Punctuality',
      description: 'Guaranteed on-time service with real-time journey monitoring',
      iconUrl: 'https://i.pinimg.com/736x/23/c2/5d/23c25d1e316ae02a82a387ff6ab3b1aa.jpg' // Chauffeur checking watch
    },
    {
       icon: Award,
      title: 'Comprehensive Insurance',
      description: 'Fully insured luxury vehicles maintained to the highest standards',
      iconUrl: 'https://i.pinimg.com/1200x/39/4b/94/394b947b0bd90650930fad4d2cf098c6.jpg' // Insurance/protection concept
    },
    {
      icon: Globe,
      title: 'Free No-obligation Quotation',
      description: 'Professional consultation and quotation service for all requirements',
      iconUrl: 'https://i.pinimg.com/736x/21/5d/90/215d9047e983ffe664d285158f748b47.jpg' // Customer service/consultation
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
        title="Premier Luxury Transport & Chauffeur Service"
        subtitle="VIP transport pride themselves as being the regions Premier luxury transport and chauffeur service. A service to Leading Hotels, Corporate Executives and Private Clients who expect excellence."
        backgroundImage="https://videos.openai.com/vg-assets/assets%2Ftask_01k0545ngkezabj5rz2q5fwbk6%2F1752518924_img_0.webp?st=2025-07-14T17%3A27%3A19Z&se=2025-07-20T18%3A27%3A19Z&sks=b&skt=2025-07-14T17%3A27%3A19Z&ske=2025-07-20T18%3A27%3A19Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=3mUD10WafGqSHn%2Bac01rkbRMbV0ALfrvs42H8WPVI18%3D&az=oaivgprodscus"
        ctaText="Explore Services"
        onCtaClick={() => navigate('/services')}
      />

      {/* Services Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive luxury transportation solutions tailored individually to your needs
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
              Serving the needs of VIP and Elite Clients
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our commitment to luxury, punctuality, professionalism and SIA registered Close Protection makes us the preferred choice for VIP transportation for all important and high profile events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUsItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-md">
                  <img
                    src={item.iconUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <item.icon className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Logos */}
      <CompanyLogos />

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
