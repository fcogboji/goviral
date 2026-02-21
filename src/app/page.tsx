// app/page.tsx — GoViral Landing Page
"use client"

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import Features from '../components/Features';
import CrossPosting from '../components/CrossPosting';
import Platforms from '../components/Platforms';
import Pricing from '../components/Pricing';
import Testimonials from '../components/Testimonials';
import Blog from '../components/Blog';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';

export default function GoViralLanding() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading] = useState(false);
  const { isSignedIn } = useUser();

  // --- Handlers ---

  const handleSignIn = () => {
    window.location.href = isSignedIn ? '/dashboard' : '/sign-in';
  };

  const handleStartTrial = () => {
    if (isSignedIn) { window.location.href = '/dashboard'; return; }
    window.location.href = `/trial-signup?plan=${(selectedPlan || 'pro').toLowerCase()}`;
  };

  const handleWatchDemo = () => {
    fetch('/api/analytics/demo-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'hero_section', timestamp: new Date().toISOString() }),
    }).catch(() => {});
    window.open('/demo', '_blank');
  };

  const handlePlanSelection = async (planName: string) => {
    setSelectedPlan(planName);
    try {
      await fetch('/api/analytics/plan-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName, source: 'pricing_section', timestamp: new Date().toISOString() }),
      });
    } catch { /* analytics failure is non-blocking */ }
    window.location.href = isSignedIn ? '/dashboard' : `/trial-signup?plan=${planName.toLowerCase()}`;
  };

  const handleJoinCreators = () => {
    fetch('/api/analytics/join-creators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'final_cta', timestamp: new Date().toISOString() }),
    }).catch(() => {});
    window.location.href = isSignedIn ? '/dashboard' : '/trial-signup';
  };

  const fireAnalytics = (endpoint: string, data: Record<string, string>) => {
    fetch(`/api/analytics/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, timestamp: new Date().toISOString() }),
    }).catch(() => {});
  };

  const handleFeatureClick = (name: string) => fireAnalytics('feature-click', { feature: name, source: 'features_section' });
  const handlePlatformClick = (name: string) => {
    fireAnalytics('platform-click', { platform: name, source: 'platforms_section' });
    window.location.href = `/dashboard/connect?platform=${name.toLowerCase()}`;
  };
  const handleTestimonialClick = (id: string) => fireAnalytics('testimonial-click', { testimonial_id: id, source: 'testimonials_section' });
  const handleBlogClick = (slug: string) => {
    fireAnalytics('blog-click', { slug, source: 'landing_page' });
    window.location.href = `/blog/${slug}`;
  };
  const handleContactSupport = () => {
    fireAnalytics('contact-support', { source: 'landing_page' });
    window.location.href = '/support';
  };
  const handleNewsletterSignup = async (email: string) => {
    if (!email) return;
    try {
      const r = await fetch('/api/newsletter/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'landing_page', timestamp: new Date().toISOString() }),
      });
      if (r.ok) toast.success('Successfully subscribed!');
      else throw new Error();
    } catch {
      toast.error('Failed to subscribe. Please try again.');
    }
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-white">
      <Navigation
        onSignIn={handleSignIn}
        onStartTrial={handleStartTrial}
        onContactSupport={handleContactSupport}
        isLoading={isLoading}
      />

      {/* 1. Hero — dark, bold, with Before/After preview */}
      <Hero onStartTrial={handleStartTrial} onWatchDemo={handleWatchDemo} isLoading={isLoading} />

      {/* 2. How It Works — 3-step flow */}
      <CrossPosting />

      {/* 3. Features — AI-powered features grid */}
      <Features onFeatureClick={handleFeatureClick} />

      {/* 4. Platforms + Comparison Table */}
      <Platforms onPlatformClick={handlePlatformClick} />

      {/* 5. Pricing */}
      <Pricing onPlanSelection={handlePlanSelection} />

      {/* 6. Testimonials / Success Stories */}
      <Testimonials onTestimonialClick={handleTestimonialClick} />

      {/* 7. Blog / Resources */}
      <Blog onBlogClick={handleBlogClick} />

      {/* 8. Final CTA */}
      <FinalCTA onStartTrial={handleStartTrial} onJoinCreators={handleJoinCreators} />

      {/* 9. Footer */}
      <Footer onContactSupport={handleContactSupport} onNewsletterSignup={handleNewsletterSignup} />
    </div>
  );
}
