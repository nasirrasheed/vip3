import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, MessageCircle, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Experience', href: '/experience' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="fixed top-12 left-0 right-0 bg-black/90 backdrop-blur-md z-40 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
  <img
    src="https://videos.openai.com/vg-assets/assets%2Ftask_01k0523827ebprhhv3tkcgt3k8%2F1752516734_img_1.webp?st=2025-07-14T17%3A06%3A33Z&se=2025-07-20T18%3A06%3A33Z&sks=b&skt=2025-07-14T17%3A06%3A33Z&ske=2025-07-20T18%3A06%3A33Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=3d249c53-07fa-4ba4-9b65-0bf8eb4ea46a&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=pfCeUONCAMbXWVYDEZNbXMl3V%2Bpuw072y%2B6rjt3UTkg%3D&az=oaivgprodscus"
    alt="VIP Transport Logo"
    className="h-10 w-10 object-cover "
  />
  <div className="text-white font-serif text-xl font-semibold">
    VIP Transport<span className="text-yellow-400"> & Security</span>
  </div>
</Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-yellow-400'
                    : 'text-white hover:text-yellow-400'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="https://wa.me/447464247007?text=Hello, I would like to inquire about your VIP transport services."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-4 py-2 rounded-md font-medium hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-black/95 backdrop-blur-md rounded-lg mt-2 p-4 space-y-4"
          >
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block text-sm font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-yellow-400'
                    : 'text-white hover:text-yellow-400'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <a
              href="tel:07464247007"
              className="block bg-yellow-400 text-black px-6 py-2 rounded-md font-medium hover:bg-yellow-500 transition-colors duration-200 text-center flex items-center justify-center space-x-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Phone className="w-4 h-4" />
              <span>Book Now</span>
            </a>
            <a
              href="https://wa.me/447464247007?text=Hello, I would like to inquire about your VIP transport services."
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-green-500 text-white px-6 py-2 rounded-md font-medium hover:bg-green-600 transition-colors duration-200 text-center flex items-center justify-center space-x-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;
