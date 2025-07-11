import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, CheckCircle, Award, Clock, Eye } from 'lucide-react';

const CloseProtectionPage = () => {
  const protectionServices = [
    {
      icon: Shield,
      title: 'SIA Licensed Operatives',
      description: 'All our close protection officers are fully SIA licensed and vetted to the highest standards'
    },
    {
      icon: Users,
      title: 'Personal Protection',
      description: 'Discrete personal protection services for high-profile individuals and VIP clients'
    },
    {
      icon: Eye,
      title: 'Risk Assessment',
      description: 'Comprehensive threat and risk assessment for events, venues, and travel routes'
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: '24/7 close protection services available* Free No-obligation Quotation and subject to additional charges'
    }
  ];

  const serviceFeatures = [
    'SIA registered Close Protection bodyguards available',
    'Comprehensive threat assessment and planning',
    'Discrete and professional security presence',
    'Coordination with venue security and law enforcement',
    'Emergency response and evacuation procedures',
    'Advance security reconnaissance',
    'VIP escort and transportation security',
    'Event security coordination'
  ];

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
            Close Protection Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional close protection and security services by SIA registered operatives. 
            Comprehensive security solutions for VIP clients and high-profile events.
          </p>
        </motion.div>

        {/* Service Overview */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">
                Professional Security Excellence
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Our SIA registered Close Protection bodyguards provide comprehensive security solutions 
                  for VIP clients, corporate executives, and high-profile individuals requiring enhanced 
                  personal protection.
                </p>
                <p>
                  We offer discrete, professional security services with extensive experience in threat 
                  assessment, risk management, and emergency response procedures.
                </p>
                <p>
                  All our operatives are fully vetted, trained, and licensed to provide the highest 
                  standards of personal protection and security coordination.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img
                src="https://images.pexels.com/photos/1125328/pexels-photo-1125328.jpeg"
                alt="Professional security services"
                className="rounded-lg shadow-lg w-full h-96 object-cover"
              />
              {/* SIA Logo placeholder - replace with actual SIA logo */}
              <div className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-md">
                <div className="text-xs font-bold text-gray-900">SIA LICENSED</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Protection Services */}
        <section className="mb-16 bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              Our Protection Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive security solutions tailored to individual client requirements
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {protectionServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center bg-white p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-4">
                  <service.icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Service Features */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              What We Provide
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive close protection services with attention to every security detail
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {serviceFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex items-start space-x-4"
              >
                <CheckCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <span className="text-gray-700 text-lg">{feature}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center bg-black text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 rounded-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Professional Security Consultation
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Contact our security specialists for a confidential consultation about your protection requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/contact'}
                className="bg-yellow-400 text-black px-8 py-4 rounded-md font-medium hover:bg-yellow-500 transition-colors duration-200"
              >
                Free Security Consultation
              </button>
              <a
                href="tel:07464247007"
                className="border border-yellow-400 text-yellow-400 px-8 py-4 rounded-md font-medium hover:bg-yellow-400 hover:text-black transition-colors duration-200"
              >
                Call 07464 247 007
              </a>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default CloseProtectionPage;