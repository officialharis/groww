import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:5001/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('groww_user', JSON.stringify(userData));
      } else {
        // Token is invalid, clear storage
        localStorage.removeItem('groww_user');
        localStorage.removeItem('groww_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('groww_user');
      localStorage.removeItem('groww_token');
      setUser(null);
    }
  };

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('groww_user');
    const savedToken = localStorage.getItem('groww_token');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      // Verify token with backend
      verifyToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('groww_user', JSON.stringify(data.user));
        localStorage.setItem('groww_token', data.token);
        return data.user;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (name, email, password) => {
    try {
      console.log('🚀 Attempting signup with URL:', `${API_BASE_URL}/register`);
      console.log('📝 Signup data:', { name, email, password: '***' });

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('groww_user', JSON.stringify(data.user));
        localStorage.setItem('groww_token', data.token);
        console.log('✅ Signup successful');
        return data.user;
      } else {
        console.log('❌ Signup failed:', data);
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('💥 Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('groww_user');
    localStorage.removeItem('groww_token');
  };

  const updateBalance = async (newBalance) => {
    if (user) {
      try {
        // Update balance on backend
        const token = localStorage.getItem('groww_token');
        const response = await fetch('http://localhost:5000/api/user/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ balance: newBalance })
        });

        if (response.ok) {
          const updatedUser = { ...user, balance: newBalance };
          setUser(updatedUser);
          localStorage.setItem('groww_user', JSON.stringify(updatedUser));
        } else {
          throw new Error('Failed to update balance');
        }
      } catch (error) {
        console.error('Balance update error:', error);
        // Still update locally as fallback
        const updatedUser = { ...user, balance: newBalance };
        setUser(updatedUser);
        localStorage.setItem('groww_user', JSON.stringify(updatedUser));
      }
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('groww_token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('groww_user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateBalance,
    refreshUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};