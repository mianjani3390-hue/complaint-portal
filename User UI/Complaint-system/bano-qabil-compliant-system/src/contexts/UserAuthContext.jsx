import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase_client';

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);
      } catch (err) {
        console.error('Failed to get session:', err);
        setError(err?.message || 'Failed to get session');
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setError(null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = useCallback(
    async (email, password, fullName) => {
      setError(null);
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return { error: signUpError };
        }

        return { data };
      } catch (err) {
        const errorMessage = err?.message || 'Sign up failed';
        setError(errorMessage);
        return { error: err };
      }
    },
    []
  );

  const signIn = useCallback(async (email, password) => {
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return { error: signInError };
      }

      return { data };
    } catch (err) {
      const errorMessage = err?.message || 'Sign in failed';
      setError(errorMessage);
      return { error: err };
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        setError(signOutError.message);
        return { error: signOutError };
      }

      setSession(null);
      setUser(null);
      return { success: true };
    } catch (err) {
      const errorMessage = err?.message || 'Sign out failed';
      setError(errorMessage);
      return { error: err };
    }
  }, []);

  const value = {
    session,
    user,
    loading,
    error,
    isAuthenticated: !!session,
    signUp,
    signIn,
    signOut,
  };

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>;
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within UserAuthProvider');
  }
  return context;
}
