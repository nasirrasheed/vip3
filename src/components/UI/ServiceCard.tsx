import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, DivideIcon as LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: string;
  slug: string;
  index: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  icon,
  slug,
  index,
}) => {
  const IconComponent = (Icons as any)[icon] as LucideIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-lg mb-4">
        {IconComponent && <IconComponent className="w-6 h-6 text-black" />}
      </div>
      
      <h3 className="text-xl font-serif font-semibold mb-3 text-gray-900">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-4 leading-relaxed">
        {description}
      </p>
      
      <Link
        to={`/services/${slug}`}
        className="inline-flex items-center space-x-2 text-yellow-600 hover:text-yellow-700 font-medium transition-colors duration-200"
      >
        <span>View Service</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
};

export default ServiceCard;