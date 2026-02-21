"use client"
import React from 'react';
import { Rocket, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Link from 'next/link';

// Footer section component with links and company information
const FooterSection: React.FC = () => {
  // Current year for copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company information column */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Rocket className="w-8 h-8 text-purple-400 mr-2" />
              <span className="text-2xl font-bold">SocialBoost</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Empowering Nigerian businesses with cutting-edge social media management tools and analytics.
            </p>
            
            {/* Social media links */}
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-purple-400 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-purple-400 transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-purple-400 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-purple-400 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product links column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-gray-400 hover:text-white transition-colors duration-200">
                  API
                </Link>
              </li>
            </ul>
          </div>

          {/* Company links column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Press
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact information column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail className="w-5 h-5 text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
                <a 
                  href="mailto:support@socialboost.ng" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  support@socialboost.ng
                </a>
              </li>
              <li className="flex items-start">
                <Phone className="w-5 h-5 text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
                <a 
                  href="tel:+2341234567890" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  +234 123 456 7890
                </a>
              </li>
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">
                  Lagos, Nigeria
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom footer with legal links */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Copyright */}
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} SocialBoost. All rights reserved.
            </div>
            
            {/* Legal links */}
            <div className="flex space-x-6 text-sm">
              <Link 
                href="/privacy" 
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link 
                href="/cookies" 
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;