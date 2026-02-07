import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    // Get WhatsApp settings (only return public fields)
    const settings = await prisma.whatsAppSettings.findFirst({
      select: {
        phoneNumber: true,
        displayText: true,
        isEnabled: true,
        position: true,
        welcomeMessage: true
      }
    })

    // If no settings exist or WhatsApp is disabled, return disabled state
    if (!settings || !settings.isEnabled || !settings.phoneNumber) {
      return NextResponse.json({
        isEnabled: false,
        phoneNumber: '',
        displayText: 'تواصل معنا عبر واتساب',
        position: 'bottom-right',
        welcomeMessage: 'مرحباً! كيف يمكنني مساعدتك؟'
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching WhatsApp settings:', error)
    // Return disabled state on error
    return NextResponse.json({
      isEnabled: false,
      phoneNumber: '',
      displayText: 'تواصل معنا عبر واتساب',
      position: 'bottom-right',
      welcomeMessage: 'مرحباً! كيف يمكنني مساعدتك؟'
    })
  }
}