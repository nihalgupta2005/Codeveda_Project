import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import dns from 'dns';

// Set Google DNS to bypass local DNS resolution failures
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Override global dns.lookup because Node's fetch (undici) calls dns.lookup,
// which ignores dns.setServers and uses system/OS dns resolution.
const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
  let actualOptions = options;
  let actualCallback = callback;
  if (typeof options === 'function') {
    actualCallback = options;
    actualOptions = {};
  }
  
  if (hostname.includes('supabase.co')) {
    dns.resolve4(hostname, (err, addresses) => {
      if (err || !addresses || !addresses.length) {
        originalLookup(hostname, options, callback);
      } else {
        if (actualOptions && actualOptions.all) {
          actualCallback(null, addresses.map(addr => ({ address: addr, family: 4 })));
        } else {
          actualCallback(null, addresses[0], 4);
        }
      }
    });
  } else {
    originalLookup(hostname, options, callback);
  }
};

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for public operations (auth, etc.)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Admin client for service operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default supabase;