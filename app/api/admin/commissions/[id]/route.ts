import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/admin/commissions/[id] - Get a specific commission
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const commissionId = parseInt(idParam)

    if (isNaN(commissionId)) {
      return NextResponse.json({ error: 'معرف العمولة غير صحيح' }, { status: 400 })
    }

    const commission = await prisma.commission.findUnique({
      where: { id: commissionId },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        order: {
          select: {
            id: true,
            formSubmission: {
              select: {
                fullName: true
              }
            },
            adminStatus: true,
            paymentStatus: true,
            dateCreated: true
          }
        }
      }
    })

    if (!commission) {
      return NextResponse.json({ error: 'العمولة غير موجودة' }, { status: 404 })
    }

    return NextResponse.json(commission)
  } catch (error) {
    console.error('Error fetching commission:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات العمولة' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/commissions/[id] - Update commission status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const commissionId = parseInt(idParam)

    if (isNaN(commissionId)) {
      return NextResponse.json({ error: 'معرف العمولة غير صحيح' }, { status: 400 })
    }

    const body = await request.json()
    const { status, notes } = body

    // Validate status
    const validStatuses = ['pending', 'approved', 'paid', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'حالة العمولة غير صحيحة' }, { status: 400 })
    }

    // Check if commission exists
    const existingCommission = await prisma.commission.findUnique({
      where: { id: commissionId }
    })

    if (!existingCommission) {
      return NextResponse.json({ error: 'العمولة غير موجودة' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    // Add timestamp based on status
    if (status === 'approved' && existingCommission.status !== 'approved') {
      updateData.approvedAt = new Date()
    } else if (status === 'paid' && existingCommission.status !== 'paid') {
      updateData.paidAt = new Date()
    }

    // Add notes if provided
    if (notes !== undefined) {
      updateData.notes = notes
    }

    const updatedCommission = await prisma.commission.update({
      where: { id: commissionId },
      data: updateData,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        order: {
          select: {
            id: true,
            formSubmission: {
              select: {
                fullName: true
              }
            },
            adminStatus: true,
            paymentStatus: true,
            dateCreated: true
          }
        }
      }
    })

    return NextResponse.json(updatedCommission)
  } catch (error) {
    console.error('Error updating commission:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث العمولة' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/commissions/[id] - Delete a commission
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const commissionId = parseInt(idParam)

    if (isNaN(commissionId)) {
      return NextResponse.json({ error: 'معرف العمولة غير صحيح' }, { status: 400 })
    }

    // Check if commission exists
    const existingCommission = await prisma.commission.findUnique({
      where: { id: commissionId }
    })

    if (!existingCommission) {
      return NextResponse.json({ error: 'العمولة غير موجودة' }, { status: 404 })
    }

    // Don't allow deletion of paid commissions
    if (existingCommission.status === 'paid') {
      return NextResponse.json({ error: 'لا يمكن حذف العمولات المدفوعة' }, { status: 400 })
    }

    await prisma.commission.delete({
      where: { id: commissionId }
    })

    return NextResponse.json({ message: 'تم حذف العمولة بنجاح' })
  } catch (error) {
    console.error('Error deleting commission:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف العمولة' },
      { status: 500 }
    )
  }
}
