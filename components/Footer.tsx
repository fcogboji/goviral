// components/Footer.tsx
"use client"

import React, { useState } from 'react';

interface FooterProps {
  onContactSupport: () => void;
  onNewsletterSignup: (email: string) => void;
}

export default function Footer({ onContactSupport, onNewsletterSignup }: FooterProps) {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = () => {
    if (email) {
      onNewsletterSignup(email);
      setEmail('');
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">GoViral</h3>
            <p className="text-gray-400">
              The ultimate social media management platform for creators and businesses.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              <li><a href="#analytics" className="hover:text-white">Analytics</a></li>
              <li><a href="#integrations" className="hover:text-white">Integrations</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#about" className="hover:text-white">About</a></li>
              <li><a href="#careers" className="hover:text-white">Careers</a></li>
              <li><a href="#blog" className="hover:text-white">Blog</a></li>
              <li><button onClick={onContactSupport} className="hover:text-white">Contact Support</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Stay Updated</h4>
            <p className="text-gray-400 mb-4">
              Get the latest updates and tips delivered to your inbox.
            </p>
            <div className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleNewsletterSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 GoViral. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#privacy" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
              <a href="#terms" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
              <a href="#cookies" className="text-gray-400 hover:text-white text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}