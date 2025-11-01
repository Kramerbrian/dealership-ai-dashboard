import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  userName?: string;
  dealershipName?: string;
  trustScore?: number;
  topIssue?: string;
  topIssueImpact?: number;
}

export const WelcomeEmail = ({
  userName = 'there',
  dealershipName = 'Your Dealership',
  trustScore = 72,
  topIssue = 'Missing schema markup',
  topIssueImpact = 12500,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Your Trust Score: {trustScore} - Here's what it means</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Img
            src="https://dealershipai.com/logo.png"
            width="40"
            height="40"
            alt="DealershipAI"
          />
          <Text style={headerText}>DealershipAI</Text>
        </Section>

        {/* Hero */}
        <Heading style={h1}>Welcome, {userName}!</Heading>
        
        <Text style={paragraph}>
          Your Trust Score analysis is complete. Here's what we found:
        </Text>

        {/* Trust Score Display */}
        <Section style={scoreCard}>
          <Text style={scoreNumber}>{trustScore}</Text>
          <Text style={scoreLabel}>Trust Score (0-100)</Text>
        </Section>

        {/* What Your Score Means */}
        <Section style={section}>
          <Heading style={h2}>What Your Score Means</Heading>
          <Text style={paragraph}>
            Your Trust Score of <strong>{trustScore}</strong> indicates your dealership's 
            visibility across AI-powered search engines like ChatGPT, Claude, Perplexity, 
            and Gemini.
          </Text>
          <Text style={paragraph}>
            Scores above 80 are excellent, 60-80 are good, and below 60 need improvement.
          </Text>
        </Section>

        {/* Top Issue */}
        <Section style={issueCard}>
          <Heading style={h3}>🚨 Your #1 Issue</Heading>
          <Text style={issueTitle}>{topIssue}</Text>
          <Text style={issueImpact}>
            Estimated impact: ${(topIssueImpact / 1000).toFixed(0)}k/month in missed leads
          </Text>
          <Button style={button} href="https://dealershipai.com/dashboard">
            See How to Fix →
          </Button>
        </Section>

        {/* Quick Wins */}
        <Section style={section}>
          <Heading style={h2}>⚡ Quick Wins Available</Heading>
          <Text style={paragraph}>
            We've identified 3 fixes under 1 hour that could boost your score to {trustScore + 6}:
          </Text>
          <ul style={list}>
            <li>Add schema markup to VDPs (+8-12 points)</li>
            <li>Improve page load speed (+5-8 points)</li>
            <li>Respond to recent reviews (+3-5 points)</li>
          </ul>
        </Section>

        {/* How to Use Dashboard */}
        <Section style={section}>
          <Heading style={h2}>How to Use the Dashboard</Heading>
          <Text style={paragraph}>
            1. <strong>Track Changes:</strong> Your Trust Score updates automatically 3x daily
          </Text>
          <Text style={paragraph}>
            2. <strong>Ask the Agent:</strong> Use the PIQR terminal at the bottom to ask questions
          </Text>
          <Text style={paragraph}>
            3. <strong>Explore Pillars:</strong> Click on SEO, AEO, GEO, or QAI cards for details
          </Text>
          <Text style={paragraph}>
            4. <strong>View Competitors:</strong> Check the Mystery Shop tab for competitive insights
          </Text>
        </Section>

        {/* CTA */}
        <Section style={ctaSection}>
          <Button style={button} href="https://dealershipai.com/dashboard">
            View Full Dashboard →
          </Button>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            DealershipAI - The Bloomberg Terminal for Automotive AI Visibility
          </Text>
          <Text style={footerLink}>
            <Link href="https://dealershipai.com/dashboard/settings/notifications" style={link}>
              Manage Email Preferences
            </Link>
            {' • '}
            <Link href="https://dealershipai.com/legal/privacy" style={link}>
              Privacy Policy
            </Link>
          </Text>
          <Text style={footerAddress}>
            DealershipAI, Inc.
            <br />
            123 Main St, Suite 100
            <br />
            San Francisco, CA 94105
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

const main = {
  backgroundColor: '#0a0a0a',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#18181b',
  margin: '0 auto',
  padding: '40px',
  maxWidth: '600px',
};

const header = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '32px',
};

const headerText = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#ffffff',
};

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const h2 = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: '600',
  margin: '24px 0 12px',
};

const h3 = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const paragraph = {
  color: '#a1a1aa',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const scoreCard = {
  backgroundColor: '#27272a',
  borderRadius: '12px',
  padding: '32px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const scoreNumber = {
  color: '#8b5cf6',
  fontSize: '64px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  lineHeight: '1',
};

const scoreLabel = {
  color: '#a1a1aa',
  fontSize: '14px',
  margin: '0',
};

const section = {
  margin: '24px 0',
};

const issueCard = {
  backgroundColor: '#7f1d1d',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
};

const issueTitle = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const issueImpact = {
  color: '#fca5a5',
  fontSize: '16px',
  margin: '0 0 16px',
};

const list = {
  color: '#a1a1aa',
  fontSize: '16px',
  lineHeight: '24px',
  paddingLeft: '24px',
  margin: '0 0 16px',
};

const button = {
  backgroundColor: '#8b5cf6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '16px 0',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const footer = {
  borderTop: '1px solid #27272a',
  marginTop: '32px',
  paddingTop: '24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#71717a',
  fontSize: '14px',
  margin: '0 0 8px',
};

const footerLink = {
  color: '#71717a',
  fontSize: '12px',
  margin: '0 0 16px',
};

const footerAddress = {
  color: '#71717a',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0',
};

const link = {
  color: '#8b5cf6',
  textDecoration: 'underline',
};
