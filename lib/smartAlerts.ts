// lib/smartAlerts.ts

export const SMART_ALERTS = {
  types: {
    urgent: {
      trigger: 'Competitor gains 10+ points in 24h',
      channels: ['SMS', 'Email', 'Push', 'Dashboard'],
      auto_create_response_plan: true
    },
    opportunity: {
      trigger: 'Competitor drops 5+ points',
      message: 'Naples Toyota lost 7 points - opportunity to close gap!',
      suggested_action: 'Deploy content strategy now'
    },
    milestone: {
      trigger: 'You overtake a competitor',
      message: 'Congrats! You just passed Sutherland Honda!',
      auto_share: true
    },
    maintenance: {
      trigger: 'Website down or 404 errors spike',
      priority: 'critical',
      escalation: true
    }
  }
} as const;

