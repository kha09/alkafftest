import db from '@/lib/db'
import { PrismaClient } from '@/lib/generated/prisma'
import { HomePageContent, HeroSlide, University, Testimonial, Faq, WhySMAlkaff, HowItWorks } from '@/lib/types'

export async function getHomepageContent(language: string = 'ar'): Promise<HomePageContent> {
  try {
    // Fetch all content types from the database filtered by language
    const [heroSlides, universities, testimonials, faqs, whySMAlkaff, howItWorks] = await Promise.all([
      db.heroSlide.findMany({ 
        where: { language },
        orderBy: { order: 'asc' } 
      }),
      db.homePageUniversity.findMany({ 
        where: { language },
        orderBy: { order: 'asc' } 
      }),
      db.testimonial.findMany({ 
        where: { language },
        orderBy: { order: 'asc' } 
      }),
      db.faq.findMany({ 
        where: { language },
        orderBy: { order: 'asc' } 
      }),
      db.whySMAlkaff.findMany({
        where: { language }
      }),
      db.howItWorks.findMany({
        where: { language }
      }),
    ])

    // If no content exists, return empty arrays
    if (!heroSlides.length && !universities.length && !testimonials.length && !faqs.length) {
      return {
        heroSlides: [],
        universities: [],
        testimonials: [],
        faqs: [],
      }
    }

    return {
      heroSlides: heroSlides.map((slide: any) => ({
        title: slide.title,
        subtitle: slide.subtitle,
        description: slide.description,
        image: slide.image,
        gradient: slide.gradient,
      })),
      universities: universities.map((university: any) => ({
        id: university.id,
        name: university.name,
        country: university.country,
        logo: university.logo,
        ranking: university.ranking,
        students: university.students,
        programs: university.programs,
        acceptance: university.acceptance,
        color: university.color,
        flag: university.flag,
        freeOfferLetter: university.freeOfferLetter,
      })),
      testimonials: testimonials.map((testimonial: any) => ({
        id: testimonial.id,
        name: testimonial.name,
        program: testimonial.program,
        text: testimonial.text,
        rating: testimonial.rating,
        avatar: testimonial.avatar,
        university: testimonial.university,
        country: testimonial.country,
        flag: testimonial.flag,
        date: testimonial.date,
        hasVideo: testimonial.hasVideo,
        featured: testimonial.featured,
        category: testimonial.category,
      })),
      faqs: faqs.map((faq: any) => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        popular: faq.popular,
      })),
      whySMAlkaff: whySMAlkaff.length > 0 ? {
        id: whySMAlkaff[0].id,
        title: whySMAlkaff[0].title,
        description: whySMAlkaff[0].description,
        features: whySMAlkaff[0].features ? JSON.parse(whySMAlkaff[0].features) : [],
      } : undefined,
      howItWorks: howItWorks.length > 0 ? {
        id: howItWorks[0].id,
        title: howItWorks[0].title,
        description: howItWorks[0].description,
        steps: howItWorks[0].steps ? JSON.parse(howItWorks[0].steps.replace(/\n/g, "\\n").replace(/\r/g, "\\r")) : [],
      } : undefined,
    }
  } catch (error) {
    console.error('Error fetching homepage content:', error)
    throw new Error('Failed to fetch homepage content')
  }
}

