import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import bcrypt from 'bcrypt'

// GET /api/admin/agents - Fetch all agents
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
    const status = searchParams.get('status') || 'all'

    const skip = (page - 1) * limit

    // Build where clause for filtering
    const where: any = {}
    
    if (search) {
      // Check if search is a number (ID search)
      const searchAsNumber = parseInt(search)
      const isNumericSearch = !isNaN(searchAsNumber)
      
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        ...(isNumericSearch ? [{ id: searchAsNumber }] : [])
      ]
    }

    // Status filter (future-proof, currently all agents are "active")
    if (status === "active") {
      // If you add a status field to Agent, filter here
      // where.status = "active"
    } else if (status === "inactive") {
      // where.status = "inactive"
    }

    // Fetch agents
    const agents = await prisma.agent.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get total count for pagination
    const total = await prisma.agent.count({ where })

    return NextResponse.json({
      agents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الوكلاء' },
      { status: 500 }
    )
  }
}

// POST /api/admin/agents - Create a new agent
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin (would need to implement auth)
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const data = await request.json()
    
    // Validate required fields
    if (!data.name || !data.email) {
      return NextResponse.json({ error: 'الاسم والبريد الإلكتروني مطلوبان' }, { status: 400 })
    }

    // Validate password if provided
    if (data.password && data.password.length < 6) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 })
    }

    // Check if agent with this email already exists
    const existingAgent = await prisma.agent.findUnique({
      where: { email: data.email }
    })

    if (existingAgent) {
      return NextResponse.json({ error: 'وكيل مع هذا البريد الإلكتروني موجود بالفعل' }, { status: 400 })
    }

    // Hash password if provided
    let hashedPassword = null
    let plainPassword = null
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10)
      plainPassword = data.password // Store for response
    }

    // Create the agent
    const agent = await prisma.agent.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        password: hashedPassword
      }
    })

    // Return agent data with plain password for admin to see
    const response = {
      ...agent,
      password: undefined, // Don't return hashed password
      plainPassword: plainPassword // Return plain password for admin
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating agent:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الوكيل' },
      { status: 500 }
    )
  }
}
