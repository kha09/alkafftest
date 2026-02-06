'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Palette } from 'lucide-react'

// Predefined gradient templates
const gradientTemplates = [
  { name: 'أزرق كلاسيكي', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'أخضر طبيعي', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'برتقالي دافئ', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: 'بنفسجي ملكي', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { name: 'أحمر ناري', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
  { name: 'ذهبي فاخر', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { name: 'أزرق سماوي', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { name: 'أخضر زمردي', value: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' },
  { name: 'بنفسجي غامق', value: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
  { name: 'وردي ناعم', value: 'linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)' },
  { name: 'أزرق ليلي', value: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)' },
  { name: 'أخضر نعناعي', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
]

// Solid color templates
const solidColors = [
  { name: 'أزرق', value: '#2196F3' },
  { name: 'أخضر', value: '#4CAF50' },
  { name: 'أحمر', value: '#F44336' },
  { name: 'برتقالي', value: '#FF9800' },
  { name: 'بنفسجي', value: '#9C27B0' },
  { name: 'وردي', value: '#E91E63' },
  { name: 'تركوازي', value: '#009688' },
  { name: 'أزرق داكن', value: '#3F51B5' },
  { name: 'بني', value: '#795548' },
  { name: 'رمادي', value: '#607D8B' },
]

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
}

export function ColorPicker({ label, value, onChange, required = false, placeholder }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customColor, setCustomColor] = useState('')

  const handleTemplateSelect = (templateValue: string) => {
    onChange(templateValue)
    setIsOpen(false)
  }

  const handleCustomColorSubmit = () => {
    if (customColor) {
      onChange(customColor)
      setCustomColor('')
      setIsOpen(false)
    }
  }

  const getPreviewStyle = (colorValue: string) => {
    if (colorValue.startsWith('linear-gradient')) {
      return { background: colorValue }
    } else {
      return { backgroundColor: colorValue }
    }
  }

  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={label} className="text-right">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </Label>
      <div className="col-span-3">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-right"
              type="button"
            >
              <div className="flex items-center gap-2 w-full">
                <div
                  className="w-6 h-6 rounded border border-gray-300"
                  style={getPreviewStyle(value)}
                />
                <span className="flex-1 text-right">
                  {value || placeholder || 'اختر اللون'}
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
                  {gradientTemplates.map((template) => (
                    <Button
                      key={template.name}
                      variant="outline"
                      className="h-12 p-2 text-xs"
                      onClick={() => handleTemplateSelect(template.value)}
                      type="button"
                    >
                      <div className="flex flex-col items-center gap-1 w-full">
                        <div
                          className="w-full h-6 rounded"
                          style={getPreviewStyle(template.value)}
                        />
                        <span className="text-xs">{template.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Solid Colors */}
              <div>
                <h4 className="font-medium mb-2 text-right">ألوان صلبة</h4>
                <div className="grid grid-cols-5 gap-2">
                  {solidColors.map((color) => (
                    <Button
                      key={color.name}
                      variant="outline"
                      className="h-12 p-1"
                      onClick={() => handleTemplateSelect(color.value)}
                      type="button"
                    >
                      <div className="flex flex-col items-center gap-1 w-full">
                        <div
                          className="w-full h-6 rounded"
                          style={getPreviewStyle(color.value)}
                        />
                        <span className="text-xs">{color.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Color Input */}
              <div>
                <h4 className="font-medium mb-2 text-right">لون مخصص</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="مثال: #FF5733 أو linear-gradient(...)"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="text-right"
                  />
                  <Button onClick={handleCustomColorSubmit} type="button">
                    تطبيق
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}