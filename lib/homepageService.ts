import db from '@/lib/db'
import { HomePageContent, HeroSlide, University, Testimonial, Faq, WhySMAlkaff, HowItWorks } from '@/lib/types'

export async function getHomepageContent(): Promise<HomePageContent> {
  try {
    // Fetch all content types from the database
    const [heroSlides, universities, testimonials, faqs, whySMAlkaff, howItWorks] = await Promise.all([
      db.heroSlide.findMany({ orderBy: { order: 'asc' } }),
      db.homePageUniversity.findMany({ orderBy: { order: 'asc' } }),
      db.testimonial.findMany({ orderBy: { order: 'asc' } }),
      db.faq.findMany({ orderBy: { order: 'asc' } }),
      db.whySMAlkaff.findMany(),
      db.howItWorks.findMany(),
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

export async function updateHomepageContent(content: HomePageContent): Promise<void> {
  try {
    // Start a transaction to ensure data consistency
    await db.$transaction(async (prisma) => {
      // Delete homepage content that doesn't have foreign key constraints
      await prisma.heroSlide.deleteMany()
      await prisma.testimonial.deleteMany()
      await prisma.faq.deleteMany()

      // Handle WhySMAlkaff section
      if (content.whySMAlkaff) {
        const existingWhySMAlkaff = await prisma.whySMAlkaff.findMany();
        const whySMAlkaffData = {
          title: content.whySMAlkaff.title,
          description: content.whySMAlkaff.description,
          features: JSON.stringify(content.whySMAlkaff.features),
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
        const existingHowItWorks = await prisma.howItWorks.findMany();
        // Ensure proper encoding for Arabic characters
        const stepsString = JSON.stringify(content.howItWorks.steps).replace(/[\u007F-\u009F]/g, "");
        const howItWorksData = {
          title: content.howItWorks.title,
          description: content.howItWorks.description,
          steps: stepsString,
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
      // Delete all existing homepage universities and recreate them
      await prisma.homePageUniversity.deleteMany()
      
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
    const content = await getHomepageContent()
    
    // Check if content already exists
    if (content.heroSlides.length > 0 || 
        content.universities.length > 0 || 
        content.testimonials.length > 0 || 
        content.faqs.length > 0 ||
        content.whySMAlkaff ||
        content.howItWorks) {
      return
    }

    // Load default content from the data file
    const defaultContent = await import('@/data/homepage-content.json')
    
    // Save default content to database
    await updateHomepageContent(defaultContent.default || defaultContent)
  } catch (error) {
    console.error('Error initializing default content:', error)
  }
}
