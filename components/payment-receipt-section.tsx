"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

type PaymentReceiptData = {
  submissionId: number;
  submissionStatus: string;
  canUploadReceipt: boolean;
  hasUploadedReceipt: boolean;
  receiptPath: string | null;
  uploadedAt: string | null;
  viewedByAdmin: boolean;
}

interface PaymentReceiptSectionProps {
  submissionId: number;
}

export function PaymentReceiptSection({ submissionId }: PaymentReceiptSectionProps) {
  const [receiptData, setReceiptData] = useState<PaymentReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReceiptData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/payment-receipt/${submissionId}`);
      
      if (response.ok) {
        const data = await response.json();
        setReceiptData(data);
      } else if (response.status === 404) {
        setReceiptData(null);
        setError("لا توجد معلومات إيصال دفع لهذا الطلب");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "حدث خطأ أثناء جلب معلومات الإيصال");
      }
    } catch (err: any) {
      console.error('Error fetching receipt data:', err);
      setError("حدث خطأ أثناء جلب معلومات الإيصال");
    } finally {
      setLoading(false);
    }
  };

  const markAsViewed = async () => {
    try {
      const response = await fetch(`/api/admin/payment-receipt/${submissionId}/mark-viewed`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setReceiptData(prev => prev ? { ...prev, viewedByAdmin: true } : null);
        toast({
          title: "نجح",
          description: "تم تسجيل مراجعة الإيصال",
        });
      }
    } catch (error) {
      console.error('Error marking receipt as viewed:', error);
    }
  };

  const resetReceiptUpload = async () => {
    try {
      const response = await fetch(`/api/admin/payment-receipt/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId })
      });
      
      if (response.ok) {
        await fetchReceiptData(); // Refresh data
        toast({
          title: "نجح",
          description: "تم إعادة تعيين إيصال الدفع بنجاح",
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
      console.error('Error resetting receipt upload:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إعادة التعيين",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReceiptData();
  }, [submissionId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600 mt-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        <span className="text-sm">جاري تحميل معلومات الإيصال...</span>
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

  if (!receiptData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">لا توجد معلومات إيصال دفع</span>
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-800">حالة الطلب:</span>
          <Badge className="bg-blue-100 text-blue-800">
            {getStatusText(receiptData.submissionStatus)}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-800">يمكن رفع الإيصال:</span>
          <Badge className={receiptData.canUploadReceipt ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
            {receiptData.canUploadReceipt ? "نعم" : "لا"}
          </Badge>
        </div>
      </div>

      {receiptData.hasUploadedReceipt ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">تم رفع إيصال الدفع</span>
          </div>
          
          <div className="space-y-2 text-sm text-green-700">
            <div>
              <strong>تاريخ الرفع:</strong> {receiptData.uploadedAt ? new Date(receiptData.uploadedAt).toLocaleDateString('ar-SA') : 'غير محدد'}
            </div>
            <div className="flex items-center gap-2">
              <strong>حالة المراجعة:</strong>
              <Badge className={receiptData.viewedByAdmin ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}>
                {receiptData.viewedByAdmin ? "تمت المراجعة" : "في انتظار المراجعة"}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2 mt-3">
            {receiptData.receiptPath && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`/api/files/${receiptData.receiptPath!}`, '_blank')}
              >
                <Eye className="w-4 h-4 ml-1" />
                عرض الإيصال
              </Button>
            )}
            
            {!receiptData.viewedByAdmin && (
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
              onClick={resetReceiptUpload}
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
            <span className="text-sm text-gray-600">لم يتم رفع إيصال دفع بعد</span>
          </div>
          
          {receiptData.submissionStatus === 'accepted_by_university' && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                الطالب يمكنه الآن رفع إيصال الدفع من لوحة التحكم الخاصة به
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
