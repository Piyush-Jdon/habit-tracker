import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return client
}

// import { createBrowserClient } from '@supabase/ssr'

// export function createClient() {
//   // Use environment variables first, but fallback to the raw strings if Next.js fails to load them
//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lipaxawrxubqpkznmnki.supabase.co/rest/v1/'
  
//   // PASTE YOUR ACTUAL ANON KEY inside the quotes below
//   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcGF4YXdyeHVicXBrem5tbmtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MDMxMzUsImV4cCI6MjEwODE3OTEzNX0.aV3eSS53CHiMEaLRB6WBEOLNdbG6IhQPLFlhFIXPguQ' 

//   return createBrowserClient(supabaseUrl, supabaseAnonKey)
// }