// components/Navigation.tsx
"use client"

import React, { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { Menu, X, ChevronDown } from 'lucide-react';

interface NavigationProps {
  onSignIn: () => void;
  onStartTrial: () => void;
  onContactSupport: () => void; // Add this prop
  isLoading: boolean;
}

export default function Navigation({ 
  onSignIn, 
  onStartTrial, 
  onContactSupport, // Add this parameter
  isLoading
}: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const handleAuthAction = () => {
    if (isSignedIn) {
      // If signed in, go to dashboard
      window.location.href = '/dashboard';
    } else {
      // If not signed in, go to sign in
      onSignIn();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-indigo-600">GoViral</h1>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Pricing</a>
              <a href="#testimonials" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Testimonials</a>
              <button 
                onClick={onContactSupport}
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Support
              </button>
              
              {isSignedIn ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {getInitials(user?.fullName || user?.firstName || 'U')}
                    </div>
                    <span>{user?.firstName || 'User'}</span>
                    <ChevronDown size={16} />
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <button 
                        onClick={() => {
                          handleAuthAction();
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Dashboard
                      </button>
                      <button 
                        onClick={() => {
                          handleSignOut();
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={onSignIn} 
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={onStartTrial} 
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Start Free Trial'}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-indigo-600">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <a href="#features" className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">Features</a>
              <a href="#pricing" className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">Pricing</a>
              <a href="#testimonials" className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">Testimonials</a>
              <button 
                onClick={onContactSupport}
                className="block w-full text-left text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium"
              >
                Support
              </button>
              
              {isSignedIn ? (
                <div className="space-y-2 border-t pt-2">
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {getInitials(user?.fullName || user?.firstName || 'U')}
                    </div>
                    <span className="text-gray-700 text-base font-medium">
                      {user?.firstName || 'User'}
                    </span>
                  </div>
                  <div className="flex space-x-2 px-3">
                    <button 
                      onClick={handleAuthAction}
                      className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Dashboard
                    </button>
                    <button 
                      onClick={handleSignOut}
                      className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-2 px-3 pt-2 border-t">
                  <button 
                    onClick={onSignIn} 
                    className="flex-1 text-gray-700 hover:text-indigo-600 border border-gray-300 px-3 py-2 rounded-md text-sm font-medium hover:border-indigo-600 transition-colors"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={onStartTrial} 
                    className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Start Trial'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}