import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { University } from '@/lib/types'
import { saveFile, validateFile } from '@/lib/fileStorage'
import { uploadFileToS3, validateS3Config } from '@/lib/s3Client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level') || 'all'
    const location = searchParams.get('location') || 'all'
    const offerLetterFee = searchParams.get('offerLetterFee') || 'all'
    const searchQuery = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'popular'
    const language = searchParams.get('language') || 'ar'

    // Build the query conditions
    const whereConditions: any = {
      language: language
    }

    // Add search condition
    if (searchQuery && searchQuery !== '') {
      whereConditions.OR = [
        { name: { contains: searchQuery } },
        { country: { contains: searchQuery } }
      ]
    }

    // Add location condition
    if (location && location !== 'all') {
      whereConditions.country = location
    }

    // Add offer letter fee condition
    if (offerLetterFee && offerLetterFee !== 'all') {
      whereConditions.freeOfferLetter = offerLetterFee === 'free'
    }

    // Build the order by clause
    let orderBy: any = { order: 'asc' }
    switch (sortBy) {
      case 'ranking':
        orderBy = { ranking: 'asc' }
        break
      case 'tuition-low':
        // Note: This is a simplified approach. In a real application, you might want to store tuition fees as numbers
        orderBy = { students: 'asc' } // Using students as a placeholder since we don't have a direct tuition field in the schema
        break
      case 'tuition-high':
        orderBy = { students: 'desc' } // Using students as a placeholder
        break
      case 'courses':
        // This would require a more complex query with aggregation
        orderBy = { order: 'asc' } // Using default order as a placeholder
        break
      case 'rating':
        // This would require a more complex query with aggregation or a separate rating field
        orderBy = { order: 'asc' } // Using default order as a placeholder
        break
      case 'popular':
      default:
        orderBy = { order: 'asc' }
        break
    }

    // If level filter is applied, we need to join with programs
    let universities
    if (level && level !== 'all') {
      // Find programs with the specified qualification
      const programs = await db.program.findMany({
        where: {
          qualification: {
            contains: level.replace(/-/g, ' ') // Convert back from URL-friendly format
          }
        },
        select: {
          department: {
            select: {
              universityId: true
            }
          }
        }
      })

      // Extract unique university IDs
      const universityIds = [...new Set(programs.map((p: any) => p.department.universityId))]

      // Add university ID condition
      whereConditions.id = { in: universityIds }
    }

    // Fetch universities with conditions and sorting
    universities = await db.university.findMany({
      where: whereConditions,
      orderBy: orderBy,
      include: {
        departments: true
      }
    })

    // Add default values for optional properties
    const universitiesWithDefaults = universities.map((university: any) => ({
      ...university,
      nameEn: university.name,
      location: university.country,
      tuitionFee: "15,000",
      currency: "RM",
      courses: 100,
      rating: 4.5,
      popular: true,
      featured: false,
      specializations: university.departments?.map((department: any) => department.name) || [],
      students: university.students
    }))

    return NextResponse.json(universitiesWithDefaults)
  } catch (error) {
    console.error('Error fetching universities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch universities' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Parse form data
    const formData = await request.formData();
    
    // Extract university data from form data
    const universityJson = formData.get('university') as string;
    const universityData: any = JSON.parse(universityJson);
    
    // Get language parameter
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'ar'
    
    // Default placeholder logo
    const DEFAULT_LOGO = '/placeholder-logo.png'
    
    // Handle logo file upload
    let logoPath = universityData.logo && universityData.logo.length > 0 ? universityData.logo : DEFAULT_LOGO;
    const logoFile = formData.get('logo') as File | null;
    
    if (logoFile && logoFile.size > 0) {
      // Validate file
      const validation = validateFile(logoFile, 5); // 5MB max
      if (!validation.isValid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      try {
        // Check if S3 is configured
        const s3Config = validateS3Config();
        
        if (s3Config.isValid) {
          // Upload to S3/Object Storage
          const s3Result = await uploadFileToS3(logoFile, 'university-logos', Date.now());
          logoPath = `/api/files/university-logos/${s3Result.key.split('/').pop()}`;
        } else {
          // Fallback to local storage
          const fileResult = await saveFile(logoFile, 'university-logos', Date.now());
          logoPath = fileResult.relativePath;
        }
      } catch (uploadError: any) {
        // Log detailed error information for debugging
        const errorMessage = uploadError instanceof Error ? uploadError.message : String(uploadError);
        const errorStack = uploadError instanceof Error ? uploadError.stack : undefined;
        
        console.error('='.repeat(50));
        console.error('S3 UPLOAD ERROR DETAILS:');
        console.error('Error message:', errorMessage);
        console.error('Error stack:', errorStack);
        console.error('S3 Config check:', validateS3Config());
        console.error('File name:', logoFile.name);
        console.error('File size:', logoFile.size);
        console.error('File type:', logoFile.type);
        console.error('='.repeat(50));
        
        // Provide more helpful error message
        return NextResponse.json(
          { error: `فشل في رفع شعار الجامعة: ${errorMessage}` },
          { status: 500 }
        );
      }
    }
    
    // Remove fields that are computed or have default values
    const { id, nameEn, location, tuitionFee, currency, courses, rating, popular, featured, specializations, departments, logo, ...universityFields } = universityData;
    
    // Validate required fields
    if (!universityFields.name || !universityFields.country || !universityFields.ranking || 
        !universityFields.students || !universityFields.programs || !universityFields.acceptance) {
      return NextResponse.json(
        { error: 'يرجى تعبئة جميع الحقول الإلزامية' },
        { status: 400 }
      );
    }
    
    const newUniversity = await db.university.create({
      data: {
        ...universityFields,
        logo: logoPath,
        language: language,
        order: 0 // Default order value
      }
    });

    return NextResponse.json(newUniversity, { status: 201 });
  } catch (error) {
    console.error('Error creating university:', error);
    return NextResponse.json(
      { error: 'Failed to create university' },
      { status: 500 }
    );
  }
}
