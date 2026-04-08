"use client"
import { useState, useEffect } from "react"
import { University, Department } from "@/lib/types"
import { useLanguage } from "@/contexts/LanguageContext"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Search,
  MapPin,
  GraduationCap,
  Filter,
  RotateCcw,
  ChevronDown,
  Star,
  Globe,
  BookOpen,
  Award,
  Users,
  MessageCircle,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Heart,
  Eye,
  Share2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"


interface FilterOption {
  id: string;
  name: string;
}

// Filter options will be fetched from the API
const getDefaultLevels = (t: any): FilterOption[] => [{ id: "all", name: t('universities.filters.allLevels') }]
const getDefaultLocations = (t: any): FilterOption[] => [{ id: "all", name: t('universities.filters.allLocations') }]
const getOfferLetterFees = (t: any) => [
  { id: "all", name: t('universities.filters.allTypes') },
  { id: "free", name: t('universities.filters.free') },
  { id: "paid", name: t('universities.filters.paid') },
]

const getSortOptions = (t: any) => [
  { id: "popular", name: t('universities.sort.popular') },
  { id: "ranking", name: t('universities.sort.ranking') },
  { id: "tuition-low", name: t('universities.sort.tuitionLow') },
  { id: "tuition-high", name: t('universities.sort.tuitionHigh') },
  { id: "courses", name: t('universities.sort.courses') },
  { id: "rating", name: t('universities.sort.rating') },
]

