import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE!;

export const supabaseAdmin =
  url && serviceRole
    ? createClient(url, serviceRole, { auth: { persistSession: false } })
    : null;
