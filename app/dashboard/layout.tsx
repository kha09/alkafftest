import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex" dir="rtl">
      <Sidebar />
      <main className="flex-1">{children}</main>
      <Toaster />
    </div>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
