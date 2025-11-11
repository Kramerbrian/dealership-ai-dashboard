'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Home, DollarSign, HelpCircle, LogIn, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface MobileMenuProps {
  logo?: React.ReactNode;
  ctaText?: string;
  ctaHref?: string;
}

export function MobileMenu({
  logo,
  ctaText = 'Start Free Trial',
  ctaHref = '/sign-up'
}: MobileMenuProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const navigationItems = [
    {
      label: 'How it works',
      href: '#how',
      icon: <Home className="w-5 h-5" />,
      description: 'See how DealershipAI works'
    },
    {
      label: 'Results',
      href: '#results',
      icon: <Sparkles className="w-5 h-5" />,
      description: 'Real results from dealerships'
    },
    {
      label: 'Pricing',
      href: '/pricing',
      icon: <DollarSign className="w-5 h-5" />,
      description: 'Simple, transparent pricing'
    },
    {
      label: 'FAQ',
      href: '#faq',
      icon: <HelpCircle className="w-5 h-5" />,
      description: 'Common questions answered'
    }
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <div
            className="fixed top-0 right-0 bottom-0 w-[320px] max-w-[85vw] bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 border-l border-white/10 z-50 md:hidden overflow-y-auto animate-slide-left shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-white/10 p-4 flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-2">
                {logo || (
                  <>
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600" />
                    <span className="text-lg font-bold text-white">
                      dealership<span className="text-blue-500">AI</span>
                    </span>
                  </>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-4 space-y-2" aria-label="Mobile navigation">
              {navigationItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={handleLinkClick}
                  className="group flex items-center gap-4 p-4 rounded-xl hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
                    {item.icon}
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <p className="font-semibold text-white mb-0.5">{item.label}</p>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </nav>

            {/* Divider */}
            <div className="mx-4 border-t border-white/10" />

            {/* CTA Buttons */}
            <div className="p-4 space-y-3">
              {/* Sign In */}
              <Link
                href="/sign-in"
                onClick={handleLinkClick}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 text-center border border-white/20 rounded-xl hover:bg-white/10 transition-all font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </Link>

              {/* Primary CTA */}
              <Link
                href={ctaHref}
                onClick={handleLinkClick}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-white hover:shadow-xl hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Sparkles className="w-5 h-5" />
                {ctaText}
              </Link>
            </div>

            {/* Footer Info */}
            <div className="p-4 mt-4 text-center text-sm text-gray-500">
              <p>No credit card required</p>
              <p className="mt-1">14-day free trial</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Compact version for in-page use
export function CompactMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-gray-900 border-t border-white/10 shadow-2xl animate-slide-down">
          <nav className="p-4 space-y-2">
            <a href="#how" className="block py-3 px-4 hover:bg-white/10 rounded-lg transition-colors">
              How it works
            </a>
            <a href="#results" className="block py-3 px-4 hover:bg-white/10 rounded-lg transition-colors">
              Results
            </a>
            <a href="/pricing" className="block py-3 px-4 hover:bg-white/10 rounded-lg transition-colors">
              Pricing
            </a>
            <a href="#faq" className="block py-3 px-4 hover:bg-white/10 rounded-lg transition-colors">
              FAQ
            </a>
            <div className="pt-2 border-t border-white/10 space-y-2">
              <a href="/sign-in" className="block py-3 px-4 text-center border border-white/20 rounded-lg hover:bg-white/10 transition-colors">
                Sign In
              </a>
              <a href="/sign-up" className="block py-3 px-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:shadow-xl transition-all">
                Start Free Trial
              </a>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
