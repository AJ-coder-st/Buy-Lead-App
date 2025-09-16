'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { buyersApi } from '@/lib/api'
import { CSVValidator } from '@/lib/csvValidator'
import { Upload, Download, AlertCircle, CheckCircle, X, FileX, FileCheck } from 'lucide-react'
import toast from 'react-hot-toast'

interface ImportError {
  row: number
  errors: string[]
  data?: any
}

interface ImportResult {
  success: boolean
  message: string
  data: {
    totalRows: number
    successfulImports: number
    failedImports: number
    errors: ImportError[]
    warnings: string[]
  }
}

interface ValidationState {
  isValidating: boolean
  fileValid: boolean
  contentValid: boolean
  errors: string[]
  warnings: string[]
}

export default function ImportBuyersPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [preview, setPreview] = useState<any[] | null>(null)
  const [validation, setValidation] = useState<ValidationState>({
    isValidating: false,
    fileValid: false,
    contentValid: false,
    errors: [],
    warnings: []
  })

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    
    // Reset states
    setFile(null)
    setResult(null)
    setPreview(null)
    setValidation({
      isValidating: false,
      fileValid: false,
      contentValid: false,
      errors: [],
      warnings: []
    })

    if (!selectedFile) return

    try {
      setValidation(prev => ({ ...prev, isValidating: true }))
      
      // Validate file
      const fileValidation = CSVValidator.validateFile(selectedFile)
      if (!fileValidation.isValid) {
        setValidation({
          isValidating: false,
          fileValid: false,
          contentValid: false,
          errors: [fileValidation.error!],
          warnings: []
        })
        toast.error(fileValidation.error!)
        return
      }

      // Validate CSV content
      const contentValidation = await CSVValidator.validateCSVContent(selectedFile)
      
      setValidation({
        isValidating: false,
        fileValid: true,
        contentValid: contentValidation.isValid,
        errors: contentValidation.errors,
        warnings: contentValidation.warnings
      })

      if (contentValidation.errors.length > 0) {
        toast.error(`CSV validation failed: ${contentValidation.errors[0]}`)
      } else if (contentValidation.warnings.length > 0) {
        toast(`CSV has warnings: ${contentValidation.warnings[0]}`, { icon: '⚠️' })
      } else {
        toast.success('CSV file validated successfully')
      }
      
      setFile(selectedFile)
      await previewFile(selectedFile)
      
    } catch (error) {
      setValidation({
        isValidating: false,
        fileValid: false,
        contentValid: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      })
      toast.error('File validation failed')
    }
  }, [])

  const previewFile = useCallback(async (file: File) => {
    try {
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string || '')
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsText(file)
      })

      const lines = text.trim().split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        toast.error('CSV file must have at least a header and one data row')
        return
      }

      // Parse first few rows for preview
      const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, '').trim())
      const previewRows = lines.slice(1, 6).map(line => {
        const values = parseCSVLine(line)
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = (values[index] || '').replace(/"/g, '').trim()
        })
        return row
      })
      
      setPreview(previewRows)
    } catch (error) {
      toast.error('Failed to preview file')
      console.error('Preview error:', error)
    }
  }, [])

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    let i = 0

    while (i < line.length) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"'
          i += 2
          continue
        }
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
      i++
    }

    result.push(current.trim())
    return result
  }

  const handleUpload = useCallback(async () => {
    if (!file || !validation.contentValid) {
      toast.error('Please select a valid CSV file')
      return
    }

    try {
      setUploading(true)
      const response = await buyersApi.importCSV(file)
      
      setResult(response.data)
      
      if (response.data.success) {
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message)
      }
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Import failed'
      toast.error(errorMessage)
      
      setResult({
        success: false,
        message: errorMessage,
        data: {
          totalRows: 0,
          successfulImports: 0,
          failedImports: 0,
          errors: [],
          warnings: []
        }
      })
    } finally {
      setUploading(false)
    }
  }, [file, validation.contentValid])

  const downloadTemplate = useCallback(() => {
    try {
      const csvContent = CSVValidator.generateSampleCSV()
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'buyers-import-template.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('Template downloaded successfully')
    } catch (error) {
      toast.error('Failed to download template')
      console.error('Download error:', error)
    }
  }, [])

  const resetForm = () => {
    setFile(null)
    setResult(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Import Buyers</h1>
            <p className="text-muted-foreground">
              Upload a CSV file to import multiple buyer leads at once
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/buyers')}
          >
            Back to Buyers
          </Button>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Import Instructions</CardTitle>
            <CardDescription>
              Follow these guidelines for a successful import
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">File Requirements:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• CSV format only</li>
                  <li>• Maximum 200 rows</li>
                  <li>• File size under 5MB</li>
                  <li>• UTF-8 encoding recommended</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Required Headers:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• fullName, phone, city, propertyType</li>
                  <li>• purpose, timeline, source</li>
                  <li>• BHK required for Apartment/Villa</li>
                  <li>• All other fields are optional</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Select CSV File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csvFile">CSV File</Label>
              <Input
                id="csvFile"
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={validation.isValidating}
              />
            </div>
            
            {validation.isValidating && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-blue-700">Validating CSV file...</span>
              </div>
            )}
            
            {file && (
              <div className={`p-4 rounded-lg ${
                validation.contentValid 
                  ? 'bg-green-50 border border-green-200' 
                  : validation.errors.length > 0 
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-muted'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {validation.contentValid ? (
                      <FileCheck className="h-5 w-5 text-green-600" />
                    ) : validation.errors.length > 0 ? (
                      <FileX className="h-5 w-5 text-red-600" />
                    ) : (
                      <Upload className="h-5 w-5 text-gray-500" />
                    )}
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetForm}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Validation Status */}
                {validation.errors.length > 0 && (
                  <div className="mt-3 p-2 bg-red-100 rounded border border-red-200">
                    <h4 className="text-sm font-medium text-red-800 mb-1">Validation Errors:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {validation.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {validation.warnings.length > 0 && (
                  <div className="mt-3 p-2 bg-yellow-100 rounded border border-yellow-200">
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">Warnings:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {validation.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        {preview && (
          <Card>
            <CardHeader>
              <CardTitle>File Preview</CardTitle>
              <CardDescription>
                First {preview.length} rows from your CSV file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(preview[0] || {}).map((header) => (
                        <th key={header} className="text-left p-2 font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, index) => (
                      <tr key={index} className="border-b">
                        {Object.values(row).map((value: any, cellIndex) => (
                          <td key={cellIndex} className="p-2 text-muted-foreground">
                            {String(value).substring(0, 50)}
                            {String(value).length > 50 && '...'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleUpload}
                  disabled={uploading || !validation.contentValid}
                  className="flex items-center gap-2"
                >
                  {uploading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Import Buyers
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                Import Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {result.data.successfulImports}
                  </div>
                  <div className="text-sm text-green-700">Successfully Imported</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {result.data.failedImports}
                  </div>
                  <div className="text-sm text-red-700">Rows with Errors</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {result.data.totalRows}
                  </div>
                  <div className="text-sm text-blue-700">Total Rows Processed</div>
                </div>
              </div>

              {result.data.warnings.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-yellow-600">
                    Warnings ({result.data.warnings.length}):
                  </h4>
                  <div className="space-y-1">
                    {result.data.warnings.map((warning: string, index: number) => (
                      <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                        • {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.data.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-destructive">
                    Errors Found ({result.data.errors.length} rows):
                  </h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {result.data.errors.map((error: ImportError, index: number) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                        <div className="font-medium text-red-800">
                          Row {error.row}:
                        </div>
                        <ul className="text-sm text-red-700 mt-1">
                          {error.errors.map((err: string, errIndex: number) => (
                            <li key={errIndex}>• {err}</li>
                          ))}
                        </ul>
                        {error.data && (
                          <details className="mt-2">
                            <summary className="text-xs text-red-600 cursor-pointer">Show raw data</summary>
                            <pre className="text-xs bg-red-100 p-2 rounded mt-1 overflow-x-auto">
                              {JSON.stringify(error.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => router.push('/buyers')}
                  variant={result.data.successfulImports > 0 ? "default" : "outline"}
                >
                  View Imported Buyers
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                >
                  Import Another File
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
