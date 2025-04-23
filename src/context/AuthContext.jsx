import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token on load:', token); // Log the token
    if (token) {
      axios
        .get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data); // Set the user state if token is valid
          setLoading(false);
        })
        .catch((err) => {
          console.error('Auth check error:', err.response?.data || err.message);
          localStorage.removeItem('token'); // Remove token if there's an error
          setLoading(false);
        });
    } else {
      setLoading(false); // If no token, just set loading to false
    }
  }, []);

  const login = async (email, password) => {
    try {
      setError('');
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      navigate(res.data.user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard');
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data.message || 'Login failed. Please try again.');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const signup = async (email, password, role) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', { email, password, role });
      localStorage.setItem('token', response.data.token); // Store the token if signup is successful
      setUser(response.data.user); // Set the user state
      navigate(response.data.user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard');
    } catch (err) {
      console.error('Signup error:', err.response?.data || err.message);
      setError(err.response?.data.message || 'Signup failed. Please try again.');
      throw err; // Rethrow the error to be caught in the component
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error, signup }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};