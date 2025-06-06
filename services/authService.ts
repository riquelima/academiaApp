import { User } from '../types';
import { MOCK_API_LATENCY } from '../constants';
// Supabase client will be used directly in AuthContext

// This service is now largely superseded by AuthContext using Supabase directly.
// It's kept minimal for now.

export const authService = {
  // The login logic is now primarily handled by Supabase in AuthContext.
  // This function can be deprecated or act as a simple wrapper if needed.
  login: async (email: string, password?: string): Promise<User | null> => {
    console.warn("authService.login is deprecated. Use AuthContext with Supabase directly.");
    // Simulate a delay, but actual login is through Supabase.
    return new Promise((resolve) => {
      setTimeout(() => {
        // This mock logic is no longer accurate with Supabase.
        // It should either call Supabase (but that's AuthContext's job) or be removed.
        if (email === 'admin@academia.com' && password === '1234') {
          resolve({ id: 'mock-admin-id', email: 'admin@academia.com', name: 'Admin Mock User' });
        } else {
          resolve(null);
        }
      }, MOCK_API_LATENCY);
    });
  },

  logout: (): void => {
    // Logout is handled by Supabase in AuthContext.
    console.log('authService.logout called, but Supabase handles actual logout.');
  },

  // getCurrentUser is handled by Supabase's onAuthStateChange in AuthContext.
  // getCurrentUser: async (): Promise<User | null> => { ... }
};
