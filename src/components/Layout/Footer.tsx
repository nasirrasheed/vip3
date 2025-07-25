import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin } from 'lucide-react';
import logo from "@/assets/vip-logo.webp";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
            <img
    src={logo}
    alt="VIP Transport Logo"
    className="h-10 w-10 object-cover "
  />
                 <div className="flex flex-col">
                 <div className="text-white font-serif text-xl font-semibold">
                VIP Transport<span className="text-yellow-400"> & Security</span>
              </div>
              <div className="text-yellow-400 text-xs font-light italic">
                Your Journey, Our Priority.
              </div>
            </div>
            </Link>
            <p className="text-gray-400 text-sm">
              Premium chauffeur-driven transport and VIP security services across the UK. 
              Professional, discreet, and reliable transport solutions.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-yellow-400">Services</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/services/chauffeur-service" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                Chauffeur Service
              </Link>
              <Link to="/services/airport-transfers" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                Airport Transfers
              </Link>
              <Link to="/services/wedding-transport" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                Wedding Transport
              </Link>
              <Link to="/services/corporate-transport" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                Corporate Transport
              </Link>
              <Link to="/services/security-services" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                Security Services
              </Link>
              <Link to="/services/event-transport" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                Event Transport
              </Link>
            </nav>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-yellow-400">Company</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/about" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                About Us
              </Link>
              <Link to="/experience" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                Experience
              </Link>
              <Link to="/blog" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                Insights
              </Link>
              <Link to="/contact" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                Contact
              </Link>
              <Link to="/reviews" className="text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                Leave a Review
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-yellow-400">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-yellow-400" />
                <span className="text-gray-400">07464 247 007</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-yellow-400" />
                <span className="text-gray-400">bookings@viptransportandsecurity.co.uk</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-yellow-400" />
                <div className="text-gray-400">
                  <p>North West and Cheshire</p>
                  <p className="text-xs">Registered: 167 Great Portland Street, London W1W 5PF</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400 text-sm">Hours:</span>
                <span className="text-gray-400 text-sm">24/7* Subject to additional charges</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} VIP Transport and Security. All rights reserved. | Licensed and Regulated Transport Services</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
