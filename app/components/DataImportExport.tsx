'use client';
import React, { useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';
import { unparse } from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ImportJob {
  id: string;
  fileName: string;
  fileType: 'csv' | 'excel' | 'json' | 'xml';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  recordsTotal: number;
  recordsProcessed: number;
  recordsFailed: number;
  startTime: Date;
  endTime?: Date;
  errorMessage?: string;
  dataPreview?: any[];
}

interface ExportJob {
  id: string;
  name: string;
  format: 'csv' | 'excel' | 'pdf' | 'json';
  dataType: 'sales' | 'inventory' | 'customers' | 'analytics' | 'custom';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  recordCount: number;
  startTime: Date;
  endTime?: Date;
  downloadUrl?: string;
  filters?: Record<string, any>;
}

interface DataTemplate {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'inventory' | 'customers' | 'marketing' | 'finance';
  fields: string[];
  sampleData: any[];
  downloadUrl: string;
}

const DataImportExport: React.FC = () => {
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [dataTemplates, setDataTemplates] = useState<DataTemplate[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importConfig, setImportConfig] = useState({
    dataType: 'sales' as const,
    mapping: {} as Record<string, string>,
    skipFirstRow: true,
    delimiter: ','
  });
  const [exportConfig, setExportConfig] = useState({
    dataType: 'sales' as const,
    format: 'csv' as const,
    dateRange: { start: '', end: '' },
    filters: {} as Record<string, any>
  });
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    // Mock data templates
    const mockTemplates: DataTemplate[] = [
      {
        id: 'template-1',
        name: 'Sales Data Import',
        description: 'Import sales transactions, customer information, and vehicle details',
        category: 'sales',
        fields: ['customer_id', 'vehicle_vin', 'sale_date', 'sale_price', 'salesperson', 'financing_type'],
        sampleData: [
          { customer_id: 'CUST001', vehicle_vin: '1HGBH41JXMN109186', sale_date: '2024-01-15', sale_price: 25000, salesperson: 'John Smith', financing_type: 'Loan' },
          { customer_id: 'CUST002', vehicle_vin: '1HGBH41JXMN109187', sale_date: '2024-01-16', sale_price: 32000, salesperson: 'Jane Doe', financing_type: 'Cash' }
        ],
        downloadUrl: '/templates/sales-import-template.csv'
      },
      {
        id: 'template-2',
        name: 'Inventory Import',
        description: 'Import vehicle inventory with specifications and pricing',
        category: 'inventory',
        fields: ['vin', 'make', 'model', 'year', 'mileage', 'price', 'condition', 'location'],
        sampleData: [
          { vin: '1HGBH41JXMN109186', make: 'Honda', model: 'Civic', year: 2023, mileage: 15000, price: 25000, condition: 'Excellent', location: 'Lot A' },
          { vin: '1HGBH41JXMN109187', make: 'Toyota', model: 'Camry', year: 2022, mileage: 25000, price: 28000, condition: 'Good', location: 'Lot B' }
        ],
        downloadUrl: '/templates/inventory-import-template.csv'
      },
      {
        id: 'template-3',
        name: 'Customer Data Import',
        description: 'Import customer contact information and preferences',
        category: 'customers',
        fields: ['customer_id', 'first_name', 'last_name', 'email', 'phone', 'address', 'preferred_contact'],
        sampleData: [
          { customer_id: 'CUST001', first_name: 'John', last_name: 'Smith', email: 'john@email.com', phone: '555-0123', address: '123 Main St', preferred_contact: 'Email' },
          { customer_id: 'CUST002', first_name: 'Jane', last_name: 'Doe', email: 'jane@email.com', phone: '555-0456', address: '456 Oak Ave', preferred_contact: 'Phone' }
        ],
        downloadUrl: '/templates/customer-import-template.csv'
      }
    ];

    setDataTemplates(mockTemplates);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };

  const processImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to import');
      return;
    }

    setIsImporting(true);
    const importJob: ImportJob = {
      id: `import-${Date.now()}`,
      fileName: selectedFile.name,
      fileType: selectedFile.name.split('.').pop() as any || 'csv',
      status: 'processing',
      recordsTotal: 0,
      recordsProcessed: 0,
      recordsFailed: 0,
      startTime: new Date()
    };

    setImportJobs(prev => [importJob, ...prev]);
    toast.loading('Processing import...', { id: 'import-process' });

    // Simulate file processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulate processing results
    const totalRecords = Math.floor(Math.random() * 10000) + 1000;
    const failedRecords = Math.floor(Math.random() * 50);
    const processedRecords = totalRecords - failedRecords;

    setImportJobs(prev => prev.map(job => 
      job.id === importJob.id ? {
        ...job,
        status: failedRecords > 0 ? 'completed' : 'completed',
        recordsTotal: totalRecords,
        recordsProcessed: processedRecords,
        recordsFailed: failedRecords,
        endTime: new Date(),
        dataPreview: generateDataPreview(importConfig.dataType)
      } : job
    ));

    toast.success(`Import completed! ${processedRecords} records processed, ${failedRecords} failed`, { id: 'import-process' });
    setIsImporting(false);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateDataPreview = (dataType: string) => {
    const previews = {
      sales: [
        { customer_id: 'CUST001', vehicle_vin: '1HGBH41JXMN109186', sale_date: '2024-01-15', sale_price: 25000 },
        { customer_id: 'CUST002', vehicle_vin: '1HGBH41JXMN109187', sale_date: '2024-01-16', sale_price: 32000 },
        { customer_id: 'CUST003', vehicle_vin: '1HGBH41JXMN109188', sale_date: '2024-01-17', sale_price: 28000 }
      ],
      inventory: [
        { vin: '1HGBH41JXMN109186', make: 'Honda', model: 'Civic', year: 2023, price: 25000 },
        { vin: '1HGBH41JXMN109187', make: 'Toyota', model: 'Camry', year: 2022, price: 28000 },
        { vin: '1HGBH41JXMN109188', make: 'Ford', model: 'F-150', year: 2023, price: 45000 }
      ],
      customers: [
        { customer_id: 'CUST001', first_name: 'John', last_name: 'Smith', email: 'john@email.com' },
        { customer_id: 'CUST002', first_name: 'Jane', last_name: 'Doe', email: 'jane@email.com' },
        { customer_id: 'CUST003', first_name: 'Bob', last_name: 'Johnson', email: 'bob@email.com' }
      ]
    };
    return previews[dataType as keyof typeof previews] || [];
  };

  const generateExport = async () => {
    setIsExporting(true);
    const exportJob: ExportJob = {
      id: `export-${Date.now()}`,
      name: `${exportConfig.dataType} Export`,
      format: exportConfig.format,
      dataType: exportConfig.dataType,
      status: 'generating',
      recordCount: 0,
      startTime: new Date(),
      filters: exportConfig.filters
    };

    setExportJobs(prev => [exportJob, ...prev]);
    toast.loading('Generating export...', { id: 'export-generate' });

    // Simulate export generation
    await new Promise(resolve => setTimeout(resolve, 4000));

    const recordCount = Math.floor(Math.random() * 50000) + 1000;
    const downloadUrl = generateDownloadUrl(exportConfig.format, exportConfig.dataType);

    setExportJobs(prev => prev.map(job => 
      job.id === exportJob.id ? {
        ...job,
        status: 'completed',
        recordCount,
        endTime: new Date(),
        downloadUrl
      } : job
    ));

    toast.success(`Export completed! ${recordCount} records generated`, { id: 'export-generate' });
    setIsExporting(false);
  };

  const generateDownloadUrl = (format: string, dataType: string) => {
    // In a real app, this would generate actual files
    return `#download-${format}-${dataType}-${Date.now()}`;
  };

  const downloadTemplate = (template: DataTemplate) => {
    // Generate CSV content
    const csvContent = unparse(template.sampleData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}-template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success(`Downloaded ${template.name} template`);
  };

  const downloadExport = (job: ExportJob) => {
    if (!job.downloadUrl) return;
    
    // Simulate download
    toast.success(`Downloading ${job.name}...`);
    // In a real app, this would trigger the actual download
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'processing':
      case 'generating': return '#3b82f6';
      case 'failed': return '#ef4444';
      case 'pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'csv': return '📊';
      case 'excel': return '📈';
      case 'json': return '🔧';
      case 'xml': return '📄';
      case 'pdf': return '📋';
      default: return '📁';
    }
  };

  return (
    <div className="data-import-export">
      <h3>📥📤 Data Import & Export Hub</h3>
      <p>Import data from external sources and export comprehensive reports in multiple formats.</p>

      {/* Import Section */}
      <div className="import-section">
        <h4>📥 Data Import</h4>
        
        {/* File Upload */}
        <div className="file-upload">
          <div className="upload-area">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.json,.xml"
              onChange={handleFileSelect}
              className="file-input"
            />
            <div className="upload-content">
              <div className="upload-icon">📁</div>
              <h5>Select File to Import</h5>
              <p>Supported formats: CSV, Excel, JSON, XML</p>
              {selectedFile && (
                <div className="selected-file">
                  <span className="file-icon">{getFileTypeIcon(selectedFile.name.split('.').pop() || '')}</span>
                  <span className="file-name">{selectedFile.name}</span>
                  <span className="file-size">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Import Configuration */}
        <div className="import-config">
          <h5>Import Configuration</h5>
          <div className="config-form">
            <div className="form-row">
              <div className="form-group">
                <label>Data Type</label>
                <select
                  value={importConfig.dataType}
                  onChange={(e: any) => setImportConfig(prev => ({ ...prev, dataType: e.target.value as any }))}
                >
                  <option value="sales">Sales Data</option>
                  <option value="inventory">Inventory</option>
                  <option value="customers">Customer Data</option>
                  <option value="marketing">Marketing Data</option>
                </select>
              </div>
              <div className="form-group">
                <label>Delimiter</label>
                <select
                  value={importConfig.delimiter}
                  onChange={(e: any) => setImportConfig(prev => ({ ...prev, delimiter: e.target.value }))}
                >
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="\t">Tab</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={importConfig.skipFirstRow}
                    onChange={(e: any) => setImportConfig(prev => ({ ...prev, skipFirstRow: e.target.checked }))}
                  />
                  Skip First Row (Headers)
                </label>
              </div>
            </div>
            <button
              onClick={processImport}
              disabled={!selectedFile || isImporting}
              className="import-button"
            >
              {isImporting ? 'Processing...' : 'Start Import'}
            </button>
          </div>
        </div>

        {/* Import Jobs */}
        <div className="import-jobs">
          <h5>Import Jobs</h5>
          <div className="jobs-list">
            {importJobs.map(job => (
              <div key={job.id} className={`job-card ${job.status}`}>
                <div className="job-header">
                  <div className="job-info">
                    <span className="file-icon">{getFileTypeIcon(job.fileType)}</span>
                    <div>
                      <h6>{job.fileName}</h6>
                      <span className="job-time">{job.startTime.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className={`job-status ${job.status}`} style={{ backgroundColor: getStatusColor(job.status) }}>
                    {job.status}
                  </span>
                </div>
                <div className="job-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${job.recordsTotal > 0 ? (job.recordsProcessed / job.recordsTotal) * 100 : 0}%`,
                        backgroundColor: getStatusColor(job.status)
                      }}
                    />
                  </div>
                  <div className="progress-text">
                    {job.recordsProcessed.toLocaleString()} / {job.recordsTotal.toLocaleString()} records
                    {job.recordsFailed > 0 && (
                      <span className="failed-count"> ({job.recordsFailed} failed)</span>
                    )}
                  </div>
                </div>
                {job.dataPreview && job.dataPreview.length > 0 && (
                  <div className="data-preview">
                    <h6>Data Preview:</h6>
                    <div className="preview-table">
                      <table>
                        <thead>
                          <tr>
                            {Object.keys(job.dataPreview[0]).map(key => (
                              <th key={key}>{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {job.dataPreview.slice(0, 3).map((row, index) => (
                            <tr key={index}>
                              {Object.values(row).map((value, i) => (
                                <td key={i}>{String(value)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="export-section">
        <h4>📤 Data Export</h4>
        
        {/* Export Configuration */}
        <div className="export-config">
          <div className="config-form">
            <div className="form-row">
              <div className="form-group">
                <label>Data Type</label>
                <select
                  value={exportConfig.dataType}
                  onChange={(e: any) => setExportConfig(prev => ({ ...prev, dataType: e.target.value as any }))}
                >
                  <option value="sales">Sales Data</option>
                  <option value="inventory">Inventory</option>
                  <option value="customers">Customer Data</option>
                  <option value="analytics">Analytics</option>
                  <option value="custom">Custom Query</option>
                </select>
              </div>
              <div className="form-group">
                <label>Export Format</label>
                <select
                  value={exportConfig.format}
                  onChange={(e: any) => setExportConfig(prev => ({ ...prev, format: e.target.value as any }))}
                >
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="pdf">PDF Report</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date Range</label>
                <div className="date-range">
                  <input
                    type="date"
                    value={exportConfig.dateRange.start}
                    onChange={(e: any) => setExportConfig(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={exportConfig.dateRange.end}
                    onChange={(e: any) => setExportConfig(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>
            <button
              onClick={generateExport}
              disabled={isExporting}
              className="export-button"
            >
              {isExporting ? 'Generating...' : 'Generate Export'}
            </button>
          </div>
        </div>

        {/* Export Jobs */}
        <div className="export-jobs">
          <h5>Export Jobs</h5>
          <div className="jobs-list">
            {exportJobs.map(job => (
              <div key={job.id} className={`job-card ${job.status}`}>
                <div className="job-header">
                  <div className="job-info">
                    <span className="file-icon">{getFileTypeIcon(job.format)}</span>
                    <div>
                      <h6>{job.name}</h6>
                      <span className="job-time">{job.startTime.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="job-actions">
                    <span className={`job-status ${job.status}`} style={{ backgroundColor: getStatusColor(job.status) }}>
                      {job.status}
                    </span>
                    {job.status === 'completed' && job.downloadUrl && (
                      <button
                        onClick={() => downloadExport(job)}
                        className="download-button"
                      >
                        Download
                      </button>
                    )}
                  </div>
                </div>
                <div className="job-details">
                  <div className="detail">
                    <span className="label">Format:</span>
                    <span className="value">{job.format.toUpperCase()}</span>
                  </div>
                  <div className="detail">
                    <span className="label">Records:</span>
                    <span className="value">{job.recordCount.toLocaleString()}</span>
                  </div>
                  {job.endTime && (
                    <div className="detail">
                      <span className="label">Duration:</span>
                      <span className="value">
                        {Math.round((job.endTime.getTime() - job.startTime.getTime()) / 1000)}s
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Templates */}
      <div className="data-templates">
        <h4>📋 Import Templates</h4>
        <p>Download pre-formatted templates to ensure your data imports correctly.</p>
        <div className="templates-grid">
          {dataTemplates.map(template => (
            <div key={template.id} className="template-card">
              <div className="template-header">
                <h5>{template.name}</h5>
                <span className="template-category">{template.category}</span>
              </div>
              <p className="template-description">{template.description}</p>
              <div className="template-fields">
                <h6>Required Fields:</h6>
                <div className="fields-list">
                  {template.fields.map((field, index) => (
                    <span key={index} className="field-tag">{field}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => downloadTemplate(template)}
                className="download-template-button"
              >
                📥 Download Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Import/Export Analytics */}
      <div className="import-export-analytics">
        <h4>📊 Import/Export Analytics</h4>
        <div className="analytics-charts">
          <div className="chart-container">
            <h5>Data Volume Trends (Last 30 Days)</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { day: 'Week 1', imports: 15000, exports: 8000 },
                { day: 'Week 2', imports: 18000, exports: 12000 },
                { day: 'Week 3', imports: 22000, exports: 15000 },
                { day: 'Week 4', imports: 19000, exports: 11000 }
              ]}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="imports" fill="#3b82f6" name="Records Imported" />
                <Bar dataKey="exports" fill="#10b981" name="Records Exported" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataImportExport;
