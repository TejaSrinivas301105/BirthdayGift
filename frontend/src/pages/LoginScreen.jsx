import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Key, ShieldCheck, Eye, EyeOff, Sparkles } from 'lucide-react';

const LoginScreen = ({ onLoginSuccess }) => {
  const { login, sendOtp, verifyOtp, resetPassword } = useAuth();
  
  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password Flow States
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1: Enter Email, 2: Enter OTP, 3: Reset Password, 4: Success
  const [modalEmail, setModalEmail] = useState('');
  const [otpVal, setOtpVal] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const otpInputsRef = useRef([]);

  // Memoized star positions — computed once on mount, stable across re-renders
  // Prevents stars from jumping on every keystroke (Math.random in JSX anti-pattern)
  const stars = useMemo(() =>
    Array.from({ length: 30 }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 2 + 1}px`,
      height: `${Math.random() * 2 + 1}px`,
      animationDuration: `${Math.random() * 3 + 2}s`,
    })),
  []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter all fields');
      return;
    }
    setError('');
    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);
    if (res.success) {
      onLoginSuccess();
    } else {
      setError(res.message || 'Invalid credentials');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!modalEmail) {
      setModalError('Please enter email');
      return;
    }
    setModalError('');
    setModalLoading(true);
    const res = await sendOtp(modalEmail.trim());
    setModalLoading(false);
    if (res.success) {
      setModalStep(2);
    } else {
      setModalError(res.message || 'Failed to send OTP');
    }
  };

  const handleOtpChange = (index, value) => {
    // Only allow digits
    const cleanedValue = value.replace(/[^0-9]/g, '');
    if (cleanedValue === '') {
      const newOtp = [...otpVal];
      newOtp[index] = '';
      setOtpVal(newOtp);
      return;
    }

    // Keep only the last character (allows overwriting)
    const char = cleanedValue.slice(-1);
    const newOtp = [...otpVal];
    newOtp[index] = char;
    setOtpVal(newOtp);

    // Jump to next field if typed
    if (index < 5) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Jump back on backspace and clear
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otpVal];
      
      if (otpVal[index] !== '') {
        // If current box is not empty, clear it
        newOtp[index] = '';
        setOtpVal(newOtp);
      } else if (index > 0) {
        // If current box is empty, clear the previous box and focus it
        newOtp[index - 1] = '';
        setOtpVal(newOtp);
        otpInputsRef.current[index - 1].focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const digits = pasteData.replace(/[^0-9]/g, '').slice(0, 6);
    if (digits.length === 0) return;

    const newOtp = [...otpVal];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = digits[i] || '';
    }
    setOtpVal(newOtp);

    // Focus the next empty slot or the last slot
    const focusIndex = Math.min(digits.length, 5);
    otpInputsRef.current[focusIndex]?.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otpVal.join('');
    if (code.length < 6) {
      setModalError('Please enter all 6 digits');
      return;
    }
    setModalError('');
    setModalLoading(true);
    const res = await verifyOtp(modalEmail.trim(), code);
    setModalLoading(false);
    if (res.success) {
      setModalStep(3);
    } else {
      setModalError(res.message || 'Invalid OTP');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setModalError('Please fill in both fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setModalError('Passwords do not match');
      return;
    }
    setModalError('');
    setModalLoading(true);
    const res = await resetPassword(modalEmail.trim(), newPassword);
    setModalLoading(false);
    if (res.success) {
      setModalStep(4);
    } else {
      setModalError(res.message || 'Reset failed');
    }
  };

  const closeForgotModal = () => {
    setShowModal(false);
    setModalStep(1);
    setModalEmail('');
    setOtpVal(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setModalError('');
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center bg-slate-950 p-6 overflow-hidden">
      {/* Decorative stars */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-ping opacity-25"
            style={{
              top: star.top,
              left: star.left,
              width: star.width,
              height: star.height,
              animationDuration: star.animationDuration
            }}
          />
        ))}
      </div>

      {/* Main glass card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-purple-500/20">
          <Sparkles className="animate-pulse" size={28} />
        </div>

        <h2 className="text-3xl font-extrabold text-white text-center mb-1 tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
          Welcome Back Asritha ✨
        </h2>
        <p className="text-sm text-purple-300/80 mb-8 font-light">
          Unlock your secret digital universe
        </p>

        {error && (
          <div className="w-full p-3 mb-5 text-sm text-pink-400 bg-pink-500/10 border border-pink-500/20 rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
          {/* Email input */}
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-purple-400 transition-colors">
              <Mail size={18} />
            </span>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-900/40 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all duration-300 font-sans"
              required
            />
          </div>

          {/* Password input */}
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-pink-400 transition-colors">
              <Lock size={18} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-slate-900/40 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:outline-none transition-all duration-300 font-sans"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right -mt-2">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-xs text-purple-300 hover:text-pink-400 transition-colors duration-200"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white font-bold rounded-2xl shadow-lg shadow-pink-500/25 hover:shadow-pink-500/45 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
          >
            {loading ? 'Entering World...' : 'Login & Open World ✨'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-white/30 font-light">
          Secured with JWT and 256-bit encryption
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            {/* Modal backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForgotModal}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Modal card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative z-10 w-full max-w-md bg-slate-900/90 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden"
            >
              {modalError && (
                <div className="p-3 mb-4 text-xs text-pink-400 bg-pink-500/10 border border-pink-500/20 rounded-xl text-center">
                  {modalError}
                </div>
              )}

              {/* STEP 1: Enter Email */}
              {modalStep === 1 && (
                <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                  <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <Key size={20} className="text-purple-400" /> Reset Password
                  </h3>
                  <p className="text-sm text-white/60 mb-3">
                    Enter your registered email below, and we'll send a 6-digit OTP code to verify your identity.
                  </p>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-purple-400 transition-colors">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={modalEmail}
                      onChange={(e) => setModalEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-950/60 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:border-purple-500 focus:outline-none transition-all duration-300 font-sans"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="w-full py-3.5 mt-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-colors duration-200 flex items-center justify-center cursor-pointer"
                  >
                    {modalLoading ? 'Sending...' : 'Send Verification OTP 📧'}
                  </button>
                </form>
              )}

              {/* STEP 2: Verify OTP */}
              {modalStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="flex flex-col items-center gap-5">
                  <h3 className="text-xl font-bold text-white text-center flex items-center gap-2">
                    <ShieldCheck size={22} className="text-pink-500" /> Verify OTP
                  </h3>
                  <p className="text-sm text-white/60 text-center -mt-2">
                    A 6-digit code has been sent to <strong className="text-purple-300">{modalEmail}</strong>. Enter it below:
                  </p>
                  
                  {/* OTP Boxes */}
                  <div className="flex gap-2 justify-center my-2">
                    {otpVal.map((digit, i) => (
                      <input
                        key={i}
                        type="text"
                        value={digit}
                        ref={(el) => (otpInputsRef.current[i] = el)}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={handleOtpPaste}
                        className="w-12 h-12 text-center text-xl font-bold text-white bg-slate-950/60 border border-white/10 rounded-xl focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all font-sans"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="w-full py-3.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-2xl transition-colors duration-200 flex items-center justify-center cursor-pointer"
                  >
                    {modalLoading ? 'Verifying...' : 'Verify OTP Code ✨'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalStep(1)}
                    className="text-xs text-white/40 hover:text-white transition-colors"
                  >
                    Back to email input
                  </button>
                </form>
              )}

              {/* STEP 3: Reset Password */}
              {modalStep === 3 && (
                <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                  <h3 className="text-xl font-bold text-white mb-1">New Password</h3>
                  <p className="text-sm text-white/60 mb-2">
                    OTP verified! Choose a strong, memorable new password.
                  </p>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-purple-400 transition-colors">
                      <Lock size={18} />
                    </span>
                    <input
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-950/60 border border-white/10 rounded-2xl text-white focus:border-purple-500 focus:outline-none transition-all duration-300 font-sans"
                      required
                    />
                  </div>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-purple-400 transition-colors">
                      <Lock size={18} />
                    </span>
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-950/60 border border-white/10 rounded-2xl text-white focus:border-purple-500 focus:outline-none transition-all duration-300 font-sans"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="w-full py-3.5 mt-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center cursor-pointer"
                  >
                    {modalLoading ? 'Resetting...' : 'Reset My Password 💖'}
                  </button>
                </form>
              )}

              {/* STEP 4: Success Animation */}
              {modalStep === 4 && (
                <div className="flex flex-col items-center gap-4 text-center py-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.6 }}
                    className="w-20 h-20 bg-gradient-to-tr from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white text-4xl shadow-lg shadow-pink-500/20"
                  >
                    ❤️
                  </motion.div>
                  <h3 className="text-2xl font-black text-white mt-2">
                    Password Updated Successfully ❤️
                  </h3>
                  <p className="text-sm text-purple-200/80 max-w-xs leading-relaxed">
                    Your password has been securely updated. You can now close this window and log in.
                  </p>
                  <button
                    type="button"
                    onClick={closeForgotModal}
                    className="px-6 py-2.5 mt-4 bg-slate-950/80 border border-white/10 text-white font-semibold rounded-xl hover:bg-slate-900 transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginScreen;
