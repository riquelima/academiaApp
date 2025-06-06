

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
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true

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
  
  const getInitialSessionAsync = async () => {
    console.log("AuthContext: [getInitialSessionAsync] Started.");
    // setIsLoading(true); // isLoading is already true by default or set by caller effect
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
            await fetchUserProfile(currentInitialSession.user); // This can also take time
            setIsAuthenticated(true);
            console.log("AuthContext: [getInitialSessionAsync] User authenticated based on initial session.");
        } else {
            console.log("AuthContext: [getInitialSessionAsync] No initial session found or user is null.");
            setUser(null);
            setIsAuthenticated(false);
        }
    } catch (e: any) { // Catch errors from getSession or fetchUserProfile
        console.error("AuthContext: [getInitialSessionAsync] Exception:", e.message || JSON.stringify(e));
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
    } finally {
        console.log("AuthContext: [getInitialSessionAsync] Finally block. Setting isLoading to false.");
        setIsLoading(false); 
    }
  };

  useEffect(() => {
    let isMounted = true;
    console.log("AuthContext: useEffect triggered. Initializing session check.");

    const CRITICAL_AUTH_TIMEOUT_MS = 20000; // 20 seconds
    let authProcessCriticalTimeoutId: NodeJS.Timeout | undefined = undefined;

    if (isLoading) { // Only set critical timeout if we are indeed in the initial loading phase
      authProcessCriticalTimeoutId = setTimeout(() => {
          if (isMounted && isLoading) { // Double check isLoading, as getInitialSessionAsync might have resolved
              console.warn(`AuthContext: Initial authentication process seems stuck. Forcing UI update after ${CRITICAL_AUTH_TIMEOUT_MS / 1000}s.`);
              setSession(null);
              setUser(null);
              setIsAuthenticated(false);
              setIsLoading(false);
          }
      }, CRITICAL_AUTH_TIMEOUT_MS);
    }


    getInitialSessionAsync()
        .catch(error => {
            // This catch is for truly unhandled promise rejections from getInitialSessionAsync itself,
            // though its internal try/catch/finally should manage its state.
            if (isMounted) {
                console.error("AuthContext: Critical error during getInitialSessionAsync execution:", error);
                setSession(null);
                setUser(null);
                setIsAuthenticated(false);
                setIsLoading(false); // Ensure UI updates
            }
        })
        .finally(() => {
            // When getInitialSessionAsync (and its internal finally) completes, clear the critical timeout.
            if (isMounted) {
              if (authProcessCriticalTimeoutId) {
                clearTimeout(authProcessCriticalTimeoutId);
              }
            }
        });

    console.log("AuthContext: Setting up onAuthStateChange listener.");
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSessionOnChange) => {
        // If onAuthStateChange fires, it means the initial load is likely past or Supabase is actively managing session.
        // We should ensure the critical timeout is cleared if it hasn't been.
        if (isMounted && authProcessCriticalTimeoutId) {
            clearTimeout(authProcessCriticalTimeoutId);
        }
        
        console.log("AuthContext: [onAuthStateChange] Triggered. Event:", _event, "New Session:", JSON.stringify(currentSessionOnChange));
        if (!isMounted) return; // Prevent state updates if unmounted

        setSession(currentSessionOnChange);
        if (currentSessionOnChange?.user) {
          console.log("AuthContext: [onAuthStateChange] Session user found. Fetching profile for user:", currentSessionOnChange.user.id);
          // No need to setIsLoading here, this is for ongoing session changes.
          // fetchUserProfile might take time, but it shouldn't block UI with "Carregando sistema..."
          await fetchUserProfile(currentSessionOnChange.user);
          if (isMounted) setIsAuthenticated(true);
          console.log("AuthContext: [onAuthStateChange] User authenticated.");
        } else {
          console.log("AuthContext: [onAuthStateChange] No session user. Setting user to null and isAuthenticated to false.");
          if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
        // It's possible onAuthStateChange could fire before getInitialSessionAsync's finally block
        // sets isLoading to false (e.g., SIGNED_IN event).
        // Ensure isLoading is false if we get an auth state change.
        if (isMounted && isLoading) { // Check isLoading specifically
          console.log("AuthContext: [onAuthStateChange] Setting isLoading to false as auth state changed.");
          setIsLoading(false);
        }
      }
    );
    console.log("AuthContext: onAuthStateChange listener set up.");

    return () => {
      isMounted = false;
      console.log("AuthContext: useEffect cleanup. Unsubscribing from onAuthStateChange.");
      if (authProcessCriticalTimeoutId) {
        clearTimeout(authProcessCriticalTimeoutId);
      }
      authListener?.subscription?.unsubscribe();
    };
  }, []); // Empty dependency array: run once on mount.


  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: AuthError | null }> => {
    if (!password) return { success: false, error: { message: "Password is required", name: "InputError", status: 400 } as AuthError };
    
    console.log("AuthContext: [login] Attempting login for email:", email);
    setIsLoading(true); // Loading for login action
    let operationError: AuthError | null = null;
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      operationError = error;
      // onAuthStateChange will handle setting user, session, isAuthenticated, and profile.
    } catch (e: any) {
      console.error("AuthContext: [login] Exception during signInWithPassword:", e);
      operationError = { name: "SignInException", message: e.message || "Unknown error during sign in" } as AuthError;
    } finally {
      setIsLoading(false); // Finished login action
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
    setIsLoading(true); // Loading for logout action
    let operationError: AuthError | null = null;
    try {
      const { error } = await supabase.auth.signOut();
      operationError = error;
      // onAuthStateChange will handle setting user/session to null and isAuthenticated to false.
    } catch (e: any) {
      console.error("AuthContext: [logout] Exception during signOut:", e);
      operationError = { name: "SignOutException", message: e.message || "Unknown error during sign out" } as AuthError;
    } finally {
      setIsLoading(false); // Finished logout action
    }
    
    if (operationError) {
      console.error("AuthContext: [logout] Logout failed:", operationError.message || JSON.stringify(operationError));
    } else {
      console.log("AuthContext: [logout] Logout successful (Supabase call successful, onAuthStateChange will handle user state).");
    }
    return { error: operationError };
  };
  
  // This 'isLoading' primarily refers to the initial auth check.
  // Specific actions like login/logout also use their own temporary loading states if needed,
  // or use this global isLoading if appropriate (as done in login/logout methods for simplicity).
  if (isLoading) { 
     console.log("AuthContext: Render - isLoading is true. Displaying 'Carregando sistema...'");
     return (
        <div className="flex items-center justify-center h-screen bg-primary-dark text-white text-lg" aria-live="polite" aria-busy="true">
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
