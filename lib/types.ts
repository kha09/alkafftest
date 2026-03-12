export interface HeroSlide {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  gradient: string;
}

export interface University {
  id: number;
  name: string;
  country: string;
  logo: string;
  ranking: string;
  students: string;
  programs: string;
  acceptance: string;
  color: string;
  flag: string;
  freeOfferLetter: boolean;
  departments?: Department[];
  location?: string;
  nameEn?: string;
  tuitionFee?: string;
  currency?: string;
  courses?: number;
  rating?: number;
  popular?: boolean;
  featured?: boolean;
}

export interface Department {
  id: number;
  name: string;
  programs?: Program[];
  university?: University;
}

export interface Program {
  id: number;
  name: string;
  description: string;
  tuitionFees: string;
  duration: string;
  intakeMonths: string;
  qualification: string;
  englishRequirement: string;
  offerLetter: boolean;
  classType: string;
  yearlyTuitionFees: string;
  otherFees: string;
  department?: Department & {
    university?: University;
  };
}

export interface Testimonial {
  id: number;
  name: string;
  program: string;
  text: string;
  rating: number;
  avatar: string;
  university: string;
  country: string;
  flag: string;
  date: string;
  hasVideo: boolean;
  featured: boolean;
  category: string;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string;
  popular: boolean;
}

export interface WhySMAlkaff {
  id: number;
  title: string;
  description: string;
  useUniversityColor: boolean;
  features: {
    icon: string;
    title: string;
    subtitle: string;
    description: string;
    color: string;
    delay: string;
    stats: string;
    statsLabel: string;
  }[];
}

export interface HowItWorks {
  id: number;
  title: string;
  description: string;
  steps: {
    step: string;
    title: string;
    subtitle: string;
    description: string;
    icon: string;
    color: string;
    delay: string;
  }[];
}

export interface HomePageContent {
  heroSlides: HeroSlide[]
  universities: University[]
  testimonials: Testimonial[]
  faqs: Faq[]
  whySMAlkaff?: WhySMAlkaff
  howItWorks?: HowItWorks
  showJoinSection?: boolean
}

export interface FormSubmission {
  id: number;
  fullName: string;
  nationality: string;
  email: string;
  countryOfResidence: string;
  contactNumber: string;
  cityOfResidence: string;
  preferredProgram: string;
  universityId?: number;
  programId?: number;
  submittedAt: string;
  uploadedFiles?: UploadedFile[];
}

export interface UploadedFile {
  id: number;
  filename: string;
  originalName: string;
  path: string;
  size: number;
  type: string;
  formSubmissionId: number;
  uploadedAt: string;
}
