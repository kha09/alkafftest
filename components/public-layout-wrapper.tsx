"use client"

import { usePathname } from 'next/navigation'
import FloatingWhatsAppButton from './floating-whatsapp-button'

interface PublicLayoutWrapperProps {
  children: React.ReactNode
}

export default function PublicLayoutWrapper({ children }: PublicLayoutWrapperProps) {
  const pathname = usePathname()
  
  // Define public pages where WhatsApp button should appear
  const isPublicPage = pathname === '/' || 
                      pathname.startsWith('/universities') || 
                      pathname.startsWith('/programs') ||
                      pathname === '/login'

  // Don't show on dashboard, agent, or student pages
  const isDashboardPage = pathname.startsWith('/dashboard') || 
                         pathname.startsWith('/agentdash') || 
                         pathname.startsWith('/student')

  const shouldShowWhatsApp = isPublicPage && !isDashboardPage

  return (
    <>
      {children}
      {shouldShowWhatsApp && <FloatingWhatsAppButton />}
    </>
  )
}