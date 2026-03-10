import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// GET - Retrieve current SMTP settings
export async function GET() {
  try {
    const settings = await db.smtpSettings.findFirst({
      where: { isDefault: true },
      orderBy: { createdAt: 'desc' }
    })

    if (!settings) {
      // Return default structure if no settings exist
      return NextResponse.json({
        id: null,
        host: '',
        port: 587,
        username: '',
        password: '', // Never return actual password
        encryption: 'tls',
        fromEmail: '',
        fromName: 'SM Alkaff',
        isEnabled: true,
        isDefault: true,
        testEmail: '',
        lastTested: null,
        testStatus: null,
        testError: null
      })
    }

    // Return settings without password
    const { password, ...settingsWithoutPassword } = settings
    return NextResponse.json({
      ...settingsWithoutPassword,
      password: '' // Never return actual password
    })
  } catch (error) {
    console.error('Error fetching SMTP settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SMTP settings' },
      { status: 500 }
    )
  }
}

// POST - Create or update SMTP settings
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
      isEnabled, 
      testEmail 
    } = body

    // Validate required fields
    if (!host || !port || !username || !fromEmail) {
      return NextResponse.json(
        { error: 'Host, port, username, and from email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(fromEmail)) {
      return NextResponse.json(
        { error: 'Invalid from email format' },
        { status: 400 }
      )
    }

    if (testEmail && !emailRegex.test(testEmail)) {
      return NextResponse.json(
        { error: 'Invalid test email format' },
        { status: 400 }
      )
    }

    // Store password as-is (not hashed) - nodemailer needs the raw password
    const rawPassword = password

    // Check if settings already exist
    const existingSettings = await db.smtpSettings.findFirst({
      where: { isDefault: true }
    })

    let settings
    if (existingSettings) {
      // Update existing settings
      const updateData: any = {
        host,
        port: parseInt(port),
        username,
        encryption: encryption || 'tls',
        fromEmail,
        fromName: fromName || 'SM Alkaff',
        isEnabled: isEnabled !== undefined ? isEnabled : true,
        testEmail: testEmail || null,
        updatedAt: new Date()
      }

      // Only update password if a new one is provided
      if (rawPassword && rawPassword.trim() !== '') {
        updateData.password = rawPassword
      }

      settings = await db.smtpSettings.update({
        where: { id: existingSettings.id },
        data: updateData
      })
    } else {
      // Create new settings
      if (!rawPassword || rawPassword.trim() === '') {
        return NextResponse.json(
          { error: 'Password is required for new SMTP configuration' },
          { status: 400 }
        )
      }

      settings = await db.smtpSettings.create({
        data: {
          host,
          port: parseInt(port),
          username,
          password: rawPassword,
          encryption: encryption || 'tls',
          fromEmail,
          fromName: fromName || 'SM Alkaff',
          isEnabled: isEnabled !== undefined ? isEnabled : true,
          isDefault: true,
          testEmail: testEmail || null
        }
      })
    }

    // Return settings without password
    const { password: _, ...settingsWithoutPassword } = settings
    return NextResponse.json({
      ...settingsWithoutPassword,
      message: 'SMTP settings saved successfully'
    })
  } catch (error) {
    console.error('Error saving SMTP settings:', error)
    return NextResponse.json(
      { error: 'Failed to save SMTP settings' },
      { status: 500 }
    )
  }
}
