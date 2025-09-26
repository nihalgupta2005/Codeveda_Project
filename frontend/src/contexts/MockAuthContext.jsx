import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);

  // Mock users for testing
  const mockUsers = {
    'admin@codeveda.com': {
      id: '1',
      email: 'admin@codeveda.com',
      profile: {
        id: '1',
        full_name: 'Admin User',
        role: 'admin',
        email: 'admin@codeveda.com'
      }
    },
    'doctor@codeveda.com': {
      id: '2', 
      email: 'doctor@codeveda.com',
      profile: {
        id: '2',
        full_name: 'Dr. Kumar',
        role: 'doctor',
        email: 'doctor@codeveda.com'
      }
    },
    'patient@codeveda.com': {
      id: '3',
      email: 'patient@codeveda.com', 
      profile: {
        id: '3',
        full_name: 'Patient User',
        role: 'patient',
        email: 'patient@codeveda.com'
      }
    }
  };

  const signUp = async (email, password, userData) => {
    // Mock signup
    console.log('Mock signup:', email);
    return { data: { user: { email } }, error: null };
  };

  const signIn = async (email, password) => {
    console.log('Mock signin attempt:', email);
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (mockUsers[email] && (password === 'admin123' || password === 'doctor123' || password === 'patient123')) {
      const mockUser = mockUsers[email];
      setUser(mockUser);
      setUserProfile(mockUser.profile);
      setSession({ user: mockUser, access_token: 'mock-token' });
      console.log('Mock signin successful:', mockUser.profile);
      setLoading(false);
      return { data: { user: mockUser }, error: null };
    }
    
    setLoading(false);
    return { data: null, error: { message: 'Invalid credentials' } };
  };

  const signOut = async () => {
    console.log('Mock signout');
    setUser(null);
    setUserProfile(null);
    setSession(null);
    return { error: null };
  };

  const updateProfile = async (updates) => {
    if (userProfile) {
      const updated = { ...userProfile, ...updates };
      setUserProfile(updated);
      return { data: updated, error: null };
    }
    return { data: null, error: { message: 'No user logged in' } };
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