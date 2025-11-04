/**
 * Chart Export Utilities
 * Helper functions for exporting chart data in various formats
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { unparse } from 'papaparse';

export interface ExportMetadata {
  title: string;
  description?: string;
  author?: string;
  date?: string;
  dataSource?: string;
}

export interface ChartExportOptions {
  filename?: string;
  includeMetadata?: boolean;
  metadata?: ExportMetadata;
}

/**
 * Export chart data to PDF
 */
export async function exportChartToPDF(
  data: any[],
  columns: { key: string; label: string }[],
  options: ChartExportOptions = {}
): Promise<void> {
  const pdf = new jsPDF();
  const pdfWidth = pdf.internal.pageWidth;
  const pdfHeight = pdf.internal.pageHeight;
  const { filename, includeMetadata = true, metadata } = options;

  // Add title
  pdf.setFontSize(18);
  const title = metadata?.title || options.title || 'Chart Data';
  pdf.text(title, pdfWidth / 2, 20, { align: 'center' });

  // Add description
  if (includeMetadata && metadata?.description) {
    pdf.setFontSize(12);
    pdf.text(metadata.description, pdfWidth / 2, 30, { align: 'center' });
  }

  // Add metadata
  let yPos = includeMetadata ? 40 : 25;
  if (includeMetadata) {
    pdf.setFontSize(10);
    if (metadata?.author) {
      pdf.text(`Author: ${metadata.author}`, 20, yPos);
      yPos += 5;
    }
    if (metadata?.date) {
      pdf.text(`Date: ${metadata.date}`, 20, yPos);
      yPos += 5;
    }
    if (metadata?.dataSource) {
      pdf.text(`Data Source: ${metadata.dataSource}`, 20, yPos);
      yPos += 5;
    }
  }

  // Prepare table data
  const tableData = data.map((item) => {
    const row: any = {};
    columns.forEach((col) => {
      row[col.label] = item[col.key]?.toString() || '';
    });
    return row;
  });

  // Export as table
  autoTable(pdf, {
    head: [columns.map((col) => col.label)],
    body: tableData.map((row) => columns.map((col) => row[col.label] || '')),
    startY: yPos,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // Save PDF
  const finalFilename =
    filename || `${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  pdf.save(finalFilename);
}

/**
 * Export chart data to CSV
 */
export function exportChartToCSV(
  data: any[],
  columns: { key: string; label: string }[],
  options: ChartExportOptions = {}
): void {
  const csvData = data.map((item) => {
    const row: any = {};
    columns.forEach((col) => {
      row[col.label] = item[col.key] || '';
    });
    return row;
  });

  const csv = unparse(csvData, {
    header: true,
    delimiter: ',',
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  const filename =
    options.filename ||
    `${(options.metadata?.title || 'chart_data').replace(/\s+/g, '_')}_${Date.now()}.csv`;
  link.download = filename;
  link.click();
}

/**
 * Export chart data to Excel (XLSX)
 */
export async function exportChartToExcel(
  data: any[],
  columns: { key: string; label: string }[],
  options: ChartExportOptions = {}
): Promise<void> {
  try {
    const XLSX = (await import('xlsx')).default;

    const wsData = [
      columns.map((col) => col.label), // Header
      ...data.map((item) =>
        columns.map((col) => item[col.key] || '')
      ),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    const sheetName =
      (options.metadata?.title || 'Chart Data').substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Add metadata if needed
    if (options.includeMetadata && options.metadata) {
      const metadataSheet = XLSX.utils.aoa_to_sheet([
        ['Title', options.metadata.title || ''],
        ['Description', options.metadata.description || ''],
        ['Author', options.metadata.author || ''],
        ['Date', options.metadata.date || new Date().toISOString()],
        ['Data Source', options.metadata.dataSource || ''],
      ]);
      XLSX.utils.book_append_sheet(wb, metadataSheet, 'Metadata');
    }

    const filename =
      options.filename ||
      `${(options.metadata?.title || 'chart_data').replace(/\s+/g, '_')}_${Date.now()}.xlsx`;
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Excel export failed. Please ensure xlsx package is installed.');
  }
}

/**
 * Export chart as PNG image
 */
export async function exportChartToPNG(
  element: HTMLElement,
  options: ChartExportOptions = {}
): Promise<void> {
  try {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(element, {
      backgroundColor: '#1f2937',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const filename =
      options.filename ||
      `${(options.metadata?.title || 'chart').replace(/\s+/g, '_')}_${Date.now()}.png`;
    link.download = filename;
    link.href = imgData;
    link.click();
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    throw new Error('PNG export failed. Please ensure html2canvas package is installed.');
  }
}

/**
 * Share chart via Web Share API or copy URL
 */
export async function shareChart(
  title: string,
  description?: string,
  url?: string
): Promise<void> {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: description || title,
        url: url || window.location.href,
      });
    } catch (error) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed');
    }
  } else {
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(url || window.location.href);
      alert('Chart URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }
}

