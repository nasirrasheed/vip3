import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Users, CheckCircle, Star, Award } from 'lucide-react';

const ExperiencePage = () => {
  const serviceStandards = [
    {
      icon: Shield,
      title: 'Vehicle Selection Process',
      description: 'Each vehicle is hand-selected based on your specific requirements, event type, and journey needs. We maintain a diverse fleet of premium vehicles, all meticulously maintained to the highest standards.',
      backgroundImage: 'https://videos.openai.com/vg-assets/assets%2Ftask_01k0ef9kghea1vacceyt8ah740%2F1752832552_img_0.webp?st=2025-07-18T08%3A31%3A06Z&se=2025-07-24T09%3A31%3A06Z&sks=b&skt=2025-07-18T08%3A31%3A06Z&ske=2025-07-24T09%3A31%3A06Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=v2B9I%2Fak4nnoTCzZ002bK2OV2DENvVowuNauoeFtCz4%3D&az=oaivgprodscus'
    },
    {
      icon: Users,
      title: 'Professional Chauffeur Standards',
      description: 'Our chauffeurs undergo rigorous selection and training processes. They are fully licensed, uniformed professionals with extensive local knowledge and customer service expertise.',
      backgroundImage: 'https://videos.openai.com/vg-assets/assets%2Ftask_01k0egzbnqeha9b2449wg6x875%2F1752834313_img_0.webp?st=2025-07-18T09%3A26%3A03Z&se=2025-07-24T10%3A26%3A03Z&sks=b&skt=2025-07-18T09%3A26%3A03Z&ske=2025-07-24T10%3A26%3A03Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=KF%2BBFpfH4P%2FUAr14if2DVyfxmmiBZmAlMBJeUu%2FceTA%3D&az=oaivgprodscus'
    },
    {
      icon: Clock,
      title: 'Journey Planning & Coordination',
      description: 'Every journey is meticulously planned with real-time traffic monitoring, alternative route planning, and coordination with your schedule to ensure punctual arrivals.',
      backgroundImage: 'https://videos.openai.com/vg-assets/assets%2Ftask_01k0egzjyafmkagsn950ktw67z%2F1752834363_img_0.webp?st=2025-07-18T09%3A24%3A40Z&se=2025-07-24T10%3A24%3A40Z&sks=b&skt=2025-07-18T09%3A24%3A40Z&ske=2025-07-24T10%3A24%3A40Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=%2FhxNkrXWj%2BImfqfb9wqOkzCnCV9YEztYSrIRVShnI6A%3D&az=oaivgprodscus'
    },
    {
      icon: CheckCircle,
      title: 'Service Reliability',
      description: 'We guarantee consistent, reliable service with 24/7 operational support, real-time journey tracking, and immediate assistance when needed.',
      backgroundImage: 'https://videos.openai.com/vg-assets/assets%2Ftask_01k0eh6ansfe2tnppv60vwvx23%2F1752834551_img_0.webp?st=2025-07-18T09%3A26%3A00Z&se=2025-07-24T10%3A26%3A00Z&sks=b&skt=2025-07-18T09%3A26%3A00Z&ske=2025-07-24T10%3A26%3A00Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=sJqUom2P4I86HfBIMxYUi2aFYbYkw6gQJw7dihtqOO4%3D&az=oaivgprodscus'
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
                className="relative bg-gray-50 p-8 rounded-lg overflow-hidden"
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${standard.backgroundImage})` }}
                >
                  <div className="absolute inset-0 bg-white bg-opacity-90"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-6 shadow-lg">
                    <standard.icon className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-gray-900 mb-4">
                    {standard.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed font-medium">
                    {standard.description}
                  </p>
                </div>
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
                src="https://i.pinimg.com/736x/7e/97/a1/7e97a1e93c7ccc125201fdf9fe66c038.jpg"
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
                description: 'We discuss your requirements and tailor our service to your needs',
                iconImage: 'https://videos.openai.com/vg-assets/assets%2Ftask_01k0efygqee4tb79846aazk92d%2F1752833233_img_0.webp?st=2025-07-18T08%3A31%3A03Z&se=2025-07-24T09%3A31%3A03Z&sks=b&skt=2025-07-18T08%3A31%3A03Z&ske=2025-07-24T09%3A31%3A03Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=KW%2BZ80LrcZNXfOZWKS4%2FDBXtxQN5INQYpQX7DdIBOu0%3D&az=oaivgprodscus'
              },
              {
                step: '02',
                title: 'Planning',
                description: 'Route planning, vehicle selection, and schedule coordination',
                iconImage: 'https://videos.openai.com/vg-assets/assets%2Ftask_01k0efz4azes0a65pjw1nc1dhr%2F1752833287_img_0.webp?st=2025-07-18T08%3A50%3A57Z&se=2025-07-24T09%3A50%3A57Z&sks=b&skt=2025-07-18T08%3A50%3A57Z&ske=2025-07-24T09%3A50%3A57Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=pyoIx4GbDWJWKc7PhKQL9Qi1Tkoj%2FO2D3jEJDtD5o74%3D&az=oaivgprodscus'
              },
              {
                step: '03',
                title: 'Execution',
                description: 'Professional service delivery with real-time monitoring',
                iconImage: 'https://videos.openai.com/vg-assets/assets%2Ftask_01k0egkpq2f76vj2b6y5fh714e%2F1752833943_img_0.webp?st=2025-07-18T08%3A29%3A40Z&se=2025-07-24T09%3A29%3A40Z&sks=b&skt=2025-07-18T08%3A29%3A40Z&ske=2025-07-24T09%3A29%3A40Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=ypbFDcW%2BbD8BBG3VWeawIQ3CDcbvgm7BnduXKseBQJ8%3D&az=oaivgprodscus'
              },
              {
                step: '04',
                title: 'Follow-up',
                description: 'Post-service feedback and continuous improvement',
                iconImage: 'https://videos.openai.com/vg-assets/assets%2Ftask_01k0egmagrfcktmqpc699t4h4p%2F1752833971_img_0.webp?st=2025-07-18T08%3A31%3A21Z&se=2025-07-24T09%3A31%3A21Z&sks=b&skt=2025-07-18T08%3A31%3A21Z&ske=2025-07-24T09%3A31%3A21Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=1yEND6z2eeZbye4lFJ8RG0xTCiQ7Nahji3jDWPuNfRw%3D&az=oaivgprodscus'
              }
            ].map((process, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-md">
                  <img
                    src={process.iconImage}
                    alt={process.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <span className="text-white font-bold text-lg drop-shadow-lg">{process.step}</span>
                  </div>
                </div>
                <h3 className="text-xl font-serif font-semibold text-gray-900 mb-3">
                  {process.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
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
