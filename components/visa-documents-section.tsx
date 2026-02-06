"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, CheckCircle, Clock, AlertCircle, RefreshCw, FileText } from "lucide-react"
import { toast } from "@/hooks/use-toast"

type VisaDocumentsData = {
  submissionId: number;
  submissionStatus: string;
  canUploadVisaDocuments: boolean;
  hasUploadedVisaDocuments: boolean;
  visaDocumentsPaths: string[] | null;
  uploadedAt: string | null;
  viewedByAdmin: boolean;
}

interface VisaDocumentsSectionProps {
  submissionId: number;
}

export function VisaDocumentsSection({ submissionId }: VisaDocumentsSectionProps) {
  const [visaData, setVisaData] = useState<VisaDocumentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVisaData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/visa-documents/${submissionId}`);
      
      if (response.ok) {
        const data = await response.json();
        setVisaData(data);
      } else if (response.status === 404) {
        setVisaData(null);
        setError("لا توجد معلومات مستندات التأشيرة لهذا الطلب");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "حدث خطأ أثناء جلب معلومات مستندات التأشيرة");
      }
    } catch (err: any) {
      console.error('Error fetching visa documents data:', err);
      setError("حدث خطأ أثناء جلب معلومات مستندات التأشيرة");
    } finally {
      setLoading(false);
    }
  };

  const markAsViewed = async () => {
    try {
      const response = await fetch(`/api/admin/visa-documents/${submissionId}/mark-viewed`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setVisaData(prev => prev ? { ...prev, viewedByAdmin: true } : null);
        toast({
          title: "نجح",
          description: "تم تسجيل مراجعة مستندات التأشيرة",
        });
      }
    } catch (error) {
      console.error('Error marking visa documents as viewed:', error);
    }
  };

  const resetVisaUpload = async () => {
    try {
      const response = await fetch(`/api/admin/visa-documents/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId })
      });
      
      if (response.ok) {
        await fetchVisaData(); // Refresh data
        toast({
          title: "نجح",
          description: "تم إعادة تعيين مستندات التأشيرة بنجاح",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "خطأ",
          description: errorData.error || "حدث خطأ أثناء إعادة التعيين",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error resetting visa upload:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إعادة التعيين",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchVisaData();
  }, [submissionId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600 mt-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        <span className="text-sm">جاري تحميل معلومات مستندات التأشيرة...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">{error}</span>
        </div>
      </div>
    );
  }

  if (!visaData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">لا توجد معلومات مستندات التأشيرة</span>
        </div>
      </div>
    );
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "submitted": return "تم التقديم";
      case "approved_by_admin": return "موافقة الإدارة";
      case "sent_to_university": return "مرسل للجامعة";
      case "accepted_by_university": return "مقبول من الجامعة";
      case "rejected_by_university": return "رفض الجامعة";
      case "submitted_visa_info": return "تقديم معلومات التأشيرة";
      case "submitted_payment": return "تقديم الدفع";
      case "completed": return "مكتمل";
      default: return status;
    }
  };

  return (
    <div className="mt-2 space-y-3">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-purple-800">حالة الطلب:</span>
          <Badge className="bg-purple-100 text-purple-800">
            {getStatusText(visaData.submissionStatus)}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-purple-800">يمكن رفع مستندات التأشيرة:</span>
          <Badge className={visaData.canUploadVisaDocuments ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
            {visaData.canUploadVisaDocuments ? "نعم" : "لا"}
          </Badge>
        </div>
      </div>

      {visaData.hasUploadedVisaDocuments ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">تم رفع مستندات التأشيرة</span>
          </div>
          
          <div className="space-y-2 text-sm text-green-700">
            <div>
              <strong>تاريخ الرفع:</strong> {visaData.uploadedAt ? new Date(visaData.uploadedAt).toLocaleDateString('ar-SA') : 'غير محدد'}
            </div>
            <div className="flex items-center gap-2">
              <strong>حالة المراجعة:</strong>
              <Badge className={visaData.viewedByAdmin ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}>
                {visaData.viewedByAdmin ? "تمت المراجعة" : "في انتظار المراجعة"}
              </Badge>
            </div>
          </div>
          
          {/* Display uploaded visa documents */}
          {visaData.visaDocumentsPaths && visaData.visaDocumentsPaths.length > 0 && (
            <div className="mt-3">
              <strong className="text-sm text-green-800">المستندات المرفوعة:</strong>
              <div className="mt-2 space-y-2">
                {visaData.visaDocumentsPaths.map((path, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm">مستند التأشيرة {index + 1}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`/api/files/${path}`, '_blank')}
                    >
                      <Eye className="w-4 h-4 ml-1" />
                      عرض
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2 mt-3">
            {!visaData.viewedByAdmin && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={markAsViewed}
              >
                <CheckCircle className="w-4 h-4 ml-1" />
                تسجيل المراجعة
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetVisaUpload}
            >
              <RefreshCw className="w-4 h-4 ml-1" />
              إعادة تعيين
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">لم يتم رفع مستندات التأشيرة بعد</span>
          </div>
          
          {visaData.submissionStatus === 'accepted_by_university' && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                الطالب يمكنه الآن رفع مستندات التأشيرة من لوحة التحكم الخاصة به
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
