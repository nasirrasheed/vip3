import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Users, CheckCircle, Star, Award } from 'lucide-react';

const ExperiencePage = () => {
  const serviceStandards = [
    {
      icon: Shield,
      title: 'Vehicle Selection Process',
      description: 'Each vehicle is hand-selected based on your specific requirements, event type, and journey needs. We maintain a diverse fleet of premium vehicles, all meticulously maintained to the highest standards.'
    },
    {
      icon: Users,
      title: 'Professional Chauffeur Standards',
      description: 'Our chauffeurs undergo rigorous selection and training processes. They are fully licensed, uniformed professionals with extensive local knowledge and customer service expertise.'
    },
    {
      icon: Clock,
      title: 'Journey Planning & Coordination',
      description: 'Every journey is meticulously planned with real-time traffic monitoring, alternative route planning, and coordination with your schedule to ensure punctual arrivals.'
    },
    {
      icon: CheckCircle,
      title: 'Service Reliability',
      description: 'We guarantee consistent, reliable service with 24/7 operational support, real-time journey tracking, and immediate assistance when needed.'
    }
  ];

  const experienceFeatures = [
    'Immaculately presented vehicles with premium interiors',
    'Professional, uniformed chauffeurs',
    'Complimentary refreshments and amenities',
    'Privacy glass and climate control',
    'Real-time journey monitoring',
    'Meet and greet service',
    'Luggage assistance',
    'Flexible scheduling and route planning'
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
            Your Journey Experience
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every aspect of our service is designed to provide you with a seamless, 
            comfortable, and professional transport experience.
          </p>
        </motion.div>

        {/* Service Standards */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              Our Service Standards
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              How we ensure exceptional service delivery for every client
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {serviceStandards.map((standard, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 p-8 rounded-lg"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-6">
                  <standard.icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-gray-900 mb-4">
                  {standard.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {standard.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* What to Expect */}
        <section className="mb-16 bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">
                What to Expect
              </h2>
              <p className="text-gray-700 mb-8 leading-relaxed">
                From the moment you book our service to your final destination, 
                every detail is carefully managed to ensure your complete satisfaction.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {experienceFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img
                src="https://images.pexels.com/photos/1456031/pexels-photo-1456031.jpeg"
                alt="Professional chauffeur service experience"
                className="rounded-lg shadow-lg w-full h-96 object-cover"
              />
            </motion.div>
          </div>
        </section>

        {/* Service Process */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              Our Service Process
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A seamless experience from booking to destination
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Consultation',
                description: 'We discuss your requirements and tailor our service to your needs'
              },
              {
                step: '02',
                title: 'Planning',
                description: 'Route planning, vehicle selection, and schedule coordination'
              },
              {
                step: '03',
                title: 'Execution',
                description: 'Professional service delivery with real-time monitoring'
              },
              {
                step: '04',
                title: 'Follow-up',
                description: 'Post-service feedback and continuous improvement'
              }
            ].map((process, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-black font-bold text-lg">{process.step}</span>
                </div>
                <h3 className="text-xl font-serif font-semibold text-gray-900 mb-3">
                  {process.title}
                </h3>
                <p className="text-gray-600">
                  {process.description}
                </p>
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
              Experience the Difference
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover why our clients choose VIP Transport and Security 
              for their most important journeys.
            </p>
            <button
              onClick={() => window.location.href = '/contact'}
              className="bg-yellow-400 text-black px-8 py-4 rounded-md font-medium hover:bg-yellow-500 transition-colors duration-200"
            >
              Book Your Journey
            </button>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default ExperiencePage;