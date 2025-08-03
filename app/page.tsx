// pages/index.tsx or app/page.tsx
"use client"

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Platforms from '../components/Platforms';
import Pricing from '../components/Pricing';
import Testimonials from '../components/Testimonials';
import Blog from '../components/Blog';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';

export default function GoViralLanding() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn } = useUser();

  // Backend connection handlers
  const handleSignIn = () => {
    if (isSignedIn) {
      // If already signed in, go to dashboard
      window.location.href = '/dashboard';
    } else {
      // If not signed in, go to sign in page
      window.location.href = '/sign-in';
    }
  };

  const handleStartTrial = async () => {
    if (isSignedIn) {
      // If already signed in, go to dashboard
      window.location.href = '/dashboard';
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/trial/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan || 'Creator',
          source: 'landing_page'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store the selected plan in sessionStorage for the trial signup page
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('selectedPlan', selectedPlan || 'Creator');
        }
        
        // Redirect to trial signup page
        window.location.href = `/trial-signup?plan=${(selectedPlan || 'Creator').toLowerCase()}`;
      } else {
        console.error('Failed to start trial:', data.error);
        // Fallback to signup page
        window.location.href = '/sign-up';
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      // Fallback to signup page
      window.location.href = '/sign-up';
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchDemo = () => {
    fetch('/api/analytics/demo-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'hero_section',
        timestamp: new Date().toISOString()
      })
    }).catch(error => console.error('Analytics error:', error));

    window.open('/demo', '_blank');
  };

  const handlePlanSelection = async (planName: string) => {
    setSelectedPlan(planName);

    try {
      await fetch('/api/analytics/plan-selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planName,
          source: 'pricing_section',
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error tracking plan selection:', error);
    }

    if (isSignedIn) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = `/sign-up?plan=${planName.toLowerCase()}`;
    }
  };

  const handleJoinCreators = () => {
    fetch('/api/analytics/join-creators', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'final_cta',
        timestamp: new Date().toISOString()
      })
    }).catch(error => console.error('Analytics error:', error));

    if (isSignedIn) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/sign-up';
    }
  };

  const handleBlogClick = (slug: string) => {
    fetch('/api/analytics/blog-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug,
        source: 'landing_page',
        timestamp: new Date().toISOString()
      })
    }).catch(error => console.error('Analytics error:', error));

    window.location.href = `/blog/${slug}`;
  };

  const handleFeatureClick = (featureName: string) => {
    fetch('/api/analytics/feature-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        feature: featureName,
        source: 'features_section',
        timestamp: new Date().toISOString()
      })
    }).catch(error => console.error('Analytics error:', error));
  };

  const handlePlatformClick = (platformName: string) => {
    fetch('/api/analytics/platform-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform: platformName,
        source: 'platforms_section',
        timestamp: new Date().toISOString()
      })
    }).catch(error => console.error('Analytics error:', error));
  };

  const handleTestimonialClick = (testimonialId: string) => {
    fetch('/api/analytics/testimonial-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        testimonial_id: testimonialId,
        source: 'testimonials_section',
        timestamp: new Date().toISOString()
      })
    }).catch(error => console.error('Analytics error:', error));
  };

  const handleNewsletterSignup = async (email: string) => {
    if (!email) return;
    
    try {
      const response = await fetch('/api/newsletter/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'landing_page',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('Successfully subscribed to newsletter!');
      } else {
        throw new Error('Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      alert('Failed to subscribe. Please try again.');
    }
  };

  const handleContactSupport = () => {
    fetch('/api/analytics/contact-support', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'landing_page',
        timestamp: new Date().toISOString()
      })
    }).catch(error => console.error('Analytics error:', error));
    
    window.location.href = '/support';
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation 
        onSignIn={handleSignIn} 
        onStartTrial={handleStartTrial} 
        onContactSupport={handleContactSupport} 
        isLoading={isLoading}
      />
      
      <Hero 
        onStartTrial={handleStartTrial} 
        onWatchDemo={handleWatchDemo} 
        isLoading={isLoading}
      />
      
      <Features 
        onFeatureClick={handleFeatureClick} 
      />
      
      <Platforms 
        onPlatformClick={handlePlatformClick} 
      />
      
      <Pricing 
        onPlanSelection={handlePlanSelection} 
      />
      
      <Testimonials 
        onTestimonialClick={handleTestimonialClick} 
      />
      
      <Blog 
        onBlogClick={handleBlogClick} 
      />
      
      <FinalCTA 
        onStartTrial={handleStartTrial} 
        onJoinCreators={handleJoinCreators} 
      />
      
      <Footer 
        onContactSupport={handleContactSupport} 
        onNewsletterSignup={handleNewsletterSignup} 
      />
    </div>
  );
}