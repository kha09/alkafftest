"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Home, FileText, BarChart3, Users, Bell, FileEdit, University, Building, BookOpen, DollarSign, Mail, Send, Settings, LogOut, User, MessageSquare, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

const navigation = [
  { name: "لوحة التحكم", href: "/dashboard", icon: Home },
  // { name: "التقارير والمعلومات", href: "/dashboard/reports", icon: BarChart3 },
  { name: "الوكلاء", href: "/dashboard/agents", icon: Users },
  { name: "الطلاب", href: "/dashboard/students", icon: Users },
  { name: "إدارة المحتوى", href: "/dashboard/content", icon: FileEdit },
  { name: "الجامعات", href: "/dashboard/universities", icon: University },
  { name: "الأقسام", href: "/dashboard/departments", icon: Building },
  { name: "البرامج", href: "/dashboard/programs", icon: BookOpen },
  { name: "عمولات ومدفوعات", href: "/dashboard/commissions", icon: DollarSign },
  { name: "تذاكر الدعم", href: "/dashboard/support", icon: Ticket },
  { name: "الملاحظات", href: "/dashboard/notes", icon: MessageSquare },
  { name: "قوالب البريد الإلكتروني", href: "/dashboard/email-templates", icon: Mail },
  { name: "البريد المرسل", href: "/dashboard/sent-emails", icon: Send },
  { name: "الإشعارات", href: "/dashboard/notifications", icon: Bell },
  { name: "الإعدادات", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchUnreadCount()
    }
  }, [session])

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/admin/notifications?unreadOnly=true')
      if (response.ok) {
        const notifications = await response.json()
        setUnreadCount(notifications.length)
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="w-64 bg-[#374151] text-white p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-white rounded text-[#374151] flex items-center justify-center text-sm font-bold">
          SM
        </div>
        <span className="font-semibold">لوحة تحكم الكاف</span>
      </div>

      <nav className="space-y-2 flex-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                isActive ? "bg-[#4b5563] text-white" : "hover:bg-[#4b5563] cursor-pointer",
              )}
            >
              <item.icon className="w-4 h-4" />
              <span className="flex items-center justify-between flex-1">
                <span>{item.name}</span>
                {item.name === "الإشعارات" && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-[#4b5563] space-y-3">
        {session?.user && (
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4" />
            <div className="flex flex-col">
              <span className="font-medium">{session.user.name}</span>
              <span className="text-xs text-gray-300">{session.user.role === 'admin' ? 'مدير' : session.user.role}</span>
            </div>
          </div>
        )}
        
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-white hover:bg-[#4b5563] hover:text-white"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </Button>
      </div>
    </div>
  )
}
