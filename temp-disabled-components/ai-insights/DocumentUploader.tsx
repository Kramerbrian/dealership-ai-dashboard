"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Brain,
  Eye,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface DocumentUpload {
  id: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadStatus: 'uploading' | 'processing' | 'completed' | 'error';
  analysisData?: {
    summary: string;
    keyInsights: string[];
    recommendations: string[];
    categories: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    metadata: {
      wordCount: number;
      language: string;
      topics: string[];
      entities: string[];
    };
  };
  createdAt: string;
  error?: string;
}

interface DocumentUploaderProps {
  tenantId: string;
  onDocumentAnalyzed?: (document: DocumentUpload) => void;
}

export default function DocumentUploader({ tenantId, onDocumentAnalyzed }: DocumentUploaderProps) {
  const [uploads, setUploads] = useState<DocumentUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    setIsUploading(true);
    
    for (const file of files) {
      await uploadFile(file);
    }
    
    setIsUploading(false);
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tenantId', tenantId);

    // Add to uploads list immediately
    const tempUpload: DocumentUpload = {
      id: `temp_${Date.now()}`,
      fileId: '',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadStatus: 'uploading',
      createdAt: new Date().toISOString()
    };
    
    setUploads(prev => [tempUpload, ...prev]);

    try {
      const response = await fetch('/api/ai/upload-document', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploads(prev => prev.map(upload => 
          upload.id === tempUpload.id 
            ? {
                ...upload,
                id: result.fileId,
                fileId: result.fileId,
                uploadStatus: 'completed',
                analysisData: result.analysis
              }
            : upload
        ));

        if (result.analysis && onDocumentAnalyzed) {
          onDocumentAnalyzed({
            ...tempUpload,
            id: result.fileId,
            fileId: result.fileId,
            uploadStatus: 'completed',
            analysisData: result.analysis
          });
        }
      } else {
        setUploads(prev => prev.map(upload => 
          upload.id === tempUpload.id 
            ? {
                ...upload,
                uploadStatus: 'error',
                error: result.error
              }
            : upload
        ));
      }
    } catch (error) {
      setUploads(prev => prev.map(upload => 
        upload.id === tempUpload.id 
          ? {
              ...upload,
              uploadStatus: 'error',
              error: 'Upload failed'
            }
          : upload
      ));
    }
  };

  const removeUpload = (uploadId: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== uploadId));
  };

  const retryUpload = async (upload: DocumentUpload) => {
    if (upload.uploadStatus === 'error') {
      const file = new File([''], upload.fileName, { type: upload.fileType });
      await uploadFile(file);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-600" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="h-5 w-5 text-blue-600" />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    if (fileType.includes('image')) return <Image className="h-5 w-5 text-purple-600" />;
    return <File className="h-5 w-5 text-gray-600" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <File className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Document Upload & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload documents for AI analysis
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop files here, or click to select files
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports PDF, Word, Excel, and text files up to 10MB
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mb-2"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isUploading ? 'Uploading...' : 'Choose Files'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Upload List */}
      {uploads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              Uploaded Documents ({uploads.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploads.map((upload) => (
                <div key={upload.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getFileIcon(upload.fileType)}
                      <div>
                        <h4 className="font-medium">{upload.fileName}</h4>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(upload.fileSize)} • {upload.fileType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(upload.uploadStatus)}>
                        {getStatusIcon(upload.uploadStatus)}
                        <span className="ml-1 capitalize">{upload.uploadStatus}</span>
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeUpload(upload.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {upload.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
                      <p className="text-sm text-red-800">{upload.error}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryUpload(upload)}
                        className="mt-2"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Retry
                      </Button>
                    </div>
                  )}

                  {upload.analysisData && (
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-900">AI Analysis Complete</span>
                          <Badge variant="outline" className="text-green-700">
                            {Math.floor(upload.analysisData.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-green-800">
                          {upload.analysisData.summary}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium mb-2">Key Insights:</h5>
                          <ul className="space-y-1">
                            {upload.analysisData.keyInsights.slice(0, 3).map((insight, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Recommendations:</h5>
                          <ul className="space-y-1">
                            {upload.analysisData.recommendations.slice(0, 3).map((rec, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                <div className="w-1 h-1 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Sentiment: {upload.analysisData.sentiment}</span>
                          <span>Topics: {upload.analysisData.metadata.topics.join(', ')}</span>
                          <span>Words: {upload.analysisData.metadata.wordCount}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View Full Analysis
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
