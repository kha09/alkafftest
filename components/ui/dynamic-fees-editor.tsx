'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Plus } from 'lucide-react'

interface FeeItem {
  year?: string
  description?: string
  fee: string
}

interface DynamicFeesEditorProps {
  label: string
  value: string
  onChange: (value: string) => void
  type: 'yearly' | 'other'
}

export function DynamicFeesEditor({ label, value, onChange, type }: DynamicFeesEditorProps) {
  const [items, setItems] = useState<FeeItem[]>([])
  const [error, setError] = useState<string | null>(null)

  // Parse JSON value to items on component mount and value change
  useEffect(() => {
    try {
      if (value && value.trim()) {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        } else {
          setItems([])
        }
      } else {
        setItems([])
      }
      setError(null)
    } catch (e) {
      setError('تنسيق JSON غير صحيح')
      setItems([])
    }
  }, [value])

  // Convert items back to JSON and call onChange
  const updateValue = (newItems: FeeItem[]) => {
    setItems(newItems)
    try {
      const jsonValue = newItems.length > 0 ? JSON.stringify(newItems, null, 2) : ''
      onChange(jsonValue)
      setError(null)
    } catch (e) {
      setError('خطأ في تحويل البيانات')
    }
  }

  const addItem = () => {
    const newItem: FeeItem = type === 'yearly' 
      ? { year: '', fee: '' }
      : { description: '', fee: '' }
    updateValue([...items, newItem])
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    updateValue(newItems)
  }

  const updateItem = (index: number, field: keyof FeeItem, value: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    updateValue(newItems)
  }

  const validateItems = () => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (type === 'yearly') {
        if (!item.year || !item.fee) {
          setError(`العنصر ${i + 1}: السنة والرسوم مطلوبان`)
          return false
        }
      } else {
        if (!item.description || !item.fee) {
          setError(`العنصر ${i + 1}: الوصف والرسوم مطلوبان`)
          return false
        }
      }
    }
    setError(null)
    return true
  }

  useEffect(() => {
    if (items.length > 0) {
      validateItems()
    }
  }, [items])

  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <div className="col-span-3 space-y-4">
        {items.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground text-center mb-4">
                لا توجد عناصر مضافة بعد
              </p>
              <Button onClick={addItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 ml-2" />
                إضافة {type === 'yearly' ? 'سنة دراسية' : 'رسوم إضافية'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {items.map((item, index) => (
              <Card key={index} className="relative">
                <CardContent className="pt-6">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Label htmlFor={`${type}-${index}-${type === 'yearly' ? 'year' : 'description'}`} className="text-sm font-medium">
                        {type === 'yearly' ? 'السنة الدراسية' : 'وصف الرسوم'}
                      </Label>
                      <Input
                        id={`${type}-${index}-${type === 'yearly' ? 'year' : 'description'}`}
                        value={type === 'yearly' ? item.year || '' : item.description || ''}
                        onChange={(e) => updateItem(index, type === 'yearly' ? 'year' : 'description', e.target.value)}
                        placeholder={type === 'yearly' ? 'مثال: السنة الأولى' : 'مثال: رسوم التسجيل الدولية'}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`${type}-${index}-fee`} className="text-sm font-medium">
                        المبلغ
                      </Label>
                      <Input
                        id={`${type}-${index}-fee`}
                        value={item.fee}
                        onChange={(e) => updateItem(index, 'fee', e.target.value)}
                        placeholder="مثال: USD 5,764"
                        className="mt-1"
                      />
                    </div>
                    <Button
                      onClick={() => removeItem(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button onClick={addItem} variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 ml-2" />
              إضافة {type === 'yearly' ? 'سنة دراسية أخرى' : 'رسوم إضافية أخرى'}
            </Button>
          </>
        )}
        
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        
        {items.length > 0 && !error && (
          <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
            <strong>معاينة JSON:</strong>
            <pre className="mt-1 whitespace-pre-wrap font-mono text-xs">
              {JSON.stringify(items, null, 2)}
            </pre>
          </div>
        )}
      </div>
      <Label className="text-end pt-2">
        {label}
      </Label>
    </div>
  )
}