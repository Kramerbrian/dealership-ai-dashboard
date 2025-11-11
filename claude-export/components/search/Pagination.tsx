'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  maxVisiblePages = 5,
  className = ""
}: PaginationProps) {
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const showStartEllipsis = visiblePages[0] > 1;
  const showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages;

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
          transition-all duration-200
          ${currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
          }
        `}
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      {/* Page Numbers */}
      {showPageNumbers && (
        <div className="flex items-center gap-1">
          {/* First page */}
          {showStartEllipsis && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
              >
                1
              </button>
              <div className="px-2">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </div>
            </>
          )}

          {/* Visible pages */}
          {visiblePages.map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${page === currentPage
                  ? 'bg-blue-600 text-white border border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              {page}
            </button>
          ))}

          {/* Last page */}
          {showEndEllipsis && (
            <>
              <div className="px-2">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </div>
              <button
                onClick={() => onPageChange(totalPages)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
          transition-all duration-200
          ${currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
          }
        `}
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
