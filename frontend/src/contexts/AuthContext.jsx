import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase.js';

console.log('🚀 AuthContext module loaded');

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  console.log('🏠 AuthProvider initialized');
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  const fetchUserProfile = async (userId) => {
    try {
      console.log('👤 AuthContext: Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ AuthContext: Error fetching user profile:', error);
        if (error.code === 'PGRST116') {
          console.log('ℹ️  User profile not found in database, this is normal for new users');
        }
        return null;
      }

      console.log('✅ AuthContext: User profile fetched:', data?.full_name, data?.role);
      setUserProfile(data);
      return data;
    } catch (error) {
      console.error('❌ AuthContext: Error in fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('🔄 AuthContext: Starting initialization...');
    
    // Set a shorter timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ AuthContext: Initialization timeout, setting loading to false');
      setLoading(false);
    }, 5000); // 5 second timeout

    // Test Supabase connectivity first
    const testSupabaseConnection = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/', {
          method: 'HEAD',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
          }
        });
        return response.ok;
      } catch (error) {
        console.error('❌ Supabase connectivity test failed:', error);
        return false;
      }
    };

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 AuthContext: Testing Supabase connection...');
        const isConnected = await testSupabaseConnection();
        
        if (!isConnected) {
          console.error('❌ Supabase is not accessible. Running in offline mode.');
          setLoading(false);
          clearTimeout(timeoutId);
          return;
        }
        
        console.log('🔍 AuthContext: Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ AuthContext: Error getting session:', error);
          setLoading(false);
          clearTimeout(timeoutId);
          return;
        }

        console.log('✅ AuthContext: Session retrieved:', session ? 'User logged in' : 'No session');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 AuthContext: Fetching user profile...');
          await fetchUserProfile(session.user.id);
        }
        
        setLoading(false);
        clearTimeout(timeoutId);
      } catch (error) {
        console.error('❌ AuthContext: Error in getInitialSession:', error);
        setLoading(false);
        clearTimeout(timeoutId);
      }
    };

    getInitialSession();

    // Listen for auth changes
    let subscription;
    try {
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔄 AuthContext: Auth state changed:', event, session?.user?.id);
          
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            setUserProfile(null);
          }
          
          setLoading(false);
        }
      );
      subscription = sub;
    } catch (error) {
      console.error('❌ AuthContext: Error setting up auth state listener:', error);
      setLoading(false);
      clearTimeout(timeoutId);
    }

    return () => {
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            role: userData.role || 'patient'
          }
        }
      });

      if (error) throw error;

      // Create user profile in database
      if (data.user && !data.user.identities?.length) {
        // User already exists
        throw new Error('User already registered');
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('🔐 AuthContext: Attempting sign in for:', email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ AuthContext: Sign in error:', error);
        throw error;
      }

      console.log('✅ AuthContext: Sign in successful for:', data.user?.email);
      return { data, error: null };
    } catch (error) {
      console.error('❌ AuthContext: Sign in failed:', error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      setUser(null);
      setUserProfile(null);
      setSession(null);
      
      return { error: null };
    } catch (error) {
      console.error('Error in signOut:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUserProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  };

  const isAdmin = () => userProfile?.role === 'admin';
  const isDoctor = () => userProfile?.role === 'doctor';
  const isPatient = () => userProfile?.role === 'patient';
  
  const hasRole = (role) => {
    if (Array.isArray(role)) {
      return role.includes(userProfile?.role);
    }
    return userProfile?.role === role;
  };

  const getAccessToken = () => session?.access_token;

  const value = {
    user,
    userProfile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    fetchUserProfile,
    isAdmin,
    isDoctor,
    isPatient,
    hasRole,
    getAccessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};