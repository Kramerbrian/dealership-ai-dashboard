export interface SearchFilter {
  id: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'boolean';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface SearchState {
  query: string;
  filters: Record<string, any>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class SearchEngine<T> {
  private data: T[];
  private searchableFields: string[];
  private filterConfig: SearchFilter[];

  constructor(data: T[], searchableFields: string[], filterConfig: SearchFilter[]) {
    this.data = data;
    this.searchableFields = searchableFields;
    this.filterConfig = filterConfig;
  }

  search(state: SearchState): SearchResult<T> {
    let results = [...this.data];

    // Apply text search
    if (state.query.trim()) {
      results = this.applyTextSearch(results, state.query);
    }

    // Apply filters
    results = this.applyFilters(results, state.filters);

    // Apply sorting
    results = this.applySorting(results, state.sortBy, state.sortOrder);

    // Apply pagination
    const total = results.length;
    const totalPages = Math.ceil(total / state.pageSize);
    const startIndex = (state.page - 1) * state.pageSize;
    const endIndex = startIndex + state.pageSize;
    const paginatedResults = results.slice(startIndex, endIndex);

    return {
      data: paginatedResults,
      total,
      page: state.page,
      pageSize: state.pageSize,
      totalPages,
      hasNext: state.page < totalPages,
      hasPrev: state.page > 1,
    };
  }

  private applyTextSearch(data: T[], query: string): T[] {
    const searchTerms = query.toLowerCase().split(/\s+/);
    
    return data.filter(item => {
      return searchTerms.every(term => {
        return this.searchableFields.some(field => {
          const value = this.getNestedValue(item, field);
          return value && value.toString().toLowerCase().includes(term);
        });
      });
    });
  }

  private applyFilters(data: T[], filters: Record<string, any>): T[] {
    return data.filter(item => {
      return Object.entries(filters).every(([filterId, filterValue]) => {
        if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
          return true;
        }

        const filterConfig = this.filterConfig.find(f => f.id === filterId);
        if (!filterConfig) return true;

        const fieldValue = this.getNestedValue(item, filterId);

        switch (filterConfig.type) {
          case 'text':
            return fieldValue && fieldValue.toString().toLowerCase().includes(filterValue.toLowerCase());
          
          case 'select':
            return fieldValue === filterValue;
          
          case 'multiselect':
            return Array.isArray(filterValue) && filterValue.includes(fieldValue);
          
          case 'number':
            const numValue = Number(fieldValue);
            const numFilter = Number(filterValue);
            return !isNaN(numValue) && numValue === numFilter;
          
          case 'boolean':
            return Boolean(fieldValue) === Boolean(filterValue);
          
          case 'date':
            if (!fieldValue || !filterValue) return true;
            const itemDate = new Date(fieldValue);
            const filterDate = new Date(filterValue);
            return itemDate.toDateString() === filterDate.toDateString();
          
          case 'daterange':
            if (!fieldValue || !filterValue || !filterValue.start || !filterValue.end) return true;
            const itemDateRange = new Date(fieldValue);
            const startDate = new Date(filterValue.start);
            const endDate = new Date(filterValue.end);
            return itemDateRange >= startDate && itemDateRange <= endDate;
          
          default:
            return true;
        }
      });
    });
  }

  private applySorting(data: T[], sortBy: string, sortOrder: 'asc' | 'desc'): T[] {
    return [...data].sort((a, b) => {
      const aValue = this.getNestedValue(a, sortBy);
      const bValue = this.getNestedValue(b, sortBy);

      if (aValue === bValue) return 0;

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  getFilterConfig(): SearchFilter[] {
    return this.filterConfig;
  }

  getSuggestions(query: string, field?: string): string[] {
    const fields = field ? [field] : this.searchableFields;
    const suggestions = new Set<string>();

    this.data.forEach(item => {
      fields.forEach(fieldName => {
        const value = this.getNestedValue(item, fieldName);
        if (value && value.toString().toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(value.toString());
        }
      });
    });

    return Array.from(suggestions).slice(0, 10);
  }
}

// Utility functions for common search operations
export function createSearchState(initialState?: Partial<SearchState>): SearchState {
  return {
    query: '',
    filters: {},
    sortBy: '',
    sortOrder: 'asc',
    page: 1,
    pageSize: 20,
    ...initialState,
  };
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">$1</mark>');
}
