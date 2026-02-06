"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Upload, CheckCircle, Clock, AlertCircle, RefreshCw, Truck, TruckIcon } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"

type Commission = {
  id: number;
  agentId: number;
  agent: {
    id: number;
    name: string;
    email: string;
  };
  orderId: number;
  amount: number;
  status: string;
  requestedAt: string;
  approvedAt: string | null;
  paidAt: string | null;
  notes: string | null;
  receiptPath: string | null;
  receiptUploadedAt: string | null;
  receiptViewedByAgent: boolean;
  deliveredToAgent: boolean;
  deliveredAt: string | null;
  [key: string]: any; // Allow additional properties
}

interface CommissionReceiptSectionProps {
  commission: Commission;
  onCommissionUpdate: (updatedCommission: Commission) => void;
}

export function CommissionReceiptSection({ commission, onCommissionUpdate }: CommissionReceiptSectionProps) {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "خطأ",
          description: "نوع الملف غير مدعوم. يرجى رفع ملف PDF أو صورة (JPG, PNG)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast({
          title: "خطأ",
          description: "حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUploadReceipt = async () => {
    if (!selectedFile) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف أولاً",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Use agent endpoint if user is an agent, otherwise use admin endpoint
      const endpoint = session?.user?.role === 'agent' 
        ? `/api/agent/commissions/${commission.id}/upload-receipt`
        : `/api/admin/commissions/${commission.id}/upload-receipt`;

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        onCommissionUpdate(data.commission);
        setIsUploadDialogOpen(false);
        setSelectedFile(null);
        toast({
          title: "نجح",
          description: "تم رفع إيصال العمولة بنجاح",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "خطأ",
          description: errorData.error || "حدث خطأ أثناء رفع الإيصال",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء رفع الإيصال",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleMarkDelivered = async (delivered: boolean) => {
    try {
      const response = await fetch(`/api/admin/commissions/${commission.id}/mark-delivered`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivered })
      });

      if (response.ok) {
        const data = await response.json();
        onCommissionUpdate(data.commission);
        toast({
          title: "نجح",
          description: delivered ? "تم تسجيل تسليم العمولة للوكيل" : "تم إلغاء تسجيل تسليم العمولة",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "خطأ",
          description: errorData.error || "حدث خطأ أثناء تحديث حالة التسليم",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة التسليم",
        variant: "destructive",
      });
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "قيد الانتظار";
      case "approved": return "موافق عليه";
      case "paid": return "مدفوع";
      case "rejected": return "مرفوض";
      default: return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return "bg-green-100 text-green-800"
      case 'approved':
        return "bg-blue-100 text-blue-800"
      case 'pending':
        return "bg-yellow-100 text-yellow-800"
      case 'rejected':
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Commission Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-800">حالة العمولة:</span>
          <Badge className={getStatusBadgeClass(commission.status)}>
            {getStatusText(commission.status)}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-800">المبلغ:</span>
          <span className="text-sm font-bold text-blue-900">${commission.amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Receipt Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">إيصال العمولة</h4>
          {!commission.receiptPath && (session?.user?.role === 'admin' || (session?.user?.role === 'agent' && (commission.status === 'approved' || commission.status === 'paid'))) && (
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 ml-1" />
                  رفع إيصال
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>رفع إيصال العمولة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="receipt-file">اختر ملف الإيصال</Label>
                    <Input
                      id="receipt-file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      الملفات المدعومة: PDF, JPG, PNG (حد أقصى 5 ميجابايت)
                    </p>
                  </div>
                  
                  {selectedFile && (
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-700">
                        <strong>الملف المختار:</strong> {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        الحجم: {(selectedFile.size / 1024 / 1024).toFixed(2)} ميجابايت
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsUploadDialogOpen(false);
                        setSelectedFile(null);
                      }}
                    >
                      إلغاء
                    </Button>
                    <Button 
                      onClick={handleUploadReceipt}
                      disabled={!selectedFile || uploading}
                    >
                      {uploading ? "جاري الرفع..." : "رفع الإيصال"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {commission.receiptPath ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">تم رفع الإيصال</span>
            </div>
            
            <div className="space-y-2 text-sm text-green-700">
              <div>
                <strong>تاريخ الرفع:</strong> {commission.receiptUploadedAt ? new Date(commission.receiptUploadedAt).toLocaleDateString('ar-SA') : 'غير محدد'}
              </div>
              <div className="flex items-center gap-2">
                <strong>مشاهدة الوكيل:</strong>
                <Badge className={commission.receiptViewedByAgent ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}>
                  {commission.receiptViewedByAgent ? "تمت المشاهدة" : "لم يتم المشاهدة"}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`/api/files/${commission.receiptPath!}`, '_blank')}
              >
                <Eye className="w-4 h-4 ml-1" />
                عرض الإيصال
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">لم يتم رفع إيصال بعد</span>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Status Section - Only show for admins */}
      {session?.user?.role === 'admin' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">حالة التسليم</h4>
            <div className="flex gap-2">
              {!commission.deliveredToAgent ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleMarkDelivered(true)}
                >
                  <Truck className="w-4 h-4 ml-1" />
                  تسجيل التسليم
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleMarkDelivered(false)}
                >
                  <RefreshCw className="w-4 h-4 ml-1" />
                  إلغاء التسليم
                </Button>
              )}
            </div>
          </div>

          {commission.deliveredToAgent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">تم التسليم للوكيل</span>
              </div>
              
              <div className="text-sm text-green-700">
                <strong>تاريخ التسليم:</strong> {commission.deliveredAt ? new Date(commission.deliveredAt).toLocaleDateString('ar-SA') : 'غير محدد'}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">لم يتم التسليم بعد</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
