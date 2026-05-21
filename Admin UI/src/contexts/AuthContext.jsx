import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);
const AUTH_TIMEOUT_MS = 8000;
const LOCAL_AVATAR_PREFIX = 'complainthub-avatar:';
const ADMIN_PROFILE_PREFIX = 'complainthub-admin-profile:';
const PROFILE_UNAVAILABLE = Symbol('profile-unavailable');

function withTimeout(promise, fallback, label) {
  let timeoutId;
  const timeout = new Promise((resolve) => {
    timeoutId = window.setTimeout(() => {
      console.warn(`${label} timed out`);
      resolve(fallback);
    }, AUTH_TIMEOUT_MS);
  });

  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timeoutId));
}

function localAvatarKey(userId) {
  return `${LOCAL_AVATAR_PREFIX}${userId}`;
}

function adminProfileKey(userId) {
  return `${ADMIN_PROFILE_PREFIX}${userId}`;
}

export function saveLocalAvatar(userId, avatarUrl) {
  if (!userId) return;
  if (avatarUrl) window.localStorage.setItem(localAvatarKey(userId), avatarUrl);
  else window.localStorage.removeItem(localAvatarKey(userId));
}

function getLocalAvatar(userId) {
  if (!userId) return '';
  return window.localStorage.getItem(localAvatarKey(userId)) || '';
}

function getCachedAdminProfile(userId) {
  if (!userId) return null;

  try {
    const cached = window.localStorage.getItem(adminProfileKey(userId));
    if (!cached) return null;

    const profile = JSON.parse(cached);
    return profile?.role === 'admin' || profile?.role === 'super_admin' ? profile : null;
  } catch (err) {
    console.error('Admin profile cache read failed:', err);
    return null;
  }
}

function saveCachedAdminProfile(profile) {
  if (!profile?.id || (profile.role !== 'admin' && profile.role !== 'super_admin')) return;
  window.localStorage.setItem(adminProfileKey(profile.id), JSON.stringify(profile));
}

function clearCachedAdminProfile(userId) {
  if (userId) window.localStorage.removeItem(adminProfileKey(userId));
}

function withFallbackAvatar(profile, user) {
  if (!profile) return profile;
  return {
    ...profile,
    avatar_url:
      profile.avatar_url ||
      user?.user_metadata?.avatar_url ||
      getLocalAvatar(profile.id || user?.id),
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId, user) => {
    if (!isSupabaseConfigured) return null;
    const { data, error, timedOut } = await withTimeout(
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .maybeSingle(),
      { data: null, error: null, timedOut: true },
      'Profile load'
    );

    if (timedOut || error) {
      if (error) console.error(error);
      return getCachedAdminProfile(userId) || PROFILE_UNAVAILABLE;
    }

    if (!data) {
      clearCachedAdminProfile(userId);
      return null;
    }

    const hydratedProfile = withFallbackAvatar(data, user);
    saveCachedAdminProfile(hydratedProfile);
    return hydratedProfile;
  }, []);

  const applySession = useCallback(async (s, mountedRef) => {
    setSession(s);

    if (!s?.user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const cachedProfile = getCachedAdminProfile(s.user.id);
    if (cachedProfile) setProfile(withFallbackAvatar(cachedProfile, s.user));

    const p = await loadProfile(s.user.id, s.user);
    if (!mountedRef.current) return;

    if (p === PROFILE_UNAVAILABLE) {
      setLoading(false);
      return;
    }

    setProfile(p);
    setLoading(false);
  }, [loadProfile]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const mountedRef = { current: true };

    async function initAuth() {
      try {
        const {
          data: { session: s },
        } = await withTimeout(
          supabase.auth.getSession(),
          { data: { session: null }, error: null },
          'Auth session check'
        );
        if (!mountedRef.current) return;
        await applySession(s, mountedRef);
      } catch (err) {
        console.error('Auth init failed:', err);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mountedRef.current) return;
      setLoading(Boolean(s?.user));

      window.setTimeout(() => {
        if (mountedRef.current) applySession(s, mountedRef);
      }, 0);
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Add .env file and restart the dev server.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const p = await loadProfile(data.user.id, data.user);
    if (p === PROFILE_UNAVAILABLE) {
      await supabase.auth.signOut();
      throw new Error('Could not verify admin access. Please try again.');
    }
    if (!p) {
      await supabase.auth.signOut();
      throw new Error('Account is inactive or not authorized as admin.');
    }
    if (p.role !== 'admin' && p.role !== 'super_admin') {
      await supabase.auth.signOut();
      throw new Error('You do not have admin access.');
    }
    setProfile(p);
    setSession(data.session ?? null);
    return data;
  };

  const signUp = async (email, password) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Add .env file and restart the dev server.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'admin',
        },
      },
    });

    if (error) throw error;
    if (data.session) {
      await supabase.auth.signOut();
      setProfile(null);
      setSession(null);
    }
    return data;
  };

  const signOut = async () => {
    const userId = session?.user?.id || profile?.id;
    setProfile(null);
    setSession(null);
    setLoading(false);
    clearCachedAdminProfile(userId);

    if (!isSupabaseConfigured) return;

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out failed:', error);
    }
  };

  const refreshProfile = async () => {
    if (session?.user && isSupabaseConfigured) {
      const p = await loadProfile(session.user.id, session.user);
      if (p !== PROFILE_UNAVAILABLE) setProfile(p);
    }
  };

  const value = {
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    isSupabaseConfigured,
    isSuperAdmin: profile?.role === 'super_admin',
    isAuthenticated: !!session && !!profile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
