'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Palette } from 'lucide-react'

// Predefined Tailwind gradient templates
const tailwindGradients = [
  { name: 'أزرق كلاسيكي', value: 'from-blue-500 to-purple-600' },
  { name: 'أخضر طبيعي', value: 'from-cyan-400 to-blue-500' },
  { name: 'برتقالي دافئ', value: 'from-pink-500 to-yellow-400' },
  { name: 'بنفسجي ملكي', value: 'from-teal-400 to-pink-300' },
  { name: 'أحمر ناري', value: 'from-pink-400 to-pink-200' },
  { name: 'ذهبي فاخر', value: 'from-amber-200 to-orange-400' },
  { name: 'أزرق سماوي', value: 'from-blue-400 to-cyan-300' },
  { name: 'أخضر زمردي', value: 'from-emerald-500 to-teal-500' },
  { name: 'بنفسجي غامق', value: 'from-indigo-500 to-purple-600' },
  { name: 'وردي ناعم', value: 'from-rose-400 to-pink-300' },
  { name: 'أزرق ليلي', value: 'from-blue-600 to-cyan-500' },
  { name: 'أخضر نعناعي', value: 'from-green-400 to-emerald-500' },
  { name: 'برتقالي غروب', value: 'from-orange-500 to-red-500' },
  { name: 'بنفسجي فاتح', value: 'from-purple-400 to-pink-400' },
  { name: 'أزرق فيروزي', value: 'from-teal-500 to-cyan-600' },
  { name: 'أحمر قرمزي', value: 'from-red-500 to-pink-500' },
]

interface TailwindGradientPickerProps {
  label?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
}

export function TailwindGradientPicker({ 
  label, 
  value, 
  onChange, 
  required = false, 
  placeholder 
}: TailwindGradientPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleTemplateSelect = (templateValue: string) => {
    onChange(templateValue)
    setIsOpen(false)
  }

  const getDisplayName = () => {
    const template = tailwindGradients.find(t => t.value === value)
    return template ? template.name : value || placeholder || 'اختر التدرج'
  }

  return (
    <div className={label ? "grid grid-cols-4 items-center gap-4" : ""}>
      {label && (
        <Label htmlFor={label} className="text-right">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </Label>
      )}
      <div className={label ? "col-span-3" : "w-full"}>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-right"
              type="button"
            >
              <div className="flex items-center gap-2 w-full">
                <div
                  className={`w-6 h-6 rounded border border-gray-300 bg-gradient-to-r ${value}`}
                />
                <span className="flex-1 text-right">
                  {getDisplayName()}
                </span>
                <Palette className="w-4 h-4" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              {/* Gradient Templates */}
              <div>
                <h4 className="font-medium mb-2 text-right">قوالب التدرج</h4>
                <div className="grid grid-cols-2 gap-2">
                  {tailwindGradients.map((template) => (
                    <Button
                      key={template.name}
                      variant="outline"
                      className="h-16 p-2 text-xs"
                      onClick={() => handleTemplateSelect(template.value)}
                      type="button"
                    >
                      <div className="flex flex-col items-center gap-1 w-full">
                        <div
                          className={`w-full h-8 rounded bg-gradient-to-r ${template.value}`}
                        />
                        <span className="text-xs">{template.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}