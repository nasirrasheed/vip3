import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface CompanyLogo {
  id: string;
  name: string;
  logo_url: string;
  order_index: number;
  is_active: boolean;
}

interface CompanyLogosProps {
  title?: string;
  subtitle?: string;
}

const CompanyLogos: React.FC<CompanyLogosProps> = ({ 
  title = "Trusted by Leading Organizations",
  subtitle = "We proudly serve prestigious clients across various industries"
}) => {
  const [logos, setLogos] = useState<CompanyLogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const { data, error } = await supabase
          .from('company_logos')
          .select('*')
          .eq('is_active', true)
          .order('order_index');

        if (error) throw error;
        setLogos(data || []);
      } catch (error) {
        console.error('Error fetching company logos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogos();
  }, []);

  if (loading || logos.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <div className="relative overflow-hidden">
          <motion.div
            animate={{ x: [0, -100 * logos.length] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: logos.length * 3,
                ease: "linear",
              },
            }}
            className="flex space-x-12"
            style={{ width: `${logos.length * 200}px` }}
          >
            {[...logos, ...logos].map((logo, index) => (
              <div
                key={`${logo.id}-${index}`}
                className="flex-shrink-0 w-32 h-16 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
              >
                <img
                  src={logo.logo_url}
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CompanyLogos;