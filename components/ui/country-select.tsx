'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Country {
  name: string
  flag: string
  code: string
}

// Common countries with their flags
const countries: Country[] = [
  { name: 'الولايات المتحدة', flag: '🇺🇸', code: 'US' },
  { name: 'المملكة المتحدة', flag: '🇬🇧', code: 'GB' },
  { name: 'كندا', flag: '🇨🇦', code: 'CA' },
  { name: 'أستراليا', flag: '🇦🇺', code: 'AU' },
  { name: 'ألمانيا', flag: '🇩🇪', code: 'DE' },
  { name: 'فرنسا', flag: '🇫🇷', code: 'FR' },
  { name: 'هولندا', flag: '🇳🇱', code: 'NL' },
  { name: 'السويد', flag: '🇸🇪', code: 'SE' },
  { name: 'النرويج', flag: '🇳🇴', code: 'NO' },
  { name: 'الدنمارك', flag: '🇩🇰', code: 'DK' },
  { name: 'سويسرا', flag: '🇨🇭', code: 'CH' },
  { name: 'النمسا', flag: '🇦🇹', code: 'AT' },
  { name: 'بلجيكا', flag: '🇧🇪', code: 'BE' },
  { name: 'إيطاليا', flag: '🇮🇹', code: 'IT' },
  { name: 'إسبانيا', flag: '🇪🇸', code: 'ES' },
  { name: 'البرتغال', flag: '🇵🇹', code: 'PT' },
  { name: 'اليابان', flag: '🇯🇵', code: 'JP' },
  { name: 'كوريا الجنوبية', flag: '🇰🇷', code: 'KR' },
  { name: 'سنغافورة', flag: '🇸🇬', code: 'SG' },
  { name: 'هونغ كونغ', flag: '🇭🇰', code: 'HK' },
  { name: 'نيوزيلندا', flag: '🇳🇿', code: 'NZ' },
  { name: 'ماليزيا', flag: '🇲🇾', code: 'MY' },
  { name: 'تايلاند', flag: '🇹🇭', code: 'TH' },
  { name: 'الإمارات العربية المتحدة', flag: '🇦🇪', code: 'AE' },
  { name: 'قطر', flag: '🇶🇦', code: 'QA' },
  { name: 'السعودية', flag: '🇸🇦', code: 'SA' },
  { name: 'الكويت', flag: '🇰🇼', code: 'KW' },
  { name: 'البحرين', flag: '🇧🇭', code: 'BH' },
  { name: 'عُمان', flag: '🇴🇲', code: 'OM' },
  { name: 'الأردن', flag: '🇯🇴', code: 'JO' },
  { name: 'لبنان', flag: '🇱🇧', code: 'LB' },
  { name: 'مصر', flag: '🇪🇬', code: 'EG' },
  { name: 'المغرب', flag: '🇲🇦', code: 'MA' },
  { name: 'تونس', flag: '🇹🇳', code: 'TN' },
  { name: 'الجزائر', flag: '🇩🇿', code: 'DZ' },
  { name: 'تركيا', flag: '🇹🇷', code: 'TR' },
  { name: 'الهند', flag: '🇮🇳', code: 'IN' },
  { name: 'الصين', flag: '🇨🇳', code: 'CN' },
  { name: 'روسيا', flag: '🇷🇺', code: 'RU' },
  { name: 'البرازيل', flag: '🇧🇷', code: 'BR' },
  { name: 'المكسيك', flag: '🇲🇽', code: 'MX' },
  { name: 'الأرجنتين', flag: '🇦🇷', code: 'AR' },
  { name: 'تشيلي', flag: '🇨🇱', code: 'CL' },
  { name: 'جنوب أفريقيا', flag: '🇿🇦', code: 'ZA' },
  { name: 'كينيا', flag: '🇰🇪', code: 'KE' },
  { name: 'نيجيريا', flag: '🇳🇬', code: 'NG' },
  { name: 'غانا', flag: '🇬🇭', code: 'GH' },
]

interface CountrySelectProps {
  label: string
  value: { country: string; flag: string }
  onChange: (value: { country: string; flag: string }) => void
  required?: boolean
  placeholder?: string
}

export function CountrySelect({ label, value, onChange, required = false, placeholder }: CountrySelectProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleValueChange = (selectedValue: string) => {
    const selectedCountry = countries.find(country => country.code === selectedValue)
    if (selectedCountry) {
      onChange({
        country: selectedCountry.name,
        flag: selectedCountry.flag
      })
    }
  }

  const selectedCountry = countries.find(country => 
    country.name === value.country && country.flag === value.flag
  )

  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={label} className="text-right">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </Label>
      <div className="col-span-3">
        <Select
          value={selectedCountry?.code || ''}
          onValueChange={handleValueChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder || 'اختر الدولة'}>
              {selectedCountry && (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedCountry.flag}</span>
                  <span>{selectedCountry.name}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {filteredCountries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{country.flag}</span>
                  <span>{country.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}