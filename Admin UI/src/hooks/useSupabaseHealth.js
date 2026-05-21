import { useEffect, useState } from 'react';
import { checkSupabaseConnection } from '../lib/supabase';

export function useSupabaseHealth() {
  const [status, setStatus] = useState({
    loading: true,
    configured: false,
    connected: false,
    message: '',
  });

  const refresh = async () => {
    setStatus((s) => ({ ...s, loading: true }));
    const result = await checkSupabaseConnection();
    setStatus({ loading: false, ...result });
  };

  useEffect(() => {
    refresh();
  }, []);

  return { ...status, refresh };
}
