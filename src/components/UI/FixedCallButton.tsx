import React from 'react';
import { Phone } from 'lucide-react';

const FixedCallButton = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-400 text-black shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-center">
          <a
            href="tel:07464247007"
            className="flex items-center space-x-2 font-bold text-lg hover:text-gray-800 transition-colors duration-200"
          >
            <Phone className="w-5 h-5" />
            <span>CALL NOW - 07464 247 007</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default FixedCallButton;