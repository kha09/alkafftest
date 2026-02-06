import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import bcrypt from 'bcrypt'

// GET /api/admin/form-submissions - Fetch all form submissions with related data
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin (would need to implement auth)
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const agentId = searchParams.get('agentId') || ''
    const orderStage = searchParams.get('orderStage') || ''

    const skip = (page - 1) * limit

    // Build where clause for filtering
    const where: any = {}

    // Debug: log search and where clause
    console.log('Search param:', search)
    console.log('Constructed where clause:', JSON.stringify(where))

    if (search) {
      // Check if search is a number (ID search)
      const searchAsNumber = parseInt(search)
      const isNumericSearch = !isNaN(searchAsNumber)
      
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { preferredProgram: { contains: search } },
        ...(isNumericSearch ? [{ id: searchAsNumber }] : [])
      ]
    }

    if (agentId && agentId !== 'all') {
      where.agentId = parseInt(agentId)
    }

    if (orderStage && orderStage !== 'all') {
      where.orderStage = orderStage
    }

    // Debug: log final where clause after all filters
    console.log('Final where clause:', JSON.stringify(where))

    // Fetch submissions with related data
    const submissions = await prisma.formSubmission.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        submittedAt: 'desc'
      },
      include: {
        uploadedFiles: true,
        agent: true,
        user: true
      }
    })

    // Get total count for pagination
    const total = await prisma.formSubmission.count({ where })

    return NextResponse.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching form submissions:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الطلبات' },
      { status: 500 }
    )
  }
}

// POST /api/admin/form-submissions/generate-user - Generate username and password for a submission
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin (would need to implement auth)
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { submissionId } = await request.json()
    
    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 })
    }

    // Fetch the submission
    const submission = await prisma.formSubmission.findUnique({
      where: { id: submissionId },
      include: { user: true }
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Check if user already exists
    if (submission.user) {
      return NextResponse.json({ error: 'User already exists for this submission' }, { status: 400 })
    }

    // Generate username (using first part of email)
    const username = submission.email.split('@')[0]
    
    // Generate a random password (in a real app, this should be more secure)
    const password = Math.random().toString(36).slice(-8)
    
    // Hash the password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create the user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email: submission.email,
        fullName: submission.fullName,
        formSubmissionId: submissionId,
        role: 'student'
      }
    })

    // Update the submission with the user ID
    await prisma.formSubmission.update({
      where: { id: submissionId },
      data: {
        userId: user.id
      }
    })

    // Update any existing orders that are linked to this form submission to use the new user ID
    await prisma.order.updateMany({
      where: { formSubmissionId: submissionId },
      data: { userId: user.id }
    })

    return NextResponse.json({
      message: 'User created successfully',
      username,
      password,
      user
    })
  } catch (error) {
    console.error('Error generating user:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء المستخدم' },
      { status: 500 }
    )
  }
}
