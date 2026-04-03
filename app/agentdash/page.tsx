"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  UserPlus,
  FileText,
  Settings,
  Bell,
  ChevronDown,
  Download,
  Plus,
  AlertCircle,
  Clock,
  DollarSign,
  TrendingUp,
  RefreshCw,
} from "lucide-react"

import { useEffect, useState } from "react";
import { ProgressTracker } from "@/components/progress-tracker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";

type Submission = {
  id: number;
  fullName: string;
  submittedAt: string;
  orderStage: string;
  submissionStatus: string;
  uploadedFiles: any[];
  orders: any[];
  user?: {
    id: number;
    fullName: string;
    email: string;
  };
};

type AgentNote = {
  id: number
  content: string
  priority: string
  sentAt: string
  isRead: boolean
  template?: {
    title: string
  }
  sender: {
    fullName: string
  }
}

// Admin Notes Section Component
function AdminNotesSection() {
  const [notes, setNotes] = useState<AgentNote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/agent/notes')
      if (response.ok) {
        const data = await response.json()
        // Get only the first 3 unread notes for dashboard display
        const unreadNotes = (data.notes || []).filter((note: AgentNote) => !note.isRead).slice(0, 3)
        setNotes(unreadNotes)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'high': return <AlertCircle className="w-5 h-5 text-orange-600" />
      default: return <AlertCircle className="w-5 h-5 text-blue-600" />
    }
  }

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50'
      case 'high': return 'bg-orange-50'
      default: return 'bg-blue-50'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          ملاحظات من الأدمن
        </CardTitle>
        {notes.length > 0 && (
          <Link href="/agentdash/notifications">
            <Button variant="outline" size="sm">
              عرض الكل
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="p-4 text-center text-gray-500">جاري التحميل...</div>
        ) : notes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">لا توجد ملاحظات جديدة</div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className={`flex items-center gap-3 p-3 rounded-lg ${getPriorityBg(note.priority)}`}>
              {getPriorityIcon(note.priority)}
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {note.template ? note.template.title : 'ملاحظة من الإدارة'}
                </div>
                <div className="text-sm text-gray-600 line-clamp-2">
                  {note.content}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  من: {note.sender.fullName} • {new Date(note.sentAt).toLocaleDateString('ar-SA')}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default function AgentDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Submission | null>(null);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  useEffect(() => {
    async function fetchSubmissions() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/agent/submissions");
        if (!res.ok) throw new Error("فشل في جلب بيانات الطلاب");
        const data = await res.json();
        setSubmissions(data.submissions || []);
      } catch (err: any) {
        setError(err.message || "حدث خطأ");
      } finally {
        setLoading(false);
      }
    }
    fetchSubmissions();
  }, []);

  return (
    <div className="p-6 space-y-6" dir="rtl">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#111827]">لوحة وكيل المبيعات</h1>
            <p className="text-[#4b5563] mt-1">مرحباً بك في لوحة التحكم الخاصة بك</p>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
        </div>


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#4b5563]">الطلاب المسجلون</p>
                  <p className="text-2xl font-bold text-[#111827]">{submissions.length}</p>
                </div>
                <Users className="w-8 h-8 text-[#4b5563]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#4b5563]">الطلبات النشطة</p>
                  <p className="text-2xl font-bold text-[#f59e0b]">
                    {submissions.filter(s => s.submissionStatus !== "completed").length}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-[#f59e0b]" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#4b5563]">الإيرادات</p>
                  <p className="text-2xl font-bold text-[#10b981]">$0.00</p>
                </div>
                <DollarSign className="w-8 h-8 text-[#10b981]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Registration Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              الطلاب المسجلين عبرك
            </CardTitle>
            {/* <Button className="bg-[#1f2937] hover:bg-[#374151]">إضافة طالب جديد</Button> */}
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input placeholder="البحث عن الطلاب أو رقم الطلب..." className="max-w-md" />
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 text-center text-gray-500">جاري التحميل...</div>
              ) : error ? (
                <div className="p-6 text-center text-red-600">{error}</div>
              ) : submissions.length === 0 ? (
                <div className="p-6 text-center text-gray-500">لا يوجد طلاب مسجلين بعد.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-3 font-medium">الصورة</th>
                      <th className="text-right p-3 font-medium">اسم الطالب</th>
                      <th className="text-right p-3 font-medium">حالة التقدم</th>
                      <th className="text-right p-3 font-medium">تاريخ التسجيل</th>
                      <th className="text-right p-3 font-medium">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission) => (
                      <tr className="border-b" key={submission.id}>
                        <td className="p-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        </td>
                        <td className="p-3">{submission.fullName}</td>
                        <td className="p-3 min-w-[200px]">
                          <ProgressTracker 
                            submissionStatus={submission.submissionStatus || "submitted"} 
                            compact={true} 
                          />
                        </td>
                        <td className="p-3">{new Date(submission.submittedAt).toLocaleDateString('ar-SA')}</td>
                        <td className="p-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedStudent(submission);
                              setIsProgressModalOpen(true);
                            }}
                          >
                            عرض التقدم
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Notes */}
        <AdminNotesSection />


        {/* Student Progress Modal */}
        <Dialog open={isProgressModalOpen} onOpenChange={setIsProgressModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                تقدم الطالب: {selectedStudent?.fullName}
              </DialogTitle>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-6 p-4">
                {/* Student Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">معلومات الطالب</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">الاسم الكامل</p>
                        <p className="font-medium">{selectedStudent.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">تاريخ التسجيل</p>
                        <p className="font-medium">{new Date(selectedStudent.submittedAt).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">عدد الملفات المرفوعة</p>
                        <p className="font-medium">{selectedStudent.uploadedFiles?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">عدد الطلبات</p>
                        <p className="font-medium">{selectedStudent.orders?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Tracking */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">تتبع التقدم</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgressTracker 
                      submissionStatus={selectedStudent.submissionStatus || "submitted"} 
                      showFullProgress={true} 
                    />
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsProgressModalOpen(false)}
                  >
                    إغلاق
                  </Button>
                  <Button 
                    onClick={() => {
                      // Refresh data for this specific student
                      window.location.reload();
                    }}
                    className="bg-[#1f2937] hover:bg-[#374151]"
                  >
                    <RefreshCw className="w-4 h-4 ml-2" />
                    تحديث البيانات
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
    </div>
  )
}
