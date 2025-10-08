import { NextRequest, NextResponse } from 'next/server'
import { emailService, LeadEmailData } from '@/lib/email/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type and data are required' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'lead-notification':
        result = await emailService.sendLeadNotification(data as LeadEmailData)
        break
      
      case 'welcome-email':
        result = await emailService.sendWelcomeEmail(data as LeadEmailData)
        break
      
      case 'follow-up':
        const { followUpType } = body
        if (!followUpType || !['day1', 'day3', 'day7'].includes(followUpType)) {
          return NextResponse.json(
            { error: 'Valid followUpType (day1, day3, day7) is required' },
            { status: 400 }
          )
        }
        result = await emailService.sendFollowUpEmail(data as LeadEmailData, followUpType)
        break
      
      case 'test':
        const { to } = body
        if (!to) {
          return NextResponse.json(
            { error: 'Email address is required for test emails' },
            { status: 400 }
          )
        }
        result = await emailService.sendTestEmail(to)
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid email type. Valid types: lead-notification, welcome-email, follow-up, test' },
          { status: 400 }
        )
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully'
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

