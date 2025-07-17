import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Experience', href: '/experience' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="fixed top-12 left-0 right-0 bg-black/95 backdrop-blur-md z-40 border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18 lg:h-20">
          {/* Logo - Responsive sizing */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0 min-w-0">
            <img
              src="https://videos.openai.com/vg-assets/assets%2Ftask_01k0523827ebprhhv3tkcgt3k8%2F1752516734_img_1.webp?st=2025-07-14T17%3A06%3A33Z&se=2025-07-20T18%3A06%3A33Z&sks=b&skt=2025-07-14T17%3A06%3A33Z&ske=2025-07-20T18%3A06%3A33Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=pfCeUONCAMbXWVYDEZNbXMl3V%2Bpuw072y%2B6rjt3UTkg%3D&az=oaivgprodscus"
              alt="VIP Transport Logo"
              className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 object-cover rounded-full flex-shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <div className="text-white font-serif text-sm sm:text-base lg:text-xl xl:text-2xl font-semibold leading-tight truncate">
                VIP Transport<span className="text-yellow-400"> & Security</span>
              </div>
              <div className="text-yellow-400 text-xs sm:text-xs lg:text-sm font-light italic leading-tight  sm:block">
                Your Journey, Our Priority.
              </div>
            </div>
          </Link>

          {/* Desktop Navigation - Hidden on mobile and tablet */}
          <nav className="hidden xl:flex space-x-4 2xl:space-x-8 flex-shrink-0">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm 2xl:text-base font-medium transition-colors duration-200 whitespace-nowrap ${
                  isActive(item.href)
                    ? 'text-yellow-400'
                    : 'text-white hover:text-yellow-400'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop WhatsApp Button - Only on XL screens and above */}
          <div className="hidden xl:flex items-center space-x-4 flex-shrink-0">
            <a
              href="https://wa.me/447464247007?text=Hello, I would like to inquire about your VIP transport services."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-4 py-2 xl:px-6 xl:py-3 rounded-md text-sm xl:text-base font-medium hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 xl:w-5 xl:h-5" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Mobile/Tablet menu button */}
          <button
            className="xl:hidden text-white p-2 hover:bg-white/10 rounded-md transition-colors duration-200 flex-shrink-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile/Tablet Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="xl:hidden bg-black/98 backdrop-blur-md rounded-lg mt-2 mb-4 p-4 space-y-3 border border-white/10 shadow-xl"
          >
            {/* Navigation Links */}
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block text-base font-medium transition-colors duration-200 py-2 px-3 rounded-md ${
                    isActive(item.href)
                      ? 'text-yellow-400 bg-yellow-400/10'
                      : 'text-white hover:text-yellow-400 hover:bg-white/5'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile Action Buttons */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              {/* Book Now Button - Mobile Only */}
              <a
                href="tel:07464247007"
                className="block bg-yellow-400 text-black px-4 py-3 rounded-md font-medium hover:bg-yellow-500 transition-colors duration-200 text-center flex items-center justify-center space-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Phone className="w-5 h-5" />
                <span>Book Now - 07464 247 007</span>
              </a>

              {/* WhatsApp Button */}
              <a
                href="https://wa.me/447464247007?text=Hello, I would like to inquire about your VIP transport services."
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-green-500 text-white px-4 py-3 rounded-md font-medium hover:bg-green-600 transition-colors duration-200 text-center flex items-center justify-center space-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageCircle className="w-5 h-5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;
