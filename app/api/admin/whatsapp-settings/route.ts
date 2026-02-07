import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get WhatsApp settings (there should only be one record)
    let settings = await prisma.whatsAppSettings.findFirst()
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.whatsAppSettings.create({
        data: {
          phoneNumber: '',
          displayText: 'تواصل معنا عبر واتساب',
          isEnabled: false,
          position: 'bottom-right',
          welcomeMessage: 'مرحباً! كيف يمكنني مساعدتك؟'
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching WhatsApp settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch WhatsApp settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { phoneNumber, displayText, isEnabled, position, welcomeMessage } = body

    // Validate required fields
    if (!phoneNumber && isEnabled) {
      return NextResponse.json(
        { error: 'Phone number is required when WhatsApp is enabled' },
        { status: 400 }
      )
    }

    // Validate phone number format (basic validation)
    if (phoneNumber && !phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please use international format (e.g., +966501234567)' },
        { status: 400 }
      )
    }

    // Check if settings exist
    const existingSettings = await prisma.whatsAppSettings.findFirst()

    let settings
    if (existingSettings) {
      // Update existing settings
      settings = await prisma.whatsAppSettings.update({
        where: { id: existingSettings.id },
        data: {
          phoneNumber: phoneNumber || '',
          displayText: displayText || 'تواصل معنا عبر واتساب',
          isEnabled: Boolean(isEnabled),
          position: position || 'bottom-right',
          welcomeMessage: welcomeMessage || 'مرحباً! كيف يمكنني مساعدتك؟'
        }
      })
    } else {
      // Create new settings
      settings = await prisma.whatsAppSettings.create({
        data: {
          phoneNumber: phoneNumber || '',
          displayText: displayText || 'تواصل معنا عبر واتساب',
          isEnabled: Boolean(isEnabled),
          position: position || 'bottom-right',
          welcomeMessage: welcomeMessage || 'مرحباً! كيف يمكنني مساعدتك؟'
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating WhatsApp settings:', error)
    return NextResponse.json(
      { error: 'Failed to update WhatsApp settings' },
      { status: 500 }
    )
  }
}