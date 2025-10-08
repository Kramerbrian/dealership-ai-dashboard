'use client';

import React from 'react';
import FormSection from '@/components/landing/FormSection';

export default function LandingPage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://js.clerk.com https://js.clerk.dev https://clerk.dealershipai.com https://vercel.live https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: https: blob:; connect-src 'self' https://api.stripe.com https://clerk.dealershipai.com https://api.clerk.com https://vercel.live wss: https:; frame-src 'self' https://js.stripe.com https://js.clerk.com https://js.clerk.dev https://clerk.dealershipai.com https://vercel.live; object-src 'none'; base-uri 'self'; form-action 'self' https://checkout.stripe.com; worker-src 'self' blob:; child-src 'self' blob:;" />
        <title>DealershipAI - Transform Your Dealership with AI-Powered Analytics</title>
        <meta name="description" content="Get comprehensive AI-powered analytics for your dealership. Track SEO, social media, customer engagement, and boost your online presence with DealershipAI." />
        
        {/* Vercel Analytics */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments) };
            `
          }}
        />
        <script defer src="/_vercel/insights/script.js"></script>
        
        <style jsx>{`
          :root {
            --primary-color: #007AFF;
            --secondary-color: #5856D6;
            --success-color: #34C759;
            --warning-color: #FF9500;
            --error-color: #FF3B30;
            --text-primary: #1D1D1F;
            --text-secondary: #86868B;
            --text-tertiary: #C7C7CC;
            --background: #FFFFFF;
            --background-secondary: #F2F2F7;
            --border: #D1D1D6;
            --radius: 12px;
            --radius-lg: 16px;
            --space-1: 4px;
            --space-2: 8px;
            --space-3: 12px;
            --space-4: 16px;
            --space-6: 24px;
            --space-8: 32px;
            --space-12: 48px;
            --space-16: 64px;
            --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: var(--text-primary);
            background: var(--background);
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 var(--space-4);
          }

          /* Header */
          .header {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: saturate(180%) blur(20px);
            -webkit-backdrop-filter: saturate(180%) blur(20px);
            border-bottom: 0.5px solid var(--border);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
          }

          .header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--space-4) 0;
          }

          .logo {
            font-size: 24px;
            font-weight: 700;
            color: var(--primary-color);
            text-decoration: none;
          }

          .nav {
            display: flex;
            gap: var(--space-8);
          }

          .nav a {
            color: var(--text-primary);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
          }

          .nav a:hover {
            color: var(--primary-color);
          }

          .btn-primary {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: var(--space-3) var(--space-6);
            border-radius: var(--radius);
            text-decoration: none;
            font-weight: 600;
            transition: all 0.2s;
            display: inline-block;
          }

          .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: var(--shadow-lg);
          }

          /* Hero Section */
          .hero {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: calc(80px + var(--space-16)) 0 var(--space-16);
            text-align: center;
          }

          .hero h1 {
            font-size: 3.5rem;
            font-weight: 700;
            margin-bottom: var(--space-6);
            line-height: 1.2;
          }

          .hero p {
            font-size: 1.25rem;
            margin-bottom: var(--space-8);
            opacity: 0.9;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          }

          .hero-buttons {
            display: flex;
            gap: var(--space-4);
            justify-content: center;
            flex-wrap: wrap;
          }

          .btn-secondary {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: var(--space-3) var(--space-6);
            border-radius: var(--radius);
            text-decoration: none;
            font-weight: 600;
            transition: all 0.2s;
            border: 1px solid rgba(255, 255, 255, 0.3);
          }

          .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-1px);
          }

          /* Features Section */
          .features {
            padding: var(--space-16) 0;
            background: var(--background-secondary);
          }

          .section-title {
            text-align: center;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: var(--space-6);
            color: var(--text-primary);
          }

          .section-subtitle {
            text-align: center;
            font-size: 1.125rem;
            color: var(--text-secondary);
            margin-bottom: var(--space-12);
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          }

          .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: var(--space-8);
            margin-top: var(--space-12);
          }

          .feature-card {
            background: white;
            padding: var(--space-8);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow);
            transition: all 0.2s;
          }

          .feature-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
          }

          .feature-icon {
            font-size: 3rem;
            margin-bottom: var(--space-4);
          }

          .feature-card h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: var(--space-3);
            color: var(--text-primary);
          }

          .feature-card p {
            color: var(--text-secondary);
            line-height: 1.6;
          }

          /* CTA Section */
          .cta-section {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: var(--space-16) 0;
            text-align: center;
          }

          .cta-section h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: var(--space-4);
          }

          .cta-section p {
            font-size: 1.125rem;
            margin-bottom: var(--space-8);
            opacity: 0.9;
          }

          /* Footer */
          .footer {
            background: var(--text-primary);
            color: white;
            padding: var(--space-8) 0;
            text-align: center;
          }

          /* Responsive */
          @media (max-width: 768px) {
            .hero h1 {
              font-size: 2.5rem;
            }
            
            .hero-buttons {
              flex-direction: column;
              align-items: center;
            }
            
            .nav {
              display: none;
            }
            
            .features-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </head>
      <body>
        {/* Header */}
        <header className="header">
          <div className="container">
            <div className="header-content">
              <a href="/" className="logo">
                🚗 DealershipAI
              </a>
              <nav className="nav">
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#contact">Contact</a>
                <a href="/dashboard" className="btn-primary">
                  Get Started
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <h1>Transform Your Dealership with AI-Powered Analytics</h1>
            <p>
              Get comprehensive insights into your dealership's online presence, 
              customer engagement, and competitive positioning with our advanced AI platform.
            </p>
            <div className="hero-buttons">
              <a href="/dashboard" className="btn-primary">
                🚀 Start Your Free Analysis
              </a>
              <a href="#features" className="btn-secondary">
                Learn More
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features">
          <div className="container">
            <h2 className="section-title">Powerful Features for Modern Dealerships</h2>
            <p className="section-subtitle">
              Everything you need to understand and improve your dealership's digital performance
            </p>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3>SEO Analytics</h3>
                <p>Track your search engine rankings, organic traffic, and keyword performance with detailed insights and recommendations.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🤖</div>
                <h3>AI Engine Optimization</h3>
                <p>Monitor your presence across AI platforms like ChatGPT, Claude, and Gemini to ensure maximum visibility.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📍</div>
                <h3>Geographic Analytics</h3>
                <p>Understand your local market performance and optimize for location-based searches and customer acquisition.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Competitive Intelligence</h3>
                <p>Compare your performance against competitors and identify opportunities to gain market share.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">💬</div>
                <h3>Customer Sentiment</h3>
                <p>Analyze customer reviews, social media mentions, and feedback to understand your brand perception.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📈</div>
                <h3>Revenue Insights</h3>
                <p>Transform raw data into actionable business insights that drive revenue growth.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <h2>Ready to Transform Your Dealership?</h2>
            <p>Join hundreds of dealerships already using DealershipAI to boost their online presence and drive more sales.</p>
            <a href="#contact-form" className="btn-primary">
              🚀 Start Your Free Analysis
            </a>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact-form" className="features" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div className="container">
            <h2 className="section-title">Get Your Free AI Analysis</h2>
            <p className="section-subtitle">
              Tell us about your dealership and we'll provide a personalized analysis of your online presence
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <FormSection />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <p>&copy; 2024 DealershipAI. All rights reserved.</p>
          </div>
        </footer>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Smooth scrolling for anchor links
              document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                  e.preventDefault();
                  const target = document.querySelector(this.getAttribute('href'));
                  if (target) {
                    target.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }
                });
              });

              // Track CTA clicks
              document.querySelectorAll('.btn-primary, .cta-button').forEach(button => {
                button.addEventListener('click', function() {
                  if (window.va) {
                    window.va('track', 'cta_click', {
                      button_text: this.textContent.trim(),
                      button_location: this.closest('section')?.className || 'header',
                      timestamp: new Date().toISOString()
                    });
                  }
                });
              });

              // Track page view
              if (window.va) {
                window.va('track', 'page_view', {
                  page: 'marketing_landing',
                  timestamp: new Date().toISOString()
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}