import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

const LOCAL_USER_KEY = 'esven_local_user_v1';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Escuchar cambios de sesión reales de Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            avatarUrl: session.user.user_metadata?.avatar_url,
          };
          setUser(profile);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
        }
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            avatarUrl: session.user.user_metadata?.avatar_url,
          };
          setUser(profile);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
        } else {
          setUser(null);
          localStorage.removeItem(LOCAL_USER_KEY);
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        return { success: true, message: '¡Te enviamos un enlace de acceso a tu correo!' };
      } else {
        // Fallback local instantáneo sin dependencias
        const mockUser: UserProfile = {
          id: `usr_${Date.now()}`,
          email,
          name: email.split('@')[0],
        };
        setUser(mockUser);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
        return { success: true, message: `¡Sesión iniciada con éxito como ${mockUser.name}!` };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Error al iniciar sesión' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        return { success: true, message: 'Redirigiendo a Google...' };
      } else {
        // Demo rápido en local
        const mockUser: UserProfile = {
          id: `usr_google_${Date.now()}`,
          email: 'usuario.demo@esven.com',
          name: 'Comprador Demo',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        };
        setUser(mockUser);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
        return { success: true, message: '¡Sesión con Google simulada con éxito!' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Error al conectar con Google' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(LOCAL_USER_KEY);
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    signInWithEmail,
    signInWithGoogle,
    signOut,
  };
}
