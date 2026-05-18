
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// This client uses HTTPS which is much more reliable in restricted network environments
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper to fetch data via REST
export async function bridgeGet(table: string, query?: any) {
  let request = supabase.from(table).select('*');
  
  if (query?.limit) request = request.limit(query.limit);
  if (query?.order) request = request.order(query.order.column, { ascending: query.order.ascending });
  if (query?.filters) {
    for (const [key, value] of Object.entries(query.filters)) {
      if (value) request = request.eq(key, value);
    }
  }

  const { data, error } = await request;
  if (error) {
    console.error(`Bridge Error [${table}]:`, error.message);
    return [];
  }
  return data;
}

// Logic for calculating top value scores manually since DB functions might be offline
export function computeValue(p: any) {
  const edge = Math.abs(p.edge || 0);
  const conf = p.confidence || 50;
  return Math.round((edge * 0.6) + (conf * 0.4));
}
