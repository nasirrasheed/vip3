import React from 'react';
import { Phone } from 'lucide-react';

const FixedCallButton = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-400 text-black shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center">
          <a
            href="tel:07464247007"
            className="flex items-center space-x-3 font-bold text-xl md:text-2xl lg:text-3xl hover:text-gray-800 transition-colors duration-200"
          >
            <Phone className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />
            <span>CALL NOW - 07464 247 007</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default FixedCallButton;