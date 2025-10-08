import { createClient } from '@supabase/supabase-js'

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vxrdvkhkombwlhjvtsmw.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Only throw error at runtime, not during build
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseKey)) {
  console.warn('Missing Supabase environment variables - using defaults')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Database interface that matches Prisma-like API
export const db = {
  // Users
  user: {
    findUnique: async ({ where }: { where: { id?: string } }) => {
      if (where.id) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', where.id)
          .single()
        return data
      }
      return null
    },
    findMany: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
      return data || []
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase
        .from('users')
        .insert(data)
        .select()
        .single()
      return result
    },
    update: async ({ where, data }: { where: any; data: any }) => {
      const { data: result, error } = await supabase
        .from('users')
        .update(data)
        .eq('id', where.id)
        .select()
        .single()
      return result
    },
    delete: async ({ where }: { where: any }) => {
      const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('id', where.id)
        .select()
        .single()
      return data
    }
  },

  // Tenants
  tenant: {
    findUnique: async ({ where }: { where: { id?: string; clerkOrgId?: string } }) => {
      if (where.id) {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', where.id)
          .single()
        return data
      }
      if (where.clerkOrgId) {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('clerk_org_id', where.clerkOrgId)
          .single()
        return data
      }
      return null
    },
    findMany: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
      return data || []
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase
        .from('tenants')
        .insert(data)
        .select()
        .single()
      return result
    },
    update: async ({ where, data }: { where: any; data: any }) => {
      const { data: result, error } = await supabase
        .from('tenants')
        .update(data)
        .eq('id', where.id)
        .select()
        .single()
      return result
    },
    delete: async ({ where }: { where: any }) => {
      const { data, error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', where.id)
        .select()
        .single()
      return data
    }
  },

  // Dealership Data
  dealershipData: {
    findUnique: async ({ where }: { where: { id?: string; domain?: string } }) => {
      if (where.id) {
        const { data, error } = await supabase
          .from('dealership_data')
          .select('*')
          .eq('id', where.id)
          .single()
        return data
      }
      if (where.domain) {
        const { data, error } = await supabase
          .from('dealership_data')
          .select('*')
          .eq('domain', where.domain)
          .single()
        return data
      }
      return null
    },
    findMany: async () => {
      const { data, error } = await supabase
        .from('dealership_data')
        .select('*')
      return data || []
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase
        .from('dealership_data')
        .insert(data)
        .select()
        .single()
      return result
    },
    update: async ({ where, data }: { where: any; data: any }) => {
      const { data: result, error } = await supabase
        .from('dealership_data')
        .update(data)
        .eq('id', where.id)
        .select()
        .single()
      return result
    },
    delete: async ({ where }: { where: any }) => {
      const { data, error } = await supabase
        .from('dealership_data')
        .delete()
        .eq('id', where.id)
        .select()
        .single()
      return data
    }
  },

  // Audit Log
  auditLog: {
    findMany: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
      return data || []
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase
        .from('audit_log')
        .insert(data)
        .select()
        .single()
      return result
    },
    count: async () => {
      const { count, error } = await supabase
        .from('audit_log')
        .select('*', { count: 'exact', head: true })
      return count || 0
    }
  },

  // Score History
  scoreHistory: {
    findMany: async () => {
      const { data, error } = await supabase
        .from('score_history')
        .select('*')
        .order('created_at', { ascending: false })
      return data || []
    },
    create: async (data: any) => {
      const { data: result, error } = await supabase
        .from('score_history')
        .insert(data)
        .select()
        .single()
      return result
    }
  },

  // External Sources (GEO)
  external_sources: {
    insert: async (data: any) => {
      const { data: result, error } = await supabase
        .from('external_sources')
        .insert(data)
        .select()
        .single()
      return result
    },
    findFirst: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let query = supabase.from('external_sources').select('*')
      
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      
      if (orderBy) {
        Object.entries(orderBy).forEach(([key, value]) => {
          query = query.order(key, { ascending: value === 'asc' })
        })
      }
      
      const { data, error } = await query.single()
      return data
    },
    findMany: async ({ where, orderBy, take }: { where?: any; orderBy?: any; take?: number } = {}) => {
      let query = supabase.from('external_sources').select('*')
      
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          if (typeof value === 'object' && value.gte) {
            query = query.gte(key, value.gte)
          } else {
            query = query.eq(key, value)
          }
        })
      }
      
      if (orderBy) {
        Object.entries(orderBy).forEach(([key, value]) => {
          query = query.order(key, { ascending: value === 'asc' })
        })
      }
      
      if (take) {
        query = query.limit(take)
      }
      
      const { data, error } = await query
      return data || []
    }
  },

  // GEO Signals
  geo_signals: {
    insert: async (data: any) => {
      const { data: result, error } = await supabase
        .from('geo_signals')
        .insert(data)
        .select()
        .single()
      return result
    },
    findFirst: async ({ where, orderBy, include }: { where?: any; orderBy?: any; include?: any } = {}) => {
      let query = supabase.from('geo_signals').select('*')
      
      if (include?.source) {
        query = query.select(`
          *,
          source:external_sources(
            provider,
            url,
            title,
            fetched_at
          )
        `)
      }
      
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          if (typeof value === 'object' && value.gte) {
            query = query.gte(key, value.gte)
          } else {
            query = query.eq(key, value)
          }
        })
      }
      
      if (orderBy) {
        Object.entries(orderBy).forEach(([key, value]) => {
          query = query.order(key, { ascending: value === 'asc' })
        })
      }
      
      const { data, error } = await query.single()
      return data
    },
    findMany: async ({ where, orderBy, take }: { where?: any; orderBy?: any; take?: number } = {}) => {
      let query = supabase.from('geo_signals').select('*')
      
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          if (typeof value === 'object' && value.gte) {
            query = query.gte(key, value.gte)
          } else {
            query = query.eq(key, value)
          }
        })
      }
      
      if (orderBy) {
        Object.entries(orderBy).forEach(([key, value]) => {
          query = query.order(key, { ascending: value === 'asc' })
        })
      }
      
      if (take) {
        query = query.limit(take)
      }
      
      const { data, error } = await query
      return data || []
    }
  },

  // GEO Composite Scores
  geo_composite_scores: {
    insert: async (data: any) => {
      const { data: result, error } = await supabase
        .from('geo_composite_scores')
        .insert(data)
        .select()
        .single()
      return result
    },
    findFirst: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let query = supabase.from('geo_composite_scores').select('*')
      
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      
      if (orderBy) {
        Object.entries(orderBy).forEach(([key, value]) => {
          query = query.order(key, { ascending: value === 'asc' })
        })
      }
      
      const { data, error } = await query.single()
      return data
    },
    findMany: async ({ where, orderBy, take }: { where?: any; orderBy?: any; take?: number } = {}) => {
      let query = supabase.from('geo_composite_scores').select('*')
      
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      
      if (orderBy) {
        Object.entries(orderBy).forEach(([key, value]) => {
          query = query.order(key, { ascending: value === 'asc' })
        })
      }
      
      if (take) {
        query = query.limit(take)
      }
      
      const { data, error } = await query
      return data || []
    }
  },

  // Queries (AOER)
  queries: {
    findFirst: async ({ where }: { where?: any } = {}) => {
      let query = supabase.from('queries').select('*')
      
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      
      const { data, error } = await query.single()
      return data
    },
    insert: async (data: any) => {
      const { data: result, error } = await supabase
        .from('queries')
        .insert(data)
        .select()
        .single()
      return result
    }
  },

  // Query Checks (AOER)
  queryChecks: {
    findMany: async ({ where, include, orderBy }: { where?: any; include?: any; orderBy?: any } = {}) => {
      let query = supabase.from('query_checks').select('*')
      
      if (include?.query) {
        query = query.select(`
          *,
          query:queries(
            query,
            intent
          )
        `)
      }
      
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          if (typeof value === 'object' && value.gte) {
            query = query.gte(key, value.gte)
          } else {
            query = query.eq(key, value)
          }
        })
      }
      
      if (orderBy) {
        Object.entries(orderBy).forEach(([key, value]) => {
          query = query.order(key, { ascending: value === 'asc' })
        })
      }
      
      const { data, error } = await query
      return data || []
    },
    insert: async (data: any) => {
      const { data: result, error } = await supabase
        .from('query_checks')
        .insert(data)
        .select()
        .single()
      return result
    }
  },

  // Query Metrics (AOER)
  queryMetrics: {
    insert: async (data: any) => {
      const { data: result, error } = await supabase
        .from('query_metrics')
        .insert(data)
        .select()
        .single()
      return result
    }
  },

  // AOER Rollups
  aoerRollups: {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      let query = supabase.from('aoer_rollups').select('*')
      
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      
      if (orderBy) {
        Object.entries(orderBy).forEach(([key, value]) => {
          query = query.order(key, { ascending: value === 'asc' })
        })
      }
      
      const { data, error } = await query
      return data || []
    },
    insert: async (data: any) => {
      const { data: result, error } = await supabase
        .from('aoer_rollups')
        .insert(data)
        .select()
        .single()
      return result
    }
  },

  // Raw SQL execution for RLS
  $executeRaw: async (query: any) => {
    // For now, just return success
    // In a real implementation, you'd execute the raw SQL
    return Promise.resolve()
  }
}
