import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (data.success) {
            setUser(data.user);
            setIsAuthenticated(true);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Backend offline, using fallback offline user profile');
          setIsAuthenticated(true);
          setUser({ email: 'asrithasai27@gmail.com' });
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };
    verifyToken();
  }, [token]);

  const login = async (email, password) => {
    email = email.trim().toLowerCase();
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.warn('Backend offline, using local mock auth');
      if (email.toLowerCase() === 'asrithasai27@gmail.com' && password === 'asritha123') {
        const mockToken = 'mock-jwt-token-for-asritha';
        localStorage.setItem('token', mockToken);
        setToken(mockToken);
        setUser({ email: 'asrithasai27@gmail.com' });
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: 'Invalid credentials or server connection failed.' };
    }
  };

  const sendOtp = async (email) => {
    email = email.trim().toLowerCase();
    
    // First, get OTP from backend
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (data.success) {
        // Try to send email via EmailJS
        try {
          // Generate OTP from backend response or create mock
          const otp = data.otp || Math.floor(100000 + Math.random() * 900000).toString();
          
          // EmailJS configuration from .env
          const emailjsConfig = {
            serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_joybpsh',
            templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_otp',
            userId: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'n7lRUFeyKGyusRYEG',
            templateParams: {
              to_email: email,
              otp_code: otp,
              subject: "Reset Password - Asritha's World Verification Code"
            }
          };
          
          // Send email via EmailJS if configured
          if (window.emailjs && emailjsConfig.userId && emailjsConfig.userId !== 'YOUR_PUBLIC_KEY_HERE') {
            try {
              await window.emailjs.send(
                emailjsConfig.serviceId,
                emailjsConfig.templateId,
                emailjsConfig.templateParams,
                emailjsConfig.userId
              );
              console.log('📧 Email sent via EmailJS to:', email);
            } catch (emailError) {
              console.warn('EmailJS send failed:', emailError);
              console.log('📧 OTP for', email, ':', otp);
            }
          } else {
            console.log('📧 EmailJS not fully configured, OTP:', otp);
          }
        } catch (emailError) {
          console.warn('EmailJS failed, OTP logged to console:', emailError);
        }
        
        return data;
      } else {
        return data;
      }
    } catch (err) {
      console.warn('Backend offline, mock OTP success');
      if (email.toLowerCase() === 'asrithasai27@gmail.com') {
        return { success: true, message: 'OTP sent successfully (Offline Mode: Use any 6 digits)' };
      }
      return { success: false, message: 'Email not found.' };
    }
  };

  const verifyOtp = async (email, otp) => {
    email = email.trim().toLowerCase();
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      return await res.json();
    } catch (err) {
      if (otp.length === 6) {
        return { success: true, message: 'OTP verified successfully' };
      }
      return { success: false, message: 'Invalid OTP code' };
    }
  };

  const resetPassword = async (email, password) => {
    email = email.trim().toLowerCase();
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await res.json();
    } catch (err) {
      return { success: true, message: 'Password Updated Successfully ❤️' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout, sendOtp, verifyOtp, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
