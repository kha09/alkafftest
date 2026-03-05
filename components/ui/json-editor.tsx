'use client'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'

interface JsonEditorProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  requiredFields?: string[]
}

export function JsonEditor({ label, value, onChange, placeholder, requiredFields }: JsonEditorProps) {
  const [error, setError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (isFocused) return
    
    try {
      if (value) {
        const parsed = JSON.parse(value)
        
        // Check if required fields are present
        if (requiredFields && Array.isArray(parsed)) {
          for (const item of parsed) {
            for (const field of requiredFields) {
              if (!(field in item)) {
                throw new Error(`الحقل "${field}" مطلوب في كل عنصر`)
              }
            }
          }
        }
      }
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تنسيق JSON غير صحيح')
    }
  }, [value, requiredFields, isFocused])

  const handleFocus = () => {
    setIsFocused(true)
    setError(null)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <div className="col-span-3">
        <Textarea
          id={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`min-h-[100px] ${error ? 'border-red-500' : ''}`}
        />
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
        {!error && placeholder && (
          <p className="text-sm text-gray-500 mt-1">
            مثال: {placeholder}
          </p>
        )}
      </div>
      <Label htmlFor={label} className="text-end pt-2">
        {label}
      </Label>
    </div>
  )
}
