import React, { useState } from 'react';
import { axiosInstance } from '../../lib/axios.js';
import OTPVerification from './OTPVerification.jsx';

// SignupPage.jsx - This is your updated signup file
// Replace your existing SignupPage.jsx with this complete file
const SignUpPage = () => {
  const [formPage, setFormPage] = useState(1);
  const [formData, setFormData] = useState({
    userName: '',
    userId: '',
    email: '',
    adhaarNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    let value = e.target.value;
    
    if (e.target.name === 'userId') {
      value = value.replace(/[^a-zA-Z0-9]/g, '');
    }
    
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const validateFirstPage = () => {
    const { userName, userId, email, adhaarNumber, password, confirmPassword } = formData;
    if (!userName || !userId || !email || !adhaarNumber || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!/^\d{12}$/.test(adhaarNumber)) {
      setError('Aadhaar number must be 12 digits');
      return false;
    }
    if (!/^[a-zA-Z0-9]+$/.test(userId)) {
      setError('User ID can only contain letters and numbers');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = async () => {
    if (validateFirstPage()) {
      // TESTING MODE: Skip OTP API call
      // Comment out this block and uncomment the API call below when backend is ready
      setFormPage(2);
      setError('');
      
      /* 
      // Uncomment this when backend /user/send-otp endpoint is ready
      setLoading(true);
      try {
        const response = await axiosInstance.post('/user/send-otp', {
          email: formData.email
        });
        
        if (response.data.success) {
          setFormPage(2);
          setError('');
        } else {
          setError('Failed to send OTP. Try again.');
        }
      } catch (err) {
        console.error('OTP send error:', err);
        setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
      } finally {
        setLoading(false);
      }
      */
    }
  };

  const handleOTPVerify = async (otp) => {
    // TESTING MODE: Accept any 6-digit OTP
    // Comment out this block and uncomment the API call below when backend is ready
    
    if (otp.length === 6) {
      // For testing: accept "123456" as valid OTP
      if (otp === "123456") {
        setFormPage(3);
        setError('');
      } else {
        setError('Wrong OTP entered. Please try again. (Test OTP: 123456)');
      }
    }
    
    /* 
    // Uncomment this when backend /user/verify-otp endpoint is ready
    setLoading(true);
    setError('');
    
    try {
      const response = await axiosInstance.post('/user/verify-otp', {
        email: formData.email,
        otp: otp
      });
      
      if (response.data.success) {
        setFormPage(3);
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.message || 'Wrong OTP entered. Please try again.');
    } finally {
      setLoading(false);
    }
    */
  };

  const handleBackFromOTP = () => {
    setFormPage(1);
    setError('');
  };

  const handleBackFromPhoto = () => {
    setFormPage(2);
    setError('');
  };

  const showLoadingAnimation = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5; 
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setLoadingProgress(Math.floor(progress));
    }, 300);
  };

  const handleSubmit = async () => {
    if (!image) {
      setError('Please upload a photo');
      return;
    }
    setError('');
    setLoading(true);
    showLoadingAnimation();

    const data = new FormData();
    data.append('username', formData.userName);
    data.append('userId', formData.userId);
    data.append('email', formData.email);
    data.append('adhaarNumber', formData.adhaarNumber);
    data.append('password', formData.password);
    data.append('image', image);

    try {
      const response = await axiosInstance.post('/user/signup', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });
      setLoadingProgress(100);
      
      if (response.data.success) {
        const userData = {
          userName: formData.userName,
          userId: formData.userId,
          email: formData.email,
          adhaarNumber: formData.adhaarNumber
        };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.data.token);
        
        window.location.href = `/u/${formData.userId}`;
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
      setLoading(false);
      setLoadingProgress(0);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-800 mb-2 font-poppins">Welcome to HydraOne</h1>
          <p className="text-gray-600">One-stop water resource</p>
        </div>
        
        <div className="bg-white bg-opacity-50 backdrop-blur-sm p-8 rounded-xl shadow-lg">
          {formPage === 1 && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-indigo-800 mb-2 tracking-wide">SIGN UP</h2>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="userName"
                    placeholder="Enter username"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    name="userId"
                    placeholder="Enter user ID (letters and numbers only)"
                    value={formData.userId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aadhaar Number
                  </label>
                  <input
                    type="text"
                    name="adhaarNumber"
                    placeholder="Enter 12-digit Aadhaar number"
                    value={formData.adhaarNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    maxLength={12}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('password')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={loading}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={loading}
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2.5 px-4 rounded-md font-medium hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? 'Sending OTP...' : 'Next'}
              </button>
            </>
          )}

          {formPage === 2 && (
            <OTPVerification
              email={formData.email}
              onVerify={handleOTPVerify}
              onBack={handleBackFromOTP}
              loading={loading}
            />
          )}

          {formPage === 3 && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-indigo-800 mb-2 tracking-wide">UPLOAD PHOTO</h2>
                <p className="text-sm text-gray-600">Please upload your photo to complete registration</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="flex flex-col items-center mb-6">
                {preview && (
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-full mb-4 border-4 border-indigo-200" 
                  />
                )}
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="hidden"
                  id="imageUpload"
                  accept="image/*"
                  disabled={loading}
                />
                <label
                  htmlFor="imageUpload"
                  className="cursor-pointer px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  Choose Photo
                </label>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={handleBackFromPhoto}
                  disabled={loading}
                  className="text-indigo-600 hover:text-indigo-500 font-medium disabled:opacity-50"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-md font-medium hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing Up...' : 'Sign Up'}
                </button>
              </div>
            </>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-indigo-600 hover:text-indigo-500 underline font-medium">
                Log in
              </a>
            </p>
          </div>
        </div>

        {loading && formPage === 3 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-sm mx-4">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div 
                  className="absolute inset-0 border-4 border-indigo-600 rounded-full animate-spin"
                  style={{
                    borderTopColor: 'transparent',
                    borderRightColor: loadingProgress > 75 ? '#4f46e5' : 'transparent',
                    borderBottomColor: loadingProgress > 50 ? '#4f46e5' : 'transparent',
                    borderLeftColor: loadingProgress > 25 ? '#4f46e5' : 'transparent'
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-indigo-600">{loadingProgress}%</span>
                </div>
              </div>
              <p className="text-lg font-medium text-gray-800 mb-2">Processing your registration...</p>
              <p className="text-sm text-gray-600">
                {loadingProgress < 30 ? 'Storing data in database...' : 
                 loadingProgress < 70 ? 'Processing image...' : 
                 'Embedding face...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;