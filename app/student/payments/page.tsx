"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Upload, CheckCircle, Clock, AlertCircle, Eye, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

type PaymentReceiptStatus = {
  submissionId: number;
  submissionStatus: string;
  canUploadReceipt: boolean;
  hasUploadedReceipt: boolean;
  receiptPath: string | null;
  uploadedAt: string | null;
  viewedByAdmin: boolean;
};

type VisaDocumentsStatus = {
  submissionId: number;
  submissionStatus: string;
  canUploadVisaDocuments: boolean;
  hasUploadedVisaDocuments: boolean;
  visaDocumentsPaths: string[];
  uploadedAt: string | null;
  viewedByAdmin: boolean;
};

export default function StudentPayments() {
  const [receiptStatus, setReceiptStatus] = useState<PaymentReceiptStatus | null>(null);
  const [visaStatus, setVisaStatus] = useState<VisaDocumentsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [visaLoading, setVisaLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visaError, setVisaError] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [uploadingVisa, setUploadingVisa] = useState(false);
  const [noSubmission, setNoSubmission] = useState(false);
  const [noVisaSubmission, setNoVisaSubmission] = useState(false);

  useEffect(() => {
    fetchReceiptStatus();
    fetchVisaStatus();
  }, []);

  const fetchReceiptStatus = async () => {
    setLoading(true);
    setError(null);
    setNoSubmission(false);
    
    try {
      const receiptRes = await fetch("/api/student/payment-receipt");
      const receiptData = await receiptRes.json();
      
      if (receiptRes.ok) {
        setReceiptStatus(receiptData);
        console.log('Receipt status:', receiptData);
      } else {
        console.log('Receipt API error:', receiptRes.status, receiptRes.statusText);
        if (receiptData.noSubmission) {
          setNoSubmission(true);
        }
        setError(receiptData.error || "حدث خطأ أثناء جلب معلومات إيصال الدفع");
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const fetchVisaStatus = async () => {
    setVisaLoading(true);
    setVisaError(null);
    setNoVisaSubmission(false);
    
    try {
      const visaRes = await fetch("/api/student/visa-documents");
      const visaData = await visaRes.json();
      
      if (visaRes.ok) {
        setVisaStatus(visaData);
        console.log('Visa status:', visaData);
      } else {
        console.log('Visa API error:', visaRes.status, visaRes.statusText);
        if (visaData.noSubmission) {
          setNoVisaSubmission(true);
        }
        setVisaError(visaData.error || "حدث خطأ أثناء جلب معلومات مستندات التأشيرة");
      }
    } catch (err: any) {
      console.error('Visa fetch error:', err);
      setVisaError("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setVisaLoading(false);
    }
  };

  const handlePaymentReceiptUpload = async (file: File) => {
    try {
      setUploadingReceipt(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch("/api/student/payment-receipt", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل في رفع إيصال الدفع");
      }

      // Refresh receipt status
      await fetchReceiptStatus();
      
      toast({
        title: "نجح",
        description: "تم رفع إيصال الدفع بنجاح",
      });
      
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err.message || "حدث خطأ أثناء رفع إيصال الدفع",
        variant: "destructive",
      });
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleVisaDocumentsUpload = async (file: File) => {
    try {
      setUploadingVisa(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch("/api/student/visa-documents", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل في رفع مستندات التأشيرة");
      }

      // Refresh visa status
      await fetchVisaStatus();
      
      toast({
        title: "نجح",
        description: "تم رفع مستندات التأشيرة بنجاح",
      });
      
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err.message || "حدث خطأ أثناء رفع مستندات التأشيرة",
        variant: "destructive",
      });
    } finally {
      setUploadingVisa(false);
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case "submitted":
        return "تم التقديم";
      case "approved_by_admin":
        return "موافقة الإدارة";
      case "sent_to_university":
        return "مرسل للجامعة";
      case "accepted_by_university":
        return "مقبول من الجامعة";
      case "rejected_by_university":
        return "رفض الجامعة";
      case "submitted_visa_info":
        return "تقديم معلومات التأشيرة";
      case "submitted_payment":
        return "تقديم الدفع";
      case "completed":
        return "مكتمل";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted_by_university":
        return "bg-green-100 text-green-800";
      case "approved_by_admin":
        return "bg-blue-100 text-blue-800";
      case "sent_to_university":
        return "bg-purple-100 text-purple-800";
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#111827]">رفع إيصال الدفع للجامعة</h1>
        <p className="text-[#4b5563] mt-1">رفع إيصال دفع رسوم الجامعة بعد قبول طلبك</p>
      </div>

      {/* Payment Receipt Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            إيصال دفع رسوم الجامعة
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchReceiptStatus}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ml-1 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              <span>جاري تحميل معلومات إيصال الدفع...</span>
            </div>
          ) : noSubmission ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-800">لم يتم العثور على طلب تقديم</h3>
                  <p className="text-sm text-yellow-600">
                    لم يتم العثور على طلب تقديم مرتبط بحسابك. يرجى التأكد من تقديم طلب أولاً من خلال الصفحة الرئيسية.
                  </p>
                  <div className="mt-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = '/'}
                    >
                      الذهاب للصفحة الرئيسية
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">حدث خطأ</h3>
                  <p className="text-sm text-red-600">{error}</p>
                  <div className="mt-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={fetchReceiptStatus}
                    >
                      <RefreshCw className="w-4 h-4 ml-1" />
                      إعادة المحاولة
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : !receiptStatus ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-gray-500" />
                <div>
                  <h3 className="font-semibold text-gray-700">لا توجد معلومات</h3>
                  <p className="text-sm text-gray-600">لا توجد معلومات عن إيصال الدفع</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Current Status Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">حالة طلبك الحالية:</span>
                  <Badge className={getStatusColor(receiptStatus.submissionStatus)}>
                    {getOrderStatusText(receiptStatus.submissionStatus)}
                  </Badge>
                </div>
              </div>

              {/* Upload Section */}
              {receiptStatus.submissionStatus === 'accepted_by_university' ? (
                <div className="space-y-4">
                  {receiptStatus.hasUploadedReceipt ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-green-800">تم رفع إيصال الدفع بنجاح</h3>
                          <p className="text-sm text-green-600">
                            تم رفع الإيصال في: {receiptStatus.uploadedAt ? new Date(receiptStatus.uploadedAt).toLocaleDateString('ar-SA') : 'غير محدد'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {receiptStatus.receiptPath && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`/api/files/${receiptStatus.receiptPath!}`, '_blank')}
                          >
                            <Eye className="w-4 h-4 ml-1" />
                            عرض الإيصال
                          </Button>
                        )}
                        
                        <Badge className={receiptStatus.viewedByAdmin ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}>
                          {receiptStatus.viewedByAdmin ? "تمت المراجعة من الإدارة" : "في انتظار المراجعة"}
                        </Badge>
                      </div>
                    </div>
                  ) : receiptStatus.canUploadReceipt ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Upload className="w-6 h-6 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-blue-800">مطلوب رفع إيصال الدفع</h3>
                          <p className="text-sm text-blue-600">
                            تم قبول طلبك من الجامعة. يرجى دفع الرسوم المطلوبة ورفع إيصال الدفع.
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-blue-800">اختر ملف إيصال الدفع</label>
                          <Input 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handlePaymentReceiptUpload(file);
                              }
                            }}
                            disabled={uploadingReceipt}
                            className="border-blue-300"
                          />
                          <p className="text-xs text-blue-600 mt-1">
                            الملفات المقبولة: PDF, JPG, PNG (حد أقصى 5 ميجابايت)
                          </p>
                        </div>
                        
                        {uploadingReceipt && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm">جاري رفع الإيصال...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-gray-500" />
                        <div>
                          <h3 className="font-semibold text-gray-700">غير متاح حالياً</h3>
                          <p className="text-sm text-gray-600">
                            رفع إيصال الدفع غير متاح في الوقت الحالي.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-yellow-600" />
                    <div>
                      <h3 className="font-semibold text-yellow-800">في انتظار قبول الجامعة</h3>
                      <p className="text-sm text-yellow-600">
                        حالة طلبك الحالية: {getOrderStatusText(receiptStatus.submissionStatus)}
                      </p>
                      <p className="text-sm text-yellow-600 mt-1">
                        سيتم تفعيل خاصية رفع إيصال الدفع عند قبول طلبك من الجامعة.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visa Documents Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            مستندات التأشيرة
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchVisaStatus}
              disabled={visaLoading}
            >
              <RefreshCw className={`w-4 h-4 ml-1 ${visaLoading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {visaLoading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              <span>جاري تحميل معلومات مستندات التأشيرة...</span>
            </div>
          ) : noVisaSubmission ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-800">لم يتم العثور على طلب تقديم</h3>
                  <p className="text-sm text-yellow-600">
                    لم يتم العثور على طلب تقديم مرتبط بحسابك. يرجى التأكد من تقديم طلب أولاً.
                  </p>
                </div>
              </div>
            </div>
          ) : visaError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">حدث خطأ</h3>
                  <p className="text-sm text-red-600">{visaError}</p>
                  <div className="mt-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={fetchVisaStatus}
                    >
                      <RefreshCw className="w-4 h-4 ml-1" />
                      إعادة المحاولة
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : !visaStatus ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-gray-500" />
                <div>
                  <h3 className="font-semibold text-gray-700">لا توجد معلومات</h3>
                  <p className="text-sm text-gray-600">لا توجد معلومات عن مستندات التأشيرة</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Current Status Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">حالة طلبك الحالية:</span>
                  <Badge className={getStatusColor(visaStatus.submissionStatus)}>
                    {getOrderStatusText(visaStatus.submissionStatus)}
                  </Badge>
                </div>
              </div>

              {/* Upload Section */}
              {visaStatus.submissionStatus === 'accepted_by_university' ? (
                <div className="space-y-4">
                  {visaStatus.hasUploadedVisaDocuments ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-green-800">تم رفع مستندات التأشيرة بنجاح</h3>
                          <p className="text-sm text-green-600">
                            تم رفع المستندات في: {visaStatus.uploadedAt ? new Date(visaStatus.uploadedAt).toLocaleDateString('ar-SA') : 'غير محدد'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {visaStatus.visaDocumentsPaths && visaStatus.visaDocumentsPaths.length > 0 && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`/api/files/${visaStatus.visaDocumentsPaths[0]}`, '_blank')}
                          >
                            <Eye className="w-4 h-4 ml-1" />
                            عرض المستندات
                          </Button>
                        )}
                        
                        <Badge className={visaStatus.viewedByAdmin ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}>
                          {visaStatus.viewedByAdmin ? "تمت المراجعة من الإدارة" : "في انتظار المراجعة"}
                        </Badge>
                      </div>
                    </div>
                  ) : visaStatus.canUploadVisaDocuments ? (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Upload className="w-6 h-6 text-purple-600" />
                        <div>
                          <h3 className="font-semibold text-purple-800">مطلوب رفع مستندات التأشيرة</h3>
                          <p className="text-sm text-purple-600">
                            تم قبول طلبك من الجامعة. يرجى رفع مستندات التأشيرة المطلوبة.
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-purple-800">اختر ملف مستندات التأشيرة</label>
                          <Input 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleVisaDocumentsUpload(file);
                              }
                            }}
                            disabled={uploadingVisa}
                            className="border-purple-300"
                          />
                          <p className="text-xs text-purple-600 mt-1">
                            الملفات المقبولة: PDF, JPG, PNG (حد أقصى 5 ميجابايت)
                          </p>
                        </div>
                        
                        {uploadingVisa && (
                          <div className="flex items-center gap-2 text-purple-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                            <span className="text-sm">جاري رفع مستندات التأشيرة...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-gray-500" />
                        <div>
                          <h3 className="font-semibold text-gray-700">غير متاح حالياً</h3>
                          <p className="text-sm text-gray-600">
                            رفع مستندات التأشيرة غير متاح في الوقت الحالي.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-yellow-600" />
                    <div>
                      <h3 className="font-semibold text-yellow-800">في انتظار قبول الجامعة</h3>
                      <p className="text-sm text-yellow-600">
                        حالة طلبك الحالية: {getOrderStatusText(visaStatus.submissionStatus)}
                      </p>
                      <p className="text-sm text-yellow-600 mt-1">
                        سيتم تفعيل خاصية رفع مستندات التأشيرة عند قبول طلبك من الجامعة.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            تعليمات مهمة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">خطوات رفع إيصال الدفع:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• انتظر حتى يتم قبول طلبك من الجامعة (ستظهر حالة "مقبول من الجامعة")</li>
              <li>• ستتلقى تفاصيل الدفع من الجامعة عبر البريد الإلكتروني</li>
              <li>• قم بدفع رسوم الجامعة حسب التفاصيل المرسلة إليك</li>
              <li>• احتفظ بإيصال الدفع أو الفاتورة</li>
              <li>• ارفع صورة واضحة من الإيصال في هذه الصفحة</li>
              <li>• انتظر تأكيد استلام الدفع من الإدارة</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">متطلبات الملف:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• تأكد من وضوح جميع تفاصيل الإيصال</li>
              <li>• الملفات المقبولة: PDF, JPG, PNG</li>
              <li>• حجم الملف الأقصى: 5 ميجابايت</li>
              <li>• يمكن رفع إيصال واحد فقط لكل طلب</li>
              <li>• في حالة وجود مشاكل، تواصل مع الدعم الفني</li>
            </ul>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">بعد رفع الإيصال:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• ستتمكن من عرض الإيصال المرفوع في أي وقت</li>
              <li>• ستتم مراجعة الإيصال من قبل الإدارة</li>
              <li>• ستتلقى إشعاراً عند تأكيد استلام الدفع</li>
              <li>• يمكنك متابعة حالة طلبك من لوحة التحكم الرئيسية</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
