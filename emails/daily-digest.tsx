import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
  Hr,
} from '@react-email/components';

interface DailyDigestProps {
  dealershipName: string;
  trustScore: number;
  deltaToday: number;
  topIssue: string;
  competitorUpdate?: string;
  recommendedAction: string;
}

export default function DailyDigestEmail({
  dealershipName,
  trustScore,
  deltaToday,
  topIssue,
  competitorUpdate,
  recommendedAction,
}: DailyDigestProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Your Daily Trust Score Update</Heading>
            <Text style={scoreText}>
              {trustScore}/100
              {deltaToday !== 0 && (
                <span style={deltaToday >= 0 ? deltaPositive : deltaNegative}>
                  {' '}({deltaToday >= 0 ? '+' : ''}{deltaToday})
                </span>
              )}
            </Text>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>Hi there,</Text>
            <Text style={paragraph}>
              Here's what changed with <strong>{dealershipName}</strong> today.
            </Text>

            {topIssue && (
              <Section style={issueBox}>
                <Heading as="h2" style={h2}>⚠️ Biggest Detractor</Heading>
                <Text style={paragraph}>{topIssue}</Text>
              </Section>
            )}

            {competitorUpdate && (
              <Section style={updateBox}>
                <Heading as="h2" style={h2}>📊 Market Movement</Heading>
                <Text style={paragraph}>{competitorUpdate}</Text>
              </Section>
            )}

            <Section style={actionBox}>
              <Heading as="h2" style={h2}>💡 Recommended Action</Heading>
              <Text style={paragraph}>{recommendedAction}</Text>
            </Section>

            <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}>
              View Dashboard →
            </Button>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              <a href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/notifications`}>
                Update email preferences
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#0a0a0a',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: '#1a1a1a',
  margin: '0 auto',
  padding: '20px',
  maxWidth: '600px',
};

const header = {
  textAlign: 'center' as const,
  padding: '24px 0',
};

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const scoreText = {
  color: '#8b5cf6',
  fontSize: '36px',
  fontWeight: 'bold',
  margin: '0',
};

const deltaPositive = {
  color: '#10b981',
};

const deltaNegative = {
  color: '#ef4444',
};

const content = {
  padding: '24px',
};

const paragraph = {
  color: '#e5e5e5',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const issueBox = {
  backgroundColor: '#ef4444',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const updateBox = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const actionBox = {
  backgroundColor: '#10b981',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const h2 = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const button = {
  backgroundColor: '#8b5cf6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '16px 32px',
  margin: '24px auto',
  width: 'fit-content',
};

const hr = {
  borderColor: '#333333',
  margin: '32px 0',
};

const footer = {
  textAlign: 'center' as const,
  padding: '24px 0',
};

const footerText = {
  color: '#666666',
  fontSize: '12px',
};

const a = {
  color: '#8b5cf6',
  textDecoration: 'underline',
};

