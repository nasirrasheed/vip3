import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Award, Clock, CheckCircle, Globe } from 'lucide-react';
import CompanyLogos from '../components/UI/CompanyLogos';

const AboutPage = () => {
  const values = [
    {
      icon: Shield,
      title: 'Professional Excellence',
      description: 'We maintain the highest standards in all aspects of our service delivery'
    },
    {
      icon: Users,
      title: 'Client-Focused Approach',
      description: 'Every service is tailored to meet our clients\' specific requirements'
    },
    {
      icon: Award,
      title: 'Trusted Reputation',
      description: 'Built on years of reliable service to discerning clients'
    },
    {
      icon: Clock,
      title: 'Punctuality Guaranteed',
      description: 'We understand the importance of timing in professional transport'
    }
  ];

  const team = [
    {
      title: 'Professional Chauffeurs',
      description: 'Our chauffeurs are carefully selected, fully licensed, and undergo comprehensive training in customer service, route planning, and vehicle maintenance.'
    },
    {
      title: 'Operations Team',
      description: 'Our operations team ensures seamless coordination, real-time monitoring, and 24/7 support for all client requirements.'
    },
    {
      title: 'Security Specialists',
      description: 'SIA-licensed security professionals with extensive experience in close protection and risk assessment.'
    }
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
            About VIP Transport and Security
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            VIP transport pride themselves as being the regions Premier luxury transport and chauffeur service. 
            A service to Leading Hotels, Corporate Executives and Private Clients who expect excellence.
          </p>
        </motion.div>

        {/* Who We Are */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">
                Who We Are
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  VIP transport pride themselves as being the regions Premier luxury transport and chauffeur service. 
                  A service to Leading Hotels, Corporate Executives and Private Clients who expect excellence.
                </p>
                <p>
                  Our commitment to luxury, punctuality, professionalism and SIA registered Close Protection 
                  makes us the preferred choice for VIP transportation for all important and high profile events.
                </p>
                <p>
                  We stand by our Brand Values of Professionalism, Integrity, Style and Reliability.
                </p>
                <p>
                  Our Fleet of Luxury Vehicles includes Rolls Royce and Bentley Premier vehicles.
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
                src="https://videos.openai.com/vg-assets/assets%2Ftask_01jzwjgghpftr8gpp8t90h6e4c%2F1752231948_img_1.webp?st=2025-07-11T09%3A31%3A33Z&se=2025-07-17T10%3A31%3A33Z&sks=b&skt=2025-07-11T09%3A31%3A33Z&ske=2025-07-17T10%3A31%3A33Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=koPPd5eemWxST%2FOlTdB4fVCc8blDcGcymHv5mKBeOfU%3D&az=oaivgprodscus"
                alt="Professional chauffeur service"
                className="rounded-lg shadow-lg w-full h-96 object-cover"
              />
            </motion.div>
          </div>
        </section>

        {/* Our Values */}
        <section className="mb-16 bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide our service delivery and client relationships
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center bg-white p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Our Team */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              Our Professional Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experienced professionals dedicated to delivering exceptional service
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              >
                <h3 className="text-xl font-serif font-semibold text-gray-900 mb-3">
                  {member.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {member.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Company Logos */}
        <CompanyLogos 
          title="Trusted Partners"
          subtitle="We work with leading organizations and venues across the region"
        />

        {/* Contact CTA */}
        <section className="text-center bg-black text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 rounded-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Experience Professional Service
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover why discerning clients choose VIP Transport and Security 
              for their professional transport needs.
            </p>
            <button
              onClick={() => window.location.href = '/contact'}
              className="bg-yellow-400 text-black px-8 py-4 rounded-md font-medium hover:bg-yellow-500 transition-colors duration-200"
            >
              Contact Our Team
            </button>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