export default function UniversitiesPage() {
  const { language, t, isRTL } = useLanguage()
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedOfferFee, setSelectedOfferFee] = useState("all")
  const [sortBy, setSortBy] = useState("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [favorites, setFavorites] = useState<number[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [levels, setLevels] = useState<FilterOption[]>([])
  const [locations, setLocations] = useState<FilterOption[]>([])

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/universities/filters')
        if (!response.ok) {
          throw new Error('Failed to fetch filter options')
        }
        const data = await response.json()
        setLevels([...getDefaultLevels(t), ...data.levels])
        setLocations([...getDefaultLocations(t), ...data.locations])
      } catch (err) {
        console.error('Error fetching filter options:', err)
        // Use default values if API fails
        setLevels(getDefaultLevels(t))
        setLocations(getDefaultLocations(t))
      }
    }

    const fetchUniversities = async (filters = {}) => {
      try {
        setLoading(true)
        const filtersWithLanguage = { language, ...filters }
        const queryParams = new URLSearchParams(filtersWithLanguage as any).toString()
        const url = `/api/universities${queryParams ? `?${queryParams}` : ''}`
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Failed to fetch universities')
        }
        const data = await response.json()
        setUniversities(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchFilterOptions()
    fetchUniversities()
  }, [language])

  // Universities are now sorted by the backend API
  const sortedUniversities = universities

  // Fetch universities with current filters
  const fetchUniversitiesWithFilters = async () => {
    try {
      setLoading(true)
      const filters: any = { language }
      
      if (searchQuery) filters.search = searchQuery
      if (selectedLevel && selectedLevel !== "all") filters.level = selectedLevel
      if (selectedLocation && selectedLocation !== "all") filters.location = selectedLocation
      if (selectedOfferFee && selectedOfferFee !== "all") filters.offerLetterFee = selectedOfferFee
      if (sortBy) filters.sortBy = sortBy
      
      const queryParams = new URLSearchParams(filters).toString()
      const url = `/api/universities${queryParams ? `?${queryParams}` : ''}`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch universities')
      }
      const data = await response.json()
      setUniversities(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedLevel("all")
    setSelectedLocation("all")
    setSelectedOfferFee("all")
    setSortBy("popular")
  }

  // Apply filters when filter options change
  useEffect(() => {
    fetchUniversitiesWithFilters()
  }, [selectedLevel, selectedLocation, selectedOfferFee, searchQuery, sortBy])

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 ${isRTL ? 'dir-rtl text-right' : 'dir-ltr text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <Link href="/" className="text-2xl font-bold text-gray-900">
                SM Alkaff
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                {t('nav.home')}
              </Link>
              <Link href="/universities" className="text-blue-600 font-medium">
                {t('nav.universities')}
              </Link>
              {/* <Link href="#" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                {t('nav.about')}
              </Link>
              <Link href="#" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                {t('nav.contact')}
              </Link> */}
            </nav>

            <div className="flex items-center space-x-4 space-x-reverse">
              <LanguageSwitcher />
              <Link href="/login">
                <Button variant="outline" className="hidden md:inline-flex">
                  {t('nav.login')}
                </Button>
              </Link>
              <Button className="hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                {t('nav.start')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{t('universities.page.title')}</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              {t('universities.page.description')}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row-reverse gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="sticky top-24">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-4">
                <Button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white"
                >
                  <Filter className="h-5 w-5 ml-2" />
                  {t('universities.filters.searchAndFilter')}
                  <ChevronDown className={`h-5 w-5 mr-2 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
                </Button>
              </div>

              {/* Filter Panel */}
              <div className={`${isFilterOpen ? "block" : "hidden"} lg:block`}>
                <Card className="bg-white/80 backdrop-blur-lg border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">{t('universities.filters.searchAndFilter')}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {/* Search */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('universities.filters.searchByName')}</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={t('universities.filters.enterUniversityName')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-3 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      {/* Level of Interest */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('universities.filters.studyLevel')}</label>
                        <select
                          value={selectedLevel}
                          onChange={(e) => setSelectedLevel(e.target.value)}
                          className="w-full bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {levels.map((level) => (
                            <option key={level.id} value={level.id}>
                              {level.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Locations */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('universities.filters.location')}</label>
                        <select
                          value={selectedLocation}
                          onChange={(e) => setSelectedLocation(e.target.value)}
                          className="w-full bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {locations.map((location) => (
                            <option key={location.id} value={location.id}>
                              {location.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Offer Letter Fee */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('universities.filters.offerLetterFees')}</label>
                        <select
                          value={selectedOfferFee}
                          onChange={(e) => setSelectedOfferFee(e.target.value)}
                          className="w-full bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {getOfferLetterFees(t).map((fee) => (
                            <option key={fee.id} value={fee.id}>
                              {fee.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Apply Filter Button */}
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                        {t('universities.filters.applyFilter')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('universities.results.title')}</h2>
                <p className="text-gray-600">
                  {t('universities.results.total')}: <span className="font-semibold text-blue-600">{sortedUniversities.length}</span>
                </p>
              </div>

              <div className="flex items-center space-x-4 space-x-reverse">
                {/* Sort */}
                <div className="flex items-center space-x-2 space-x-reverse">
                  <label className="text-sm text-gray-600">{t('universities.results.sortBy')}:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {getSortOptions(t).map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Mode */}
                <div className="flex bg-white/60 backdrop-blur-sm border border-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-600"}`}
                  >
                    <BookOpen className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-600"}`}
                  >
                    <Globe className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Universities List */}
            <div
              className={`space-y-6 ${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6 space-y-0" : ""}`}
            >
              {sortedUniversities.map((university: University) => (
                <Card
                  key={university.id}
                  className="group bg-white/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-[1.02]"
                >
                  <Link href={`/universities/${university.id}`}>
                  <CardContent className="p-0">
                    <div className={`${viewMode === "grid" ? "block" : "flex flex-row-reverse"} h-full`}>
                      {/* University Logo & Info */}
                      <div className={`${viewMode === "grid" ? "p-6" : "flex items-center p-6 flex-1"}`}>
                        <div
                          className={`${viewMode === "grid" ? "text-center" : "flex items-center space-x-6 w-full space-x-reverse"}`}
                        >
                          {/* Logo */}
                          <div className={`relative ${viewMode === "grid" ? "mb-4" : ""}`}>
                            <div
                              className={`absolute inset-0 bg-gradient-to-r ${university.color} opacity-20 rounded-full blur-xl transform scale-150 group-hover:scale-200 transition-transform duration-500`}
                            ></div>
                            <div className="relative">
                              <Image
                                src={university.logo || "/placeholder.svg"}
                                alt={university.name}
                                width={viewMode === "grid" ? 80 : 60}
                                height={viewMode === "grid" ? 80 : 60}
                                className={`${viewMode === "grid" ? "mx-auto" : ""} rounded-lg group-hover:scale-110 transition-transform duration-300`}
                              />
                              {university.featured && (
                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full p-1">
                                  <Award className="h-3 w-3" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* University Details */}
                          <div className={`${viewMode === "grid" ? "text-center" : "flex-1 text-right"}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div
                                className={`${viewMode === "grid" ? "mx-auto" : ""} flex items-center space-x-2 space-x-reverse`}
                              >
                                {university.popular && (
                                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                                    {t('universities.card.popular')}
                                  </div>
                                )}
                                <div
                                  className={`bg-gradient-to-r ${university.color} text-white px-2 py-1 rounded-full text-xs font-bold`}
                                >
                                  {university.ranking}
                                </div>
                              </div>
                              <button
                                onClick={() => toggleFavorite(university.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Heart
                                  className={`h-5 w-5 ${favorites.includes(university.id) ? "fill-red-500 text-red-500" : ""}`}
                                />
                              </button>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                              {university.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-3">{university.nameEn || ""}</p>

                            <div className="flex items-center justify-center md:justify-start space-x-2 space-x-reverse mb-3">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{university.location || ""}</span>
                              <span className="text-lg">{university.flag || ""}</span>
                            </div>

                            {university.freeOfferLetter && (
                              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-3">
                                <CheckCircle className="h-4 w-4 ml-1" />
                                {t('universities.card.freeOfferLetter')}
                              </div>
                            )}

                            <div className="flex items-center justify-center md:justify-start space-x-4 space-x-reverse text-sm text-gray-600 mb-4">
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <BookOpen className="h-4 w-4" />
                                <span>{university.courses || 0} {t('universities.card.specializations')}</span>
                              </div>
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span>{university.rating || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <Users className="h-4 w-4" />
                                <span>{university.students || ""}</span>
                              </div>
                            </div>

                            {/* Tuition Fee */}
                            <div className="flex items-center justify-center md:justify-start space-x-2 space-x-reverse mb-4">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-lg font-bold text-green-600">
                                {university.tuitionFee?.replace('RM', 'USD') || ""} {university.currency?.replace('RM', 'USD') || ""}
                              </span>
                              <span className="text-sm text-gray-500">/ {t('universities.card.yearly')}</span>
                            </div>

                            {/* Specializations */}
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                              {university.departments?.slice(0, 3).map((department: Department, index: number) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                  {department.name}
                                </span>
                              ))}
                              {university.departments && university.departments.length > 3 && (
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                  +{university.departments.length - 3} {t('universities.card.more')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div
                        className={`${viewMode === "grid" ? "p-6 pt-0" : "flex flex-col justify-center p-6 space-y-3"} ${viewMode === "list" ? "min-w-[200px]" : ""}`}
                      >
                        <Button
                          size={viewMode === "grid" ? "default" : "sm"}
                          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white transform hover:scale-105 transition-all duration-200"
                        >
                          {t('universities.card.applyNow')}
                        </Button>
                        <Button
                          size={viewMode === "grid" ? "default" : "sm"}
                          variant="outline"
                          className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
                        >
                          {t('universities.card.askUs')}
                        </Button>
                        <div className="flex justify-center space-x-2 space-x-reverse mt-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <Share2 className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <MessageCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  </CardContent>
                  </Link>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {sortedUniversities.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-4">{t('universities.noResults.title')}</h3>
                <p className="text-gray-500 mb-8">{t('universities.noResults.description')}</p>
                <Button onClick={resetFilters} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  {t('universities.noResults.resetFilters')}
                </Button>
              </div>
            )}

            {/* Load More */}
            {sortedUniversities.length > 0 && (
              <div className="text-center mt-12">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
                >
                  {t('universities.loadMore.showMore')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">{t('universities.cta.title')}</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {t('universities.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-200"
              >
                <MessageCircle className="ml-2 h-5 w-5" />
                {t('universities.cta.talkToExpert')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-200"
              >
                <GraduationCap className="ml-2 h-5 w-5" />
                {t('universities.cta.requestConsultation')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
