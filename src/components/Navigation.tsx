// components/Navigation.tsx
"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import { Menu, X, ChevronDown, Sparkles } from 'lucide-react';

interface NavigationProps {
  onSignIn: () => void;
  onStartTrial: () => void;
  onContactSupport: () => void;
  isLoading: boolean;
}

export default function Navigation({
  onSignIn,
  onStartTrial,
  onContactSupport,
  isLoading
}: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const closeMobileMenu = () => setIsMenuOpen(false)

  const handleAuthAction = () => {
    if (isSignedIn) {
      window.location.href = '/dashboard';
    } else {
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

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isSignedIn) {
        try {
          const response = await fetch('/api/user/is-admin');
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [isSignedIn]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span className="text-xl font-bold text-black">GoViral</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <a href="#features" className="text-gray-700 hover:text-black px-3 py-2 rounded-lg text-sm font-medium transition-colors">
              Features
            </a>
            <a href="#platforms" className="text-gray-700 hover:text-black px-3 py-2 rounded-lg text-sm font-medium transition-colors">
              Platforms
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-black px-3 py-2 rounded-lg text-sm font-medium transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="text-gray-700 hover:text-black px-3 py-2 rounded-lg text-sm font-medium transition-colors">
              Results
            </a>
            <button
              onClick={onContactSupport}
              className="text-gray-700 hover:text-black px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Support
            </button>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isSignedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-black px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <div className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {getInitials(user?.fullName || user?.firstName || 'U')}
                  </div>
                  <span>{user?.firstName || 'User'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl py-1 z-50">
                    <button
                      onClick={() => { handleAuthAction(); setIsUserMenuOpen(false); }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      Dashboard
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => { window.location.href = '/admin/dashboard'; setIsUserMenuOpen(false); }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 font-medium transition-colors"
                      >
                        Admin Panel
                      </button>
                    )}
                    <div className="border-t border-gray-700 my-1" />
                    <button
                      onClick={() => { handleSignOut(); setIsUserMenuOpen(false); }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={onSignIn}
                  className="text-gray-700 hover:text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onStartTrial}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Start Free Trial'}
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-black p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-900/95 backdrop-blur-xl rounded-2xl mt-2 mb-4 border border-gray-800 shadow-2xl overflow-hidden">
            <div className="p-4 space-y-1">
              <a href="#features" onClick={closeMobileMenu} className="block text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-3 rounded-xl text-sm font-medium transition-colors">
                Features
              </a>
              <a href="#platforms" onClick={closeMobileMenu} className="block text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-3 rounded-xl text-sm font-medium transition-colors">
                Platforms
              </a>
              <a href="#pricing" onClick={closeMobileMenu} className="block text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-3 rounded-xl text-sm font-medium transition-colors">
                Pricing
              </a>
              <a href="#testimonials" onClick={closeMobileMenu} className="block text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-3 rounded-xl text-sm font-medium transition-colors">
                Results
              </a>
              <button
                onClick={() => { closeMobileMenu(); onContactSupport(); }}
                className="block w-full text-left text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
              >
                Support
              </button>

              <div className="border-t border-gray-800 pt-3 mt-3">
                {isSignedIn ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {getInitials(user?.fullName || user?.firstName || 'U')}
                      </div>
                      <span className="text-white text-sm font-medium">
                        {user?.firstName || 'User'}
                      </span>
                    </div>
                    <button
                      onClick={handleAuthAction}
                      className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-500 transition-colors"
                    >
                      Dashboard
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => window.location.href = '/admin/dashboard'}
                        className="w-full bg-red-600/10 text-red-400 border border-red-600/20 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600/20 transition-colors"
                      >
                        Admin Panel
                      </button>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-gray-400 px-4 py-2.5 rounded-xl text-sm font-medium hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={onSignIn}
                      className="flex-1 text-gray-300 border border-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:border-gray-500 hover:text-white transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={onStartTrial}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-500 transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Start Trial'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
