// Re-export from MockAuthContext since the Supabase project (bzvjlzweztbyovzkysfm.supabase.co) 
// is no longer accessible (DNS ERR_NAME_NOT_RESOLVED).
// To restore Supabase auth, replace this file with the original AuthContext implementation
// and update the .env with valid Supabase credentials.

export { useAuth, AuthProvider } from './MockAuthContext.jsx';