import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { Program } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'ar'

    const programs = await db.program.findMany({
      where: {
        language: language
      },
      include: {
        department: {
          include: {
            university: true
          }
        }
      }
    })

    return NextResponse.json(programs)
  } catch (error) {
    console.error('Error fetching programs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body: Program = await request.json()
    
    // Get language parameter
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'ar'
    
    // Extract the department ID from the department object if it exists
    const departmentId = body.department?.id
    
    const newProgram = await db.program.create({
      data: {
        name: body.name,
        description: body.description,
        tuitionFees: body.tuitionFees,
        duration: body.duration,
        intakeMonths: body.intakeMonths,
        qualification: body.qualification,
        englishRequirement: body.englishRequirement,
        offerLetter: body.offerLetter,
        classType: body.classType,
        yearlyTuitionFees: body.yearlyTuitionFees,
        otherFees: body.otherFees,
        language: language,
        ...(departmentId && {
          department: {
            connect: { id: departmentId }
          }
        })
      },
      include: {
        department: {
          include: {
            university: true
          }
        }
      }
    })

    return NextResponse.json(newProgram, { status: 201 })
  } catch (error) {
    console.error('Error creating program:', error)
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    )
  }
}
