

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
      
      const avatarPublicUrl = profile.avatar_url ? getStoragePublicUrl(SUPABASE_AVATARS_BUCKET, profile.avatar_url) : undefined;

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: profile.full_name || undefined,
        avatar_url: avatarPublicUrl,
        role_name: determinedRoleName,
      });
    } else {
         setUser({ id: supabaseUser.id, email: supabaseUser.email, role_name: 'student' }); 
    }
  };
  
  useEffect(() => {
    const getInitialSessionAsync = async () => {
        setIsLoading(true); // Explicitly set loading to true for this operation
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
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);


  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: AuthError | null }> => {
    if (!password) return { success: false, error: { message: "Password is required", name: "InputError", status: 400 } as AuthError };
    
    setIsLoading(true);
    let operationError: AuthError | null = null;
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      operationError = error;
    } catch (e: any) {
      console.error("Exception during signInWithPassword:", e);
      operationError = { name: "SignInException", message: e.message || "Unknown error during sign in" } as AuthError;
    } finally {
      setIsLoading(false);
    }

    if (operationError) {
      console.error("Login failed:", operationError.message || JSON.stringify(operationError));
      return { success: false, error: operationError };
    }
    // Auth state change will trigger profile fetch and set isAuthenticated
    return { success: true };
  };

  const logout = async (): Promise<{ error: AuthError | null }> => {
    setIsLoading(true);
    let operationError: AuthError | null = null;
    try {
      const { error } = await supabase.auth.signOut();
      operationError = error;
    } catch (e: any) {
      console.error("Exception during signOut:", e);
      operationError = { name: "SignOutException", message: e.message || "Unknown error during sign out" } as AuthError;
    } finally {
      setIsLoading(false);
    }
    
    if (operationError) console.error("Logout failed:", operationError.message || JSON.stringify(operationError));
    // onAuthStateChange will handle setting user, session, isAuthenticated
    return { error: operationError };
  };
  
  if (isLoading) { 
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