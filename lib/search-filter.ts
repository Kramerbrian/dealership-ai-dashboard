/**
 * Advanced Search & Filtering System
 * 
 * Global search with multi-dimensional filtering
 */

export interface SearchFilter {
  query?: string; // Global search query
  filters?: Record<string, any>; // Field-specific filters
  dateRange?: {
    start?: Date;
    end?: Date;
    field?: string; // Field to filter on (default: 'createdAt')
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  limit?: number;
  offset?: number;
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  filtered: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Filter data based on search criteria
 */
export function applySearchFilter<T extends Record<string, any>>(
  data: T[],
  filter: SearchFilter
): SearchResult<T> {
  let filtered = [...data];

  // Apply text search
  if (filter.query) {
    const query = filter.query.toLowerCase();
    filtered = filtered.filter(item => {
      // Search across all string fields
      return Object.values(item).some(value => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        if (typeof value === 'number') {
          return String(value).includes(query);
        }
        return false;
      });
    });
  }

  // Apply field-specific filters
  if (filter.filters) {
    for (const [field, value] of Object.entries(filter.filters)) {
      filtered = filtered.filter(item => {
        const itemValue = item[field];
        
        if (value === null || value === undefined) {
          return itemValue === null || itemValue === undefined;
        }
        
        if (Array.isArray(value)) {
          return value.includes(itemValue);
        }
        
        if (typeof value === 'object' && 'operator' in value) {
          // Advanced operators
          const { operator, value: filterValue } = value as any;
          switch (operator) {
            case 'gt':
              return itemValue > filterValue;
            case 'gte':
              return itemValue >= filterValue;
            case 'lt':
              return itemValue < filterValue;
            case 'lte':
              return itemValue <= filterValue;
            case 'ne':
              return itemValue !== filterValue;
            case 'in':
              return Array.isArray(filterValue) && filterValue.includes(itemValue);
            case 'not_in':
              return Array.isArray(filterValue) && !filterValue.includes(itemValue);
            case 'contains':
              return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
            default:
              return itemValue === filterValue;
          }
        }
        
        return itemValue === value;
      });
    }
  }

  // Apply date range filter
  if (filter.dateRange) {
    const { start, end, field = 'createdAt' } = filter.dateRange;
    filtered = filtered.filter(item => {
      const itemDate = new Date(item[field]);
      if (start && itemDate < start) return false;
      if (end && itemDate > end) return false;
      return true;
    });
  }

  // Apply sorting
  if (filter.sort) {
    const { field, order } = filter.sort;
    filtered.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      
      if (aVal === bVal) return 0;
      
      const comparison = aVal > bVal ? 1 : -1;
      return order === 'asc' ? comparison : -comparison;
    });
  }

  const total = data.length;
  const filteredTotal = filtered.length;
  const limit = filter.limit || 100;
  const offset = filter.offset || 0;
  const paginated = filtered.slice(offset, offset + limit);
  const page = Math.floor(offset / limit) + 1;

  return {
    data: paginated,
    total,
    filtered: filteredTotal,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(filteredTotal / limit),
    },
  };
}

/**
 * Parse search filter from URL search params
 */
export function parseSearchFilter(req: Request): SearchFilter {
  const { searchParams } = new URL(req.url);

  const query = searchParams.get('q') || undefined;
  
  // Parse filters
  const filters: Record<string, any> = {};
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('filter.')) {
      const field = key.replace('filter.', '');
      try {
        // Try to parse as JSON (for complex filters)
        filters[field] = JSON.parse(value);
      } catch {
        // Otherwise use as string
        filters[field] = value;
      }
    }
  }

  // Parse date range
  const dateRange = searchParams.get('dateStart') || searchParams.get('dateEnd')
    ? {
        start: searchParams.get('dateStart') ? new Date(searchParams.get('dateStart')!) : undefined,
        end: searchParams.get('dateEnd') ? new Date(searchParams.get('dateEnd')!) : undefined,
        field: searchParams.get('dateField') || 'createdAt',
      }
    : undefined;

  // Parse sort
  const sort = searchParams.get('sort')
    ? {
        field: searchParams.get('sort')!,
        order: (searchParams.get('order') || 'asc') as 'asc' | 'desc',
      }
    : undefined;

  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

  return {
    query,
    filters: Object.keys(filters).length > 0 ? filters : undefined,
    dateRange,
    sort,
    limit,
    offset,
  };
}

/**
 * Generate search suggestions
 */
export function generateSearchSuggestions<T extends Record<string, any>>(
  data: T[],
  query: string,
  limit = 10
): string[] {
  const suggestions = new Set<string>();
  const lowerQuery = query.toLowerCase();

  for (const item of data) {
    for (const [key, value] of Object.entries(item)) {
      if (typeof value === 'string' && value.toLowerCase().includes(lowerQuery)) {
        // Extract potential suggestion
        const words = value.toLowerCase().split(/\s+/);
        for (const word of words) {
          if (word.startsWith(lowerQuery) && word.length > lowerQuery.length) {
            suggestions.add(word);
            if (suggestions.size >= limit) break;
          }
        }
      }
      if (suggestions.size >= limit) break;
    }
    if (suggestions.size >= limit) break;
  }

  return Array.from(suggestions).slice(0, limit);
}

