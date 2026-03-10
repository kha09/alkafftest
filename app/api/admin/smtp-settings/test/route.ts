import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import nodemailer from 'nodemailer'

// POST - Test SMTP connection and send test email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      host, 
      port, 
      username, 
      password, 
      encryption, 
      fromEmail, 
      fromName, 
      testEmail,
      useStoredSettings = false 
    } = body

    let smtpConfig: any = {}

    if (useStoredSettings) {
      // Use stored SMTP settings
      const settings = await db.smtpSettings.findFirst({
        where: { isDefault: true }
      })

      if (!settings) {
        return NextResponse.json(
          { error: 'No SMTP settings found. Please configure SMTP settings first.' },
          { status: 400 }
        )
      }

      if (!settings.isEnabled) {
        return NextResponse.json(
          { error: 'SMTP is disabled. Please enable SMTP in settings.' },
          { status: 400 }
        )
      }

      // Use stored password directly (stored as plain text for nodemailer)
      smtpConfig = {
        host: settings.host,
        port: settings.port,
        username: settings.username,
        password: settings.password,
        encryption: settings.encryption,
        fromEmail: settings.fromEmail,
        fromName: settings.fromName,
        testEmail: testEmail || settings.testEmail
      }
    } else {
      // Use provided settings for testing
      if (!host || !port || !username || !password || !fromEmail) {
        return NextResponse.json(
          { error: 'Host, port, username, password, and from email are required for testing' },
          { status: 400 }
        )
      }

      smtpConfig = {
        host,
        port: parseInt(port),
        username,
        password,
        encryption: encryption || 'tls',
        fromEmail,
        fromName: fromName || 'SM Alkaff',
        testEmail
      }
    }

    if (!smtpConfig.testEmail) {
      return NextResponse.json(
        { error: 'Test email address is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(smtpConfig.testEmail)) {
      return NextResponse.json(
        { error: 'Invalid test email format' },
        { status: 400 }
      )
    }

    // Create transporter with the provided/stored settings
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.encryption === 'ssl', // true for 465, false for other ports
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
      // Add timeout and connection options
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000, // 5 seconds
      socketTimeout: 10000, // 10 seconds
    })

    // Test the connection
    try {
      await transporter.verify()
    } catch (verifyError: any) {
      console.error('SMTP verification failed:', verifyError)
      
      // Update test status in database if using stored settings
      if (useStoredSettings) {
        await db.smtpSettings.updateMany({
          where: { isDefault: true },
          data: {
            lastTested: new Date(),
            testStatus: 'failed',
            testError: verifyError.message || 'Connection verification failed'
          }
        })
      }

      return NextResponse.json(
        { 
          error: 'SMTP connection failed',
          details: verifyError.message || 'Unable to connect to SMTP server',
          success: false
        },
        { status: 400 }
      )
    }

    // Send test email
    const testSubject = 'SMTP Configuration Test - SM Alkaff'
    const testMessage = `
This is a test email to verify your SMTP configuration.

SMTP Settings:
- Host: ${smtpConfig.host}
- Port: ${smtpConfig.port}
- Encryption: ${smtpConfig.encryption.toUpperCase()}
- From: ${smtpConfig.fromName} <${smtpConfig.fromEmail}>

If you received this email, your SMTP configuration is working correctly!

Best regards,
SM Alkaff System
    `.trim()

    try {
      const info = await transporter.sendMail({
        from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
        to: smtpConfig.testEmail,
        subject: testSubject,
        text: testMessage,
        html: testMessage.replace(/\n/g, '<br>')
      })

      console.log('Test email sent successfully:', info.messageId)

      // Update test status in database if using stored settings
      if (useStoredSettings) {
        await db.smtpSettings.updateMany({
          where: { isDefault: true },
          data: {
            lastTested: new Date(),
            testStatus: 'success',
            testError: null
          }
        })
      }

      return NextResponse.json({
        success: true,
        message: 'SMTP test successful! Test email sent.',
        messageId: info.messageId,
        testEmail: smtpConfig.testEmail,
        details: {
          host: smtpConfig.host,
          port: smtpConfig.port,
          encryption: smtpConfig.encryption,
          from: `${smtpConfig.fromName} <${smtpConfig.fromEmail}>`
        }
      })
    } catch (sendError: any) {
      console.error('Test email sending failed:', sendError)

      // Update test status in database if using stored settings
      if (useStoredSettings) {
        await db.smtpSettings.updateMany({
          where: { isDefault: true },
          data: {
            lastTested: new Date(),
            testStatus: 'failed',
            testError: sendError.message || 'Failed to send test email'
          }
        })
      }

      return NextResponse.json(
        { 
          error: 'SMTP connection successful but failed to send test email',
          details: sendError.message || 'Unknown error occurred while sending email',
          success: false
        },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('SMTP test error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to test SMTP settings',
        details: error.message || 'Unknown error occurred',
        success: false
      },
      { status: 500 }
    )
  }
}
