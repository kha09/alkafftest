import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { Program } from '@/lib/types'

interface BulkProgramRequest {
  programData: Omit<Program, 'id' | 'department'>;
  departmentIds: number[];
}

export async function POST(request: Request) {
  try {
    const body: BulkProgramRequest = await request.json()
    const { programData, departmentIds } = body
    
    // Get language parameter
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'ar'
    
    // Validate that we have at least one department
    if (!departmentIds || departmentIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one department must be selected' },
        { status: 400 }
      )
    }
    
    // Create programs for each department
    const createdPrograms = []
    
    for (const departmentId of departmentIds) {
      try {
        const newProgram = await db.program.create({
          data: {
            name: programData.name,
            description: programData.description,
            tuitionFees: programData.tuitionFees,
            duration: programData.duration,
            intakeMonths: programData.intakeMonths,
            qualification: programData.qualification,
            englishRequirement: programData.englishRequirement,
            offerLetter: programData.offerLetter,
            classType: programData.classType,
            yearlyTuitionFees: programData.yearlyTuitionFees,
            otherFees: programData.otherFees,
            language: language,
            department: {
              connect: { id: departmentId }
            }
          },
          include: {
            department: {
              include: {
                university: true
              }
            }
          }
        })
        
        createdPrograms.push(newProgram)
      } catch (error) {
        console.error(`Error creating program for department ${departmentId}:`, error)
        // Continue with other departments even if one fails
      }
    }
    
    if (createdPrograms.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create programs for any department' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: `Successfully created ${createdPrograms.length} programs`,
      programs: createdPrograms,
      totalRequested: departmentIds.length,
      totalCreated: createdPrograms.length
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating bulk programs:', error)
    return NextResponse.json(
      { error: 'Failed to create bulk programs' },
      { status: 500 }
    )
  }
}