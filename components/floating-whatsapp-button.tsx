"use client"

import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'

interface WhatsAppSettings {
  phoneNumber: string
  displayText: string
  isEnabled: boolean
  position: string
  welcomeMessage: string
}

export default function FloatingWhatsAppButton() {
  const [settings, setSettings] = useState<WhatsAppSettings | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/whatsapp-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        setIsVisible(data.isEnabled && data.phoneNumber)
      }
    } catch (error) {
      console.error('Error fetching WhatsApp settings:', error)
    }
  }

  const handleClick = () => {
    if (!settings?.phoneNumber) return

    // Create WhatsApp URL with pre-filled message
    const message = encodeURIComponent(settings.welcomeMessage || 'مرحباً! كيف يمكنني مساعدتك؟')
    const whatsappUrl = `https://wa.me/${settings.phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank')
  }

  if (!isVisible || !settings) {
    return null
  }

  const getPositionClasses = () => {
    switch (settings.position) {
      case 'bottom-left':
        return 'bottom-6 left-6'
      case 'top-right':
        return 'top-6 right-6'
      case 'top-left':
        return 'top-6 left-6'
      case 'bottom-right':
      default:
        return 'bottom-6 right-6'
    }
  }

  return (
    <div
      className={`fixed ${getPositionClasses()} z-50 group`}
      style={{ direction: 'ltr' }} // Ensure consistent positioning regardless of RTL
    >
      <button
        onClick={handleClick}
        className="w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-300"
        title={settings.displayText}
        aria-label={settings.displayText}
      >
        <MessageCircle className="w-8 h-8 text-white" />
      </button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
          {settings.displayText}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>

      {/* Pulse animation */}
      <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></div>
    </div>
  )
}