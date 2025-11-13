// Utility functions for search and filtering operations

export interface SearchableItem {
  [key: string]: any;
}

export interface SearchOptions {
  caseSensitive?: boolean;
  exactMatch?: boolean;
  fuzzySearch?: boolean;
  maxResults?: number;
}

export interface FilterOptions {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'notIn';
  value: any;
}

/**
 * Perform a text search across multiple fields
 */
export function searchItems<T extends SearchableItem>(
  items: T[],
  query: string,
  searchFields: string[],
  options: SearchOptions = {}
): T[] {
  if (!query.trim()) return items;

  const {
    caseSensitive = false,
    exactMatch = false,
    fuzzySearch = false,
    maxResults = 1000
  } = options;

  const searchTerm = caseSensitive ? query : query.toLowerCase();
  const terms = searchTerm.split(/\s+/).filter(term => term.length > 0);

  const results = items.filter(item => {
    if (exactMatch) {
      return searchFields.some(field => {
        const value = getNestedValue(item, field);
        return value && (caseSensitive ? value : value.toLowerCase()) === searchTerm;
      });
    }

    if (fuzzySearch) {
      return searchFields.some(field => {
        const value = getNestedValue(item, field);
        return value && fuzzyMatch(caseSensitive ? value : value.toLowerCase(), searchTerm);
      });
    }

    // Default: contains all terms
    return terms.every(term => {
      return searchFields.some(field => {
        const value = getNestedValue(item, field);
        return value && (caseSensitive ? value : value.toLowerCase()).includes(term);
      });
    });
  });

  return results.slice(0, maxResults);
}

/**
 * Apply multiple filters to items
 */
export function filterItems<T extends SearchableItem>(
  items: T[],
  filters: FilterOptions[]
): T[] {
  return items.filter(item => {
    return filters.every(filter => {
      const value = getNestedValue(item, filter.field);
      return applyFilter(value, filter.operator, filter.value);
    });
  });
}

/**
 * Sort items by a field
 */
export function sortItems<T extends SearchableItem>(
  items: T[],
  field: string,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    const aValue = getNestedValue(a, field);
    const bValue = getNestedValue(b, field);

    if (aValue === bValue) return 0;

    let comparison = 0;
    if (aValue < bValue) comparison = -1;
    if (aValue > bValue) comparison = 1;

    return direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Paginate items
 */
export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number
): {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const data = items.slice(startIndex, endIndex);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

/**
 * Get unique values for a field (useful for filter options)
 */
export function getUniqueValues<T extends SearchableItem>(
  items: T[],
  field: string
): any[] {
  const values = new Set();
  items.forEach(item => {
    const value = getNestedValue(item, field);
    if (value !== undefined && value !== null && value !== '') {
      values.add(value);
    }
  });
  return Array.from(values).sort();
}

/**
 * Generate search suggestions based on field values
 */
export function generateSuggestions<T extends SearchableItem>(
  items: T[],
  query: string,
  fields: string[],
  maxSuggestions: number = 10
): string[] {
  if (!query.trim()) return [];

  const suggestions = new Set<string>();
  const queryLower = query.toLowerCase();

  items.forEach(item => {
    fields.forEach(field => {
      const value = getNestedValue(item, field);
      if (value && value.toString().toLowerCase().includes(queryLower)) {
        suggestions.add(value.toString());
      }
    });
  });

  return Array.from(suggestions)
    .sort((a, b) => {
      // Prioritize suggestions that start with the query
      const aStartsWith = a.toLowerCase().startsWith(queryLower);
      const bStartsWith = b.toLowerCase().startsWith(queryLower);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      return a.localeCompare(b);
    })
    .slice(0, maxSuggestions);
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerms(
  text: string,
  query: string,
  className: string = 'bg-yellow-200 text-yellow-900 px-1 rounded'
): string {
  if (!query.trim()) return text;

  const terms = query.split(/\s+/).filter(term => term.length > 0);
  let highlightedText = text;

  terms.forEach(term => {
    const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
    highlightedText = highlightedText.replace(
      regex,
      `<mark class="${className}">$1</mark>`
    );
  });

  return highlightedText;
}

/**
 * Get nested object value using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Apply a single filter condition
 */
function applyFilter(value: any, operator: FilterOptions['operator'], filterValue: any): boolean {
  switch (operator) {
    case 'equals':
      return value === filterValue;
    case 'contains':
      return value && value.toString().toLowerCase().includes(filterValue.toLowerCase());
    case 'startsWith':
      return value && value.toString().toLowerCase().startsWith(filterValue.toLowerCase());
    case 'endsWith':
      return value && value.toString().toLowerCase().endsWith(filterValue.toLowerCase());
    case 'gt':
      return Number(value) > Number(filterValue);
    case 'gte':
      return Number(value) >= Number(filterValue);
    case 'lt':
      return Number(value) < Number(filterValue);
    case 'lte':
      return Number(value) <= Number(filterValue);
    case 'in':
      return Array.isArray(filterValue) && filterValue.includes(value);
    case 'notIn':
      return Array.isArray(filterValue) && !filterValue.includes(value);
    default:
      return true;
  }
}

/**
 * Simple fuzzy matching algorithm
 */
function fuzzyMatch(text: string, pattern: string): boolean {
  const textLower = text.toLowerCase();
  const patternLower = pattern.toLowerCase();
  
  let patternIndex = 0;
  for (let i = 0; i < textLower.length && patternIndex < patternLower.length; i++) {
    if (textLower[i] === patternLower[patternIndex]) {
      patternIndex++;
    }
  }
  
  return patternIndex === patternLower.length;
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Debounce function for search input
 */
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

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
