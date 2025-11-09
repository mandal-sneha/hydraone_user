import React, { useState, useRef, useEffect } from 'react';
import {axiosInstance} from '../../lib/axios.js';

const OTPVerification = ({ email, onVerify, onBack, loading, error, onError }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (onError) onError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleVerify = () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      if (onError) onError('Please enter a 6-digit OTP');
      return;
    }
    onVerify(otpValue);
  };

  const handleResend = async () => {
    setResendLoading(true);
    if (onError) onError('');
    try {
      await axiosInstance.post(`/user/${email}/generate-email-verification-otp`);
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      console.error('OTP resend error:', err);
      if (onError) onError(err.response?.data?.message || 'Failed to resend OTP. Try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-indigo-800 mb-2 tracking-wide">VERIFY OTP</h2>
        <p className="text-sm text-gray-600">
          We've sent a verification code to
          <br />
          <span className="font-medium text-gray-700">{email}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
          Enter 6-digit OTP
        </label>
        <div className="flex justify-center gap-2 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              disabled={loading}
            />
          ))}
        </div>

        <div className="text-center text-sm text-gray-600">
          {resendTimer > 0 ? (
            <p>
              Resend OTP in <span className="font-medium text-indigo-600">{resendTimer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-indigo-600 hover:text-indigo-500 font-medium underline"
              disabled={loading || resendLoading}
            >
              {resendLoading ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          disabled={loading}
          className="text-indigo-600 hover:text-indigo-500 font-medium disabled:opacity-50"
        >
          ← Previous
        </button>
        <button
          onClick={handleVerify}
          disabled={loading}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-md font-medium hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </div>
    </>
  );
};

export default OTPVerification;