export async function updateHomepageContent(content: HomePageContent, language: string = 'ar'): Promise<void> {
  try {
    // Start a transaction to ensure data consistency
    await db.$transaction(async (prisma: PrismaClient) => {
      // Delete homepage content for this language that doesn't have foreign key constraints
      await prisma.heroSlide.deleteMany({ where: { language } })
      await prisma.testimonial.deleteMany({ where: { language } })
      await prisma.faq.deleteMany({ where: { language } })

      // Handle WhySMAlkaff section
      if (content.whySMAlkaff) {
        const existingWhySMAlkaff = await prisma.whySMAlkaff.findMany({
          where: { language }
        });
        const whySMAlkaffData = {
          title: content.whySMAlkaff.title,
          description: content.whySMAlkaff.description,
          features: JSON.stringify(content.whySMAlkaff.features),
          language,
        };

        if (existingWhySMAlkaff.length > 0) {
          // Update existing record
          await prisma.whySMAlkaff.update({
            where: { id: existingWhySMAlkaff[0].id },
            data: whySMAlkaffData,
          });
        } else {
          // Create new record
          await prisma.whySMAlkaff.create({
            data: whySMAlkaffData,
          });
        }
      }

      // Handle HowItWorks section
      if (content.howItWorks) {
        const existingHowItWorks = await prisma.howItWorks.findMany({
          where: { language }
        });
        // Ensure proper encoding for Arabic characters
        const stepsString = JSON.stringify(content.howItWorks.steps).replace(/[\u007F-\u009F]/g, "");
        const howItWorksData = {
          title: content.howItWorks.title,
          description: content.howItWorks.description,
          steps: stepsString,
          language,
        };

        if (existingHowItWorks.length > 0) {
          // Update existing record
          await prisma.howItWorks.update({
            where: { id: existingHowItWorks[0].id },
            data: howItWorksData,
          });
        } else {
          // Create new record
          await prisma.howItWorks.create({
            data: howItWorksData,
          });
        }
      }

      // Handle homepage universities - these are completely separate from the main university database
      // Delete all existing homepage universities for this language and recreate them
      await prisma.homePageUniversity.deleteMany({ where: { language } })
      
      // Create new homepage universities
      await prisma.homePageUniversity.createMany({
        data: content.universities.map((university, index) => ({
          name: university.name,
          country: university.country,
          logo: university.logo,
          ranking: university.ranking,
          students: university.students,
          programs: university.programs,
          acceptance: university.acceptance,
          color: university.color,
          flag: university.flag,
          freeOfferLetter: university.freeOfferLetter,
          language,
          order: index,
        })),
      })

      // Create new hero slides
      await prisma.heroSlide.createMany({
        data: content.heroSlides.map((slide, index) => ({
          title: slide.title,
          subtitle: slide.subtitle,
          description: slide.description,
          image: slide.image,
          gradient: slide.gradient,
          language,
          order: index,
        })),
      })

      // Create new testimonials
      await prisma.testimonial.createMany({
        data: content.testimonials.map((testimonial, index) => ({
          name: testimonial.name,
          program: testimonial.program,
          text: testimonial.text,
          rating: testimonial.rating,
          avatar: testimonial.avatar,
          university: testimonial.university,
          country: testimonial.country,
          flag: testimonial.flag,
          date: testimonial.date,
          hasVideo: testimonial.hasVideo,
          featured: testimonial.featured,
          category: testimonial.category,
          language,
          order: index,
        })),
      })

      // Create new FAQs
      await prisma.faq.createMany({
        data: content.faqs.map((faq, index) => ({
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          popular: faq.popular,
          language,
          order: index,
        })),
      })
    })
  } catch (error) {
    console.error('Error updating homepage content:', error)
    throw new Error('Failed to update homepage content')
  }
}

export async function initializeDefaultContent(): Promise<void> {
  try {
    // Check if Arabic content already exists
    const arabicContent = await getHomepageContent('ar')
    
    // Check if content already exists
    if (arabicContent.heroSlides.length > 0 || 
        arabicContent.universities.length > 0 || 
        arabicContent.testimonials.length > 0 || 
        arabicContent.faqs.length > 0 ||
        arabicContent.whySMAlkaff ||
        arabicContent.howItWorks) {
      return
    }

    // Load default content from the data file
    const defaultContent = await import('@/data/homepage-content.json')
    
    // Save default content to database
    await updateHomepageContent(defaultContent.default || defaultContent, 'ar')
  } catch (error) {
    console.error('Error initializing default content:', error)
  }
}

// Function to seed English content
export async function seedEnglishContent(): Promise<void> {
  try {
    // Load English content from the data file
    const englishContent = await import('@/data/english-content.json')
    const content = englishContent.default || englishContent
    
    // Transform the content to match HomePageContent interface
    const transformedContent: HomePageContent = {
      heroSlides: content.heroSlides || [],
      universities: (content.universities || []).map((uni: any) => ({
        id: 0, // Will be assigned by database
        ...uni
      })),
      testimonials: (content.testimonials || []).map((testimonial: any) => ({
        id: 0, // Will be assigned by database
        ...testimonial
      })),
      faqs: (content.faqs || []).map((faq: any) => ({
        id: 0, // Will be assigned by database
        ...faq
      })),
      whySMAlkaff: content.whySMAlkaff ? {
        id: 0, // Will be assigned by database
        ...content.whySMAlkaff
      } : undefined,
      howItWorks: content.howItWorks ? {
        id: 0, // Will be assigned by database
        ...content.howItWorks
      } : undefined
    }
    
    // Save English content to database
    await updateHomepageContent(transformedContent, 'en')
  } catch (error) {
    console.error('Error seeding English content:', error)
    throw new Error('Failed to seed English content')
  }
}
