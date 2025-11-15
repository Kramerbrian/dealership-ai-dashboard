/**
 * Bulk CSV Upload Dialog Component
 * Provides drag-drop CSV upload with preview, validation, and commit
 *
 * @component BulkUploadDialog
 */

'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ValidationError {
  line: number
  origin: string
  reason: string
}

interface PreviewData {
  origin: string
  tenant: string
  display_name?: string
  checksum: string
}

interface UploadCounts {
  parsed: number
  valid: number
  invalid: number
  duplicates: number
}

interface BulkUploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (batchId: string) => void
  tenantId: string
}

export default function BulkUploadDialog({
  isOpen,
  onClose,
  onSuccess,
  tenantId
}: BulkUploadDialogProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'committing' | 'success' | 'error'>('upload')
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadId, setUploadId] = useState<string>('')
  const [fileChecksum, setFileChecksum] = useState<string>('')
  const [preview, setPreview] = useState<PreviewData[]>([])
  const [counts, setCounts] = useState<UploadCounts>({ parsed: 0, valid: 0, invalid: 0, duplicates: 0 })
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [commitResult, setCommitResult] = useState<any>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = useCallback(() => {
    setStep('upload')
    setFile(null)
    setUploadId('')
    setFileChecksum('')
    setPreview([])
    setCounts({ parsed: 0, valid: 0, invalid: 0, duplicates: 0 })
    setErrors([])
    setErrorMessage('')
    setCommitResult(null)
    setIsDragging(false)
  }, [])

  const handleClose = useCallback(() => {
    reset()
    onClose()
  }, [reset, onClose])

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const csvFile = files.find(f => f.type === 'text/csv' || f.name.endsWith('.csv'))

    if (csvFile) {
      setFile(csvFile)
      uploadFile(csvFile)
    } else {
      setErrorMessage('Please upload a CSV file')
      setStep('error')
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setFile(files[0])
      uploadFile(files[0])
    }
  }, [])

  const uploadFile = async (file: File) => {
    try {
      setStep('preview')
      setErrorMessage('')

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/origins/bulk-csv', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      })

      const result = await response.json()

      if (!(result as any).ok) {
        setErrorMessage((result as any).error || 'Upload failed')
        setStep('error')
        return
      }

      // Set preview data
      setUploadId((result as any).uploadId)
      setFileChecksum((result as any).fileChecksum)
      setPreview((result as any).preview || [])
      setCounts((result as any).counts || { parsed: 0, valid: 0, invalid: 0, duplicates: 0 })
      setErrors((result as any).invalid || [])

    } catch (error: any) {
      setErrorMessage(error.message || 'Network error')
      setStep('error')
    }
  }

  const handleCommit = async () => {
    try {
      setStep('committing')

      const response = await fetch('/api/origins/bulk-csv/commit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          uploadId,
          fileChecksum,
          fileName: file?.name,
          rows: preview
        })
      })

      const result = await response.json()

      if (!(result as any).ok) {
        setErrorMessage((result as any).error || 'Commit failed')
        setStep('error')
        return
      }

      setCommitResult((result as any).results)
      setStep('success')

      if (onSuccess && (result as any).batchId) {
        onSuccess((result as any).batchId)
      }

    } catch (error: any) {
      setErrorMessage(error.message || 'Network error')
      setStep('error')
    }
  }

  const downloadTemplate = () => {
    const csvContent = 'origin,tenant,display_name,priority_level,tags,notes\n' +
      'https://example-dealership.com,demo-tenant,Example Dealership,high,"automotive,dealer",Optional notes\n' +
      'example2.com,,Another Dealer,medium,"car,sales",\n'

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'origins_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold text-white">Bulk Upload Origins</h2>
              <p className="text-sm text-gray-400 mt-1">
                Upload CSV file to add multiple dealership origins
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Upload Step */}
            {step === 'upload' && (
              <div className="space-y-6">
                {/* Drag Drop Zone */}
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
                    ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 hover:border-white/40 bg-white/5'}
                  `}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-xl font-semibold text-white mb-2">
                    Drop CSV file here or click to browse
                  </p>
                  <p className="text-sm text-gray-400">
                    Supports files up to 100MB
                  </p>
                </div>

                {/* Template Download */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-300 mb-1">
                        Need a template?
                      </p>
                      <p className="text-xs text-gray-400 mb-3">
                        Download our CSV template with example data and column descriptions.
                      </p>
                      <button
                        onClick={downloadTemplate}
                        className="text-sm text-blue-400 hover:text-blue-300 underline"
                      >
                        Download Template
                      </button>
                    </div>
                  </div>
                </div>

                {/* CSV Format Info */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">CSV Format</h3>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p><span className="text-white font-mono">origin</span> - Required: Domain or URL</p>
                    <p><span className="text-white font-mono">tenant</span> - Optional: Defaults to your tenant</p>
                    <p><span className="text-white font-mono">display_name</span> - Optional: Friendly name</p>
                    <p><span className="text-white font-mono">priority_level</span> - Optional: low, medium, high, critical</p>
                    <p><span className="text-white font-mono">tags</span> - Optional: Comma-separated tags</p>
                    <p><span className="text-white font-mono">notes</span> - Optional: Additional notes</p>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Step */}
            {step === 'preview' && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white">{counts.parsed}</div>
                    <div className="text-xs text-gray-400">Total Rows</div>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">{counts.valid}</div>
                    <div className="text-xs text-gray-400">Valid</div>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-400">{counts.invalid}</div>
                    <div className="text-xs text-gray-400">Invalid</div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-yellow-400">{counts.duplicates}</div>
                    <div className="text-xs text-gray-400">Duplicates</div>
                  </div>
                </div>

                {/* Preview Table */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Preview (first 50 rows)</h3>
                  <div className="bg-white/5 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-white/10">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Origin</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Display Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Tenant</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {preview.slice(0, 20).map((row, idx) => (
                            <tr key={idx} className="hover:bg-white/5">
                              <td className="px-4 py-2 text-white font-mono text-xs">{row.origin}</td>
                              <td className="px-4 py-2 text-gray-300 text-xs">{row.display_name || '-'}</td>
                              <td className="px-4 py-2 text-gray-400 text-xs">{row.tenant}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Validation Errors */}
                {errors.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-red-400 mb-3">
                      Validation Errors ({errors.length})
                    </h3>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-h-48 overflow-y-auto">
                      <div className="space-y-2">
                        {errors.slice(0, 10).map((err, idx) => (
                          <div key={idx} className="text-xs">
                            <span className="text-red-400 font-mono">Line {err.line}:</span>
                            <span className="text-gray-300 ml-2">{err.origin}</span>
                            <span className="text-gray-400 ml-2">- {err.reason}</span>
                          </div>
                        ))}
                        {errors.length > 10 && (
                          <p className="text-xs text-gray-400 mt-2">
                            ...and {errors.length - 10} more errors
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Committing Step */}
            {step === 'committing' && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-lg font-semibold text-white">Committing Origins...</p>
                <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
              </div>
            )}

            {/* Success Step */}
            {step === 'success' && commitResult && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Upload Complete!</h3>
                  <p className="text-gray-400">Your origins have been successfully imported</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-400">{commitResult.inserted}</div>
                    <div className="text-xs text-gray-400 mt-1">Inserted</div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-400">{commitResult.updated}</div>
                    <div className="text-xs text-gray-400 mt-1">Updated</div>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-red-400">{commitResult.failed}</div>
                    <div className="text-xs text-gray-400 mt-1">Failed</div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Step */}
            {step === 'error' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Upload Failed</h3>
                <p className="text-red-400 text-sm">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-white/10 bg-white/5">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              {step === 'success' ? 'Close' : 'Cancel'}
            </button>

            {step === 'preview' && (
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCommit}
                  disabled={counts.valid === 0}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Commit {counts.valid} Origins
                </button>
              </div>
            )}

            {step === 'success' && (
              <button
                onClick={handleClose}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Done
              </button>
            )}

            {step === 'error' && (
              <button
                onClick={reset}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
