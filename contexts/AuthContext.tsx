

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase, getStoragePublicUrl } from '../supabaseClient'; // Import Supabase client
import { AuthError, Session, User as SupabaseUser, Subscription } from '@supabase/supabase-js';
import { SUPABASE_AVATARS_BUCKET } from '../constants';


interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: AuthError | null }>;
  logout: () => Promise<{ error: AuthError | null }>;
  isLoading: boolean;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        full_name,
        avatar_url,
        role_id,
        user_roles (role_name)
      `)
      .eq('id', supabaseUser.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { 
        setUser({ id: supabaseUser.id, email: supabaseUser.email, role_name: 'student' });
      } else {
        console.error('Error fetching user profile:', error.message || JSON.stringify(error));
        setUser({ id: supabaseUser.id, email: supabaseUser.email, role_name: 'student' }); // Fallback
      }
      return;
    }

    if (profile) {
      let determinedRoleName = 'student'; // Default role
      // profile.user_roles comes as an object { role_name: string } or null from the join
      if (profile.user_roles && typeof (profile.user_roles as any).role_name === 'string') {
        determinedRoleName = (profile.user_roles as any).role_name;
      } else if (profile.user_roles !== null && profile.user_roles !== undefined) {
        // Log if user_roles is present but not in the expected shape or role_name is not a string
        console.warn("AuthContext: profile.user_roles found, but role_name is not a string or format is unexpected:", profile.user_roles);
      }
      
      // Note: profile.avatar_url is the path. getStoragePublicUrl is used in components.
      const avatarPublicUrl = profile.avatar_url ? getStoragePublicUrl(SUPABASE_AVATARS_BUCKET, profile.avatar_url) : undefined;

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: profile.full_name || undefined,
        avatar_url: avatarPublicUrl, // Store the public URL directly if needed by Header immediately
                                        // Or keep as path and let Header resolve. For consistency with StudentContext, Header should resolve.
                                        // Let's keep it as path as StudentContext does. Header already handles getStoragePublicUrl.
        role_name: determinedRoleName,
      });
    } else {
         // This case means profile is null, but no specific PGRST116 error was caught prior.
         // This might happen if .single() returns null without error, or if logic leads here.
         setUser({ id: supabaseUser.id, email: supabaseUser.email, role_name: 'student' }); 
    }
  };
  
  useEffect(() => {
    const getInitialSessionAsync = async () => {
        try {
            const { data, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error("AuthContext: Error getting initial session:", sessionError.message);
                setSession(null);
                setUser(null);
                setIsAuthenticated(false);
                return; 
            }

            const currentInitialSession = data.session;
            setSession(currentInitialSession);

            if (currentInitialSession?.user) {
                await fetchUserProfile(currentInitialSession.user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (e) {
            console.error("AuthContext: Exception in getInitialSessionAsync:", e);
            setSession(null);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false); 
        }
    };

    getInitialSessionAsync();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSessionOnChange) => {
        setSession(currentSessionOnChange);
        if (currentSessionOnChange?.user) {
          await fetchUserProfile(currentSessionOnChange.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        // Initial loading is primarily handled by getInitialSessionAsync's finally block.
        // Subsequent changes might set isLoading if needed, but not for this app's current main loading screen.
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);


  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: AuthError | null }> => {
    if (!password) return { success: false, error: { message: "Password is required", name: "InputError", status: 400 } as AuthError };
    setIsLoading(true); // For login operation specifically
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false); // Reset after login attempt
    if (error) {
      console.error("Login failed:", error.message || JSON.stringify(error));
      return { success: false, error };
    }
    // Auth state change will trigger profile fetch and set isAuthenticated
    return { success: true };
  };

  const logout = async (): Promise<{ error: AuthError | null }> => {
    setIsLoading(true); // For logout operation
    const { error } = await supabase.auth.signOut();
    // onAuthStateChange will handle setting user, session, isAuthenticated
    setIsLoading(false); // Reset after logout attempt
    if (error) console.error("Logout failed:", error.message || JSON.stringify(error));
    return { error };
  };
  
  // This is the main app loading screen condition
  if (isLoading && !session && !user) { 
     return (
        <div className="flex items-center justify-center h-screen bg-primary-dark text-white">
          Carregando sistema...
        </div>
      );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, session, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
