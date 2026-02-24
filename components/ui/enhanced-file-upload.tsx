'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, X, Eye, FileImage } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

interface EnhancedFileUploadProps {
  label: string
  value: File | string | null
  onChange: (file: File | string | null) => void
  accept?: string
  maxSize?: number // in MB
  required?: boolean
  preview?: string // URL for existing file preview
}

export function EnhancedFileUpload({ 
  label, 
  value, 
  onChange, 
  accept = "image/*", 
  maxSize = 5,
  required = false,
  preview 
}: EnhancedFileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview || (typeof value === 'string' ? value : null))
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Determine if we have a file or a string URL
  const hasFile = value instanceof File
  const hasPreview = typeof value === 'string' && value.length > 0
  const showPreview = previewUrl && !hasFile

  const validateFile = (file: File): boolean => {
    setError(null)

    // Check file type
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      setError('نوع الملف غير مدعوم. يرجى رفع صورة (JPG, PNG)')
      return false
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setError(`حجم الملف كبير جداً. الحد الأقصى ${maxSize} ميجابايت`)
      return false
    }

    return true
  }

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      onChange(file)
      
      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
      }
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleRemove = () => {
    onChange(null)
    setPreviewUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label htmlFor={label} className="text-right pt-2">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </Label>
      <div className="col-span-3 space-y-2">
        {/* File Upload Area */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${error ? 'border-red-500 bg-red-50' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />
          
          {value || previewUrl ? (
            <div className="space-y-3">
              {/* File Preview */}
              <div className="flex items-center justify-center">
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="معاينة الشعار"
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                          type="button"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <img
                          src={previewUrl}
                          alt="معاينة الشعار"
                          className="w-full h-auto rounded-lg"
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <FileImage className="w-12 h-12 text-gray-400" />
                )}
              </div>
              
              {/* File Info */}
              <div className="text-sm text-gray-600">
                {value ? (
                  <div>
                    <p className="font-medium">{value.name}</p>
                    <p className="text-xs">{(value.size / 1024 / 1024).toFixed(2)} ميجابايت</p>
                  </div>
                ) : (
                  <p>الملف الحالي</p>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    openFileDialog()
                  }}
                  type="button"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  تغيير الملف
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove()
                  }}
                  type="button"
                >
                  <X className="w-4 h-4 mr-2" />
                  إزالة
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  اسحب وأفلت الملف هنا
                </p>
                <p className="text-sm text-gray-500">
                  أو انقر لاختيار ملف
                </p>
              </div>
              <p className="text-xs text-gray-400">
                الحد الأقصى: {maxSize} ميجابايت
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 text-right">{error}</p>
        )}

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-right">
          يُفضل رفع شعار بخلفية شفافة (PNG) أو بجودة عالية (JPG)
        </p>
      </div>
    </div>
  )
}