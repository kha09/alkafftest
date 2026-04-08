import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { sendEmail } from '@/lib/emailService'
import { createNotification } from '@/lib/notificationService'

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, phone, message } = await request.json()
    
    // Validate required fields
    if (!fullName || !email || !phone || !message) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني غير صالح' },
        { status: 400 }
      )
    }
    
    const submissionDate = new Date().toLocaleString('ar-SA', {
      timeZone: 'Asia/Riyadh',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    // Create notification for admin
    try {
      await createNotification({
        title: 'رسالة تواصل جديدة',
        message: `رسالة جديدة من ${fullName} (${email})`,
        type: 'info',
        priority: 'normal',
        actionUrl: '/dashboard/notifications'
      })
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError)
      // Don't fail the request if notification creation fails
    }
    
    // Send email notification to all admin users
    try {
      const adminUsers = await prisma.user.findMany({
        where: { role: 'admin' },
        select: { email: true, fullName: true }
      })
      
      if (adminUsers.length > 0) {
        const emailSubject = `رسالة تواصل جديدة من ${fullName}`
        
        const emailText = `تم استلام رسالة تواصل جديدة

تفاصيل المرسل:
- الاسم الكامل: ${fullName}
- البريد الإلكتروني: ${email}
- رقم الهاتف: ${phone}
- تاريخ الإرسال: ${submissionDate}

الرسالة:
${message}

يمكنك التواصل مع المرسل مباشرة عبر البريد الإلكتروني أو رقم الهاتف المرفق.`
        
        const emailHtml = `
<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
  <h2 style="color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">رسالة تواصل جديدة</h2>
  <p style="color: #4b5563;">تم استلام رسالة تواصل جديدة عبر الموقع:</p>
  <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
    <tr style="background-color: #f9fafb;">
      <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; width: 40%;">الاسم الكامل</td>
      <td style="padding: 10px; border: 1px solid #e5e7eb;">${fullName}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">البريد الإلكتروني</td>
      <td style="padding: 10px; border: 1px solid #e5e7eb;">${email}</td>
    </tr>
    <tr style="background-color: #f9fafb;">
      <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">رقم الهاتف</td>
      <td style="padding: 10px; border: 1px solid #e5e7eb;">${phone}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">تاريخ الإرسال</td>
      <td style="padding: 10px; border: 1px solid #e5e7eb;">${submissionDate}</td>
    </tr>
  </table>
  
  <h3 style="color: #111827; margin-top: 24px; margin-bottom: 12px;">الرسالة:</h3>
  <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb;">
    <p style="color: #374151; margin: 0; white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
  </div>
  
  <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
    يمكنك التواصل مع المرسل مباشرة عبر البريد الإلكتروني أو رقم الهاتف المرفق.
  </p>
</div>`
        
        // Send email to all admins
        for (const admin of adminUsers) {
          try {
            await sendEmail({
              to: admin.email,
              subject: emailSubject,
              text: emailText,
              html: emailHtml
            })
            console.log(`Contact form email sent to admin: ${admin.email}`)
          } catch (adminEmailError) {
            console.error(`Failed to send email to admin ${admin.email}:`, adminEmailError)
          }
        }
      }
    } catch (emailError) {
      console.error('Failed to send admin email notifications:', emailError)
      // Don't fail the request if email sending fails
    }
    
    return NextResponse.json(
      { message: 'تم إرسال الرسالة بنجاح' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة الرسالة' },
      { status: 500 }
    )
  }
}
