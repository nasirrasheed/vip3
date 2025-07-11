import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, ChevronUp } from 'lucide-react';

const TopBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show banner when scrolling up and past 100px
      if (currentScrollY < lastScrollY && currentScrollY > 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY || currentScrollY <= 100) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <div className="font-bold text-lg mb-1">
                  FREE NO-OBLIGATION QUOTATION - CALL NOW ON 07464 247 007
                </div>
                <div className="text-sm">
                  Professional VIP transport and professional chauffeurs available for Weddings, Corporate Events, Sporting Events and Proms
                </div>
                <div className="text-sm font-semibold mt-1">
                  Book Now on 07464 247 007 and WhatsApp
                </div>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="ml-4 p-1 hover:bg-black/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TopBanner;