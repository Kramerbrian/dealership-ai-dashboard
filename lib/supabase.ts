// Placeholder Supabase client
export const supabase = {
  from: () => ({
    select: () => ({
      eq: () => Promise.resolve({ data: [], error: null })
    }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => ({
      eq: () => Promise.resolve({ data: [], error: null })
    })
  })
};
