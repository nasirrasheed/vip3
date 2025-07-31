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
                 <div className="text-primary-foreground font-serif text-xl font-semibold">
                VIP Transport<span className="text-gold"> & Security</span>
              </div>
              <div className="text-gold text-xs font-light italic">
                Your Journey, Our Priority.
              </div>
            </div>
            </Link>
            <p className="text-muted-foreground text-sm">
              Premium chauffeur-driven transport and VIP security services across the UK. 
              Professional, discreet, and reliable transport solutions.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Services</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/services/chauffeur-service" className="text-muted-foreground hover:text-gold transition-colors text-sm">
                Chauffeur Service
              </Link>
              <Link to="/services/airport-transfers" className="text-muted-foreground hover:text-gold transition-colors text-sm">
                Airport Transfers
              </Link>
              <Link to="/services/wedding-transport" className="text-muted-foreground hover:text-gold transition-colors text-sm">
                Wedding Transport
              </Link>
              <Link to="/services/corporate-transport" className="text-muted-foreground hover:text-gold transition-colors text-sm">
                Corporate Transport
              </Link>
              <Link to="/services/security-services" className="text-muted-foreground hover:text-gold transition-colors text-sm">
                Security Services
              </Link>
              <Link to="/services/event-transport" className="text-muted-foreground hover:text-gold transition-colors text-sm">
                Event Transport
              </Link>
            </nav>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Company</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/about" className="text-muted-foreground hover:text-gold transition-colors text-sm">
                About Us
              </Link>
              <Link to="/experience" className="text-muted-foreground hover:text-gold transition-colors text-sm">
                Experience
              </Link>
              <Link to="/blog" className="text-muted-foreground hover:text-gold transition-colors text-sm">
                Insights
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-gold transition-colors text-sm">
                Contact
              </Link>
              <Link to="/reviews" className="text-muted-foreground hover:text-gold transition-colors text-sm">
                Leave a Review
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gold">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gold" />
                <span className="text-muted-foreground">07464 247 007</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gold" />
                <span className="text-muted-foreground">bookings@viptransportandsecurity.co.uk</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gold" />
                <div className="text-muted-foreground">
                  <p>North West and Cheshire</p>
                  <p className="text-xs">Registered: 167 Great Portland Street, London W1W 5PF</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gold text-sm">Hours:</span>
                <span className="text-muted-foreground text-sm">24/7* Subject to additional charges</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground text-sm">
          <p className="mb-4">&copy; {currentYear} VIP Transport and Security. All rights reserved. | Licensed and Regulated Transport Services</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/privacy-policy" 
              className="text-muted-foreground hover:text-gold transition-colors underline"
            >
              Privacy Policy
            </Link>
            <span className="hidden sm:inline text-muted-foreground">|</span>
            <Link 
              to="/cookie-policy" 
              className="text-muted-foreground hover:text-gold transition-colors underline"
            >
              Cookie Policy
            </Link>
            <span className="hidden sm:inline text-muted-foreground">|</span>
            <a 
              href="https://marknova.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-gold transition-colors underline"
            >
              Created By MarkNova
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
