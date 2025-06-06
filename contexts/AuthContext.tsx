

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
    console.log("AuthContext: [fetchUserProfile] Attempting to fetch user profile for user ID:", supabaseUser.id);
    try {
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
        console.error('AuthContext: [fetchUserProfile] Error fetching user profile:', error.message || JSON.stringify(error));
        if (error.code === 'PGRST116') { 
          console.warn("AuthContext: [fetchUserProfile] Profile not found for user, setting default student role.");
          setUser({ id: supabaseUser.id, email: supabaseUser.email, role_name: 'student' });
        } else {
          setUser({ id: supabaseUser.id, email: supabaseUser.email, role_name: 'student' }); // Fallback
        }
        console.log("AuthContext: [fetchUserProfile] User state after profile fetch error/not found:", { id: supabaseUser.id, email: supabaseUser.email, role_name: 'student' });
        return;
      }

      if (profile) {
        console.log("AuthContext: [fetchUserProfile] Profile data received:", JSON.stringify(profile));
        let determinedRoleName = 'student'; // Default role
        if (profile.user_roles && typeof (profile.user_roles as any).role_name === 'string') {
          determinedRoleName = (profile.user_roles as any).role_name;
        } else if (profile.user_roles !== null && profile.user_roles !== undefined) {
          console.warn("AuthContext: [fetchUserProfile] profile.user_roles found, but role_name is not a string or format is unexpected:", JSON.stringify(profile.user_roles));
        }
        
        const avatarPublicUrl = profile.avatar_url ? getStoragePublicUrl(SUPABASE_AVATARS_BUCKET, profile.avatar_url) : undefined;

        const userToSet = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: profile.full_name || undefined,
          avatar_url: avatarPublicUrl,
          role_name: determinedRoleName,
        };
        setUser(userToSet);
        console.log("AuthContext: [fetchUserProfile] User state set after successful profile fetch:", JSON.stringify(userToSet));
      } else {
           console.warn("AuthContext: [fetchUserProfile] No profile data returned despite no error, setting default student role.");
           setUser({ id: supabaseUser.id, email: supabaseUser.email, role_name: 'student' });
           console.log("AuthContext: [fetchUserProfile] User state set (no profile data):", { id: supabaseUser.id, email: supabaseUser.email, role_name: 'student' });
      }
    } catch (e: any) {
        console.error("AuthContext: [fetchUserProfile] Exception during fetchUserProfile:", e.message || JSON.stringify(e));
        setUser({ id: supabaseUser.id, email: supabaseUser.email, role_name: 'student' }); // Fallback
        console.log("AuthContext: [fetchUserProfile] User state set after fetchUserProfile exception:", { id: supabaseUser.id, email: supabaseUser.email, role_name: 'student' });
    }
  };
  
  useEffect(() => {
    console.log("AuthContext: useEffect triggered. Initializing session check.");
    const getInitialSessionAsync = async () => {
        console.log("AuthContext: [getInitialSessionAsync] Started.");
        setIsLoading(true); 
        try {
            console.log("AuthContext: [getInitialSessionAsync] Calling supabase.auth.getSession()...");
            const { data, error: sessionError } = await supabase.auth.getSession();
            console.log("AuthContext: [getInitialSessionAsync] supabase.auth.getSession() completed.");

            if (sessionError) {
                console.error("AuthContext: [getInitialSessionAsync] Error getting initial session:", sessionError.message);
                setSession(null);
                setUser(null);
                setIsAuthenticated(false);
                return; 
            }

            const currentInitialSession = data.session;
            console.log("AuthContext: [getInitialSessionAsync] Initial session data:", JSON.stringify(currentInitialSession));
            setSession(currentInitialSession);

            if (currentInitialSession?.user) {
                console.log("AuthContext: [getInitialSessionAsync] Session found. Fetching user profile for user:", currentInitialSession.user.id);
                await fetchUserProfile(currentInitialSession.user);
                setIsAuthenticated(true);
                console.log("AuthContext: [getInitialSessionAsync] User authenticated based on initial session.");
            } else {
                console.log("AuthContext: [getInitialSessionAsync] No initial session found or user is null.");
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (e: any) {
            console.error("AuthContext: [getInitialSessionAsync] Exception:", e.message || JSON.stringify(e));
            setSession(null);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            console.log("AuthContext: [getInitialSessionAsync] Finally block. Setting isLoading to false.");
            setIsLoading(false); 
        }
    };

    getInitialSessionAsync();

    console.log("AuthContext: Setting up onAuthStateChange listener.");
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSessionOnChange) => {
        console.log("AuthContext: [onAuthStateChange] Triggered. Event:", _event, "New Session:", JSON.stringify(currentSessionOnChange));
        setSession(currentSessionOnChange);
        if (currentSessionOnChange?.user) {
          console.log("AuthContext: [onAuthStateChange] Session user found. Fetching profile for user:", currentSessionOnChange.user.id);
          await fetchUserProfile(currentSessionOnChange.user);
          setIsAuthenticated(true);
          console.log("AuthContext: [onAuthStateChange] User authenticated.");
        } else {
          console.log("AuthContext: [onAuthStateChange] No session user. Setting user to null and isAuthenticated to false.");
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );
    console.log("AuthContext: onAuthStateChange listener set up.");

    return () => {
      console.log("AuthContext: useEffect cleanup. Unsubscribing from onAuthStateChange.");
      authListener?.subscription?.unsubscribe();
    };
  }, []);


  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: AuthError | null }> => {
    if (!password) return { success: false, error: { message: "Password is required", name: "InputError", status: 400 } as AuthError };
    
    console.log("AuthContext: [login] Attempting login for email:", email);
    setIsLoading(true);
    let operationError: AuthError | null = null;
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      operationError = error;
    } catch (e: any) {
      console.error("AuthContext: [login] Exception during signInWithPassword:", e);
      operationError = { name: "SignInException", message: e.message || "Unknown error during sign in" } as AuthError;
    } finally {
      setIsLoading(false);
    }

    if (operationError) {
      console.error("AuthContext: [login] Login failed:", operationError.message || JSON.stringify(operationError));
      return { success: false, error: operationError };
    }
    console.log("AuthContext: [login] Login successful (Supabase call successful, onAuthStateChange will handle user state).");
    return { success: true };
  };

  const logout = async (): Promise<{ error: AuthError | null }> => {
    console.log("AuthContext: [logout] Attempting logout.");
    setIsLoading(true);
    let operationError: AuthError | null = null;
    try {
      const { error } = await supabase.auth.signOut();
      operationError = error;
    } catch (e: any) {
      console.error("AuthContext: [logout] Exception during signOut:", e);
      operationError = { name: "SignOutException", message: e.message || "Unknown error during sign out" } as AuthError;
    } finally {
      setIsLoading(false);
    }
    
    if (operationError) {
      console.error("AuthContext: [logout] Logout failed:", operationError.message || JSON.stringify(operationError));
    } else {
      console.log("AuthContext: [logout] Logout successful (Supabase call successful, onAuthStateChange will handle user state).");
    }
    return { error: operationError };
  };
  
  if (isLoading) { 
     console.log("AuthContext: Render - isLoading is true. Displaying 'Carregando sistema...'");
     return (
        <div className="flex items-center justify-center h-screen bg-primary-dark text-white">
          Carregando sistema...
        </div>
      );
  }
  console.log("AuthContext: Render - isLoading is false. Rendering children.");
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