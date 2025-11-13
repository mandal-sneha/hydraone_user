import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { axiosInstance } from '../lib/axios';
import { FiCamera, FiCheckCircle, FiAlertCircle, FiLoader, FiMapPin, FiLock } from 'react-icons/fi';

const socket = io(axiosInstance.defaults.baseURL, {
  withCredentials: true
});

const CameraMonitor = () => {
  const { waterId } = useParams();
  const [status, setStatus] = useState('Connecting...');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [matchStatus, setMatchStatus] = useState('');
  const [arrivingGuestId, setArrivingGuestId] = useState(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const processingIntervalRef = useRef(null);

  useEffect(() => {
    socket.on('connect', () => {
      setStatus(`Connected. Registering camera for ${waterId}...`);
      socket.emit('register-camera', waterId);
      setStatus(`Camera registered for ${waterId}. Waiting for guest arrival...`);
    });

    socket.on('activate-camera', (data) => {
      setStatus(`Guest ${data.userId} is due. Activating camera...`);
      setArrivingGuestId(data.userId);
      setMatchStatus('');
      setShowOtpForm(false);
      setGuestEmail('');
      startCamera(data.userId);
    });

    socket.on('disconnect', () => {
      setStatus('Disconnected. Trying to reconnect...');
    });

    return () => {
      socket.off('connect');
      socket.off('activate-camera');
      socket.off('disconnect');
      stopCamera();
    };
  }, [waterId]);

  const startCamera = async (guestId) => {
    if (streamRef.current) {
      stopCamera();
    }
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
      processingIntervalRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setIsCameraActive(true);
            setMatchStatus('Camera active. Looking for face...');
            
            processingIntervalRef.current = setInterval(() => {
              captureAndVerify(guestId);
            }, 3000);

          }).catch(err => {
            setMatchStatus('Failed to start video playback');
          });
        };
      }
    } catch (err) {
      setStatus('Failed to start camera. Please grant permission.');
      setMatchStatus('Camera permission denied.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
      processingIntervalRef.current = null;
    }
    setIsCameraActive(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureAndVerify = async (guestId) => {
    if (isProcessing) {
      return;
    }

    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    if (!guestId) {
      return;
    }

    if (videoRef.current.readyState !== 4 || videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
      return;
    }

    setIsProcessing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsProcessing(false);
        return;
      }

      const formData = new FormData();
      formData.append('image', blob, 'frame.jpg');
      formData.append('userId', guestId);

      try {
        setMatchStatus('🔍 Analyzing frame...');
        
        const res = await axiosInstance.post(`/camera/${waterId}/verify-arrival`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 25000
        });

        if (res.data.match) {
          setMatchStatus(`✅ Match found! Score: ${res.data.score.toFixed(2)}. Sending OTP...`);
          stopCamera();
          setGuestEmail(res.data.guestEmail);
          setShowOtpForm(true);
          setOtpError('');
        } else {
          const msg = res.data.message || `No match (score: ${res.data.score?.toFixed(2) || 'N/A'})`;
          setMatchStatus(msg);
        }
      } catch (err) {
        if (err.code === 'ECONNABORTED') {
          setMatchStatus('⏱️ Request timeout. Retrying...');
        } else if (err.response?.status === 503) {
          setMatchStatus('⚠️ Camera service unavailable. Retrying...');
        } else if (err.response) {
          setMatchStatus(`❌ Error: ${err.response.data?.message || 'Unknown error'}`);
        } else {
          setMatchStatus('🔄 Connection error. Retrying...');
        }
      } finally {
        setIsProcessing(false);
      }
    }, 'image/jpeg', 0.95);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setOtpError('');

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const currentCoordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      const res = await axiosInstance.post('/camera/verify-arrival-otp', {
        hostwaterId: waterId,
        userId: arrivingGuestId,
        otp: otp,
        currentCoordinates: currentCoordinates,
      });

      if (res.data.success) {
        setStatus(`✅ Welcome, ${arrivingGuestId}!`);
        setMatchStatus('Verification complete!');
        setShowOtpForm(false);
        setArrivingGuestId(null);
        setGuestEmail('');
        setOtp('');
      } else {
        setOtpError(res.data.message || 'Verification failed.');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to verify. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const maskEmail = (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (name.length <= 3) return email;
    const maskedName = name.substring(0, 3) + '**********';
    return `${maskedName}@${domain}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-400">Camera Monitor</h1>
          <p className="text-gray-400">Property: {waterId}</p>
        </div>

        <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4 border-2 border-gray-700 flex items-center justify-center">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          ></video>
          {!isCameraActive && (
            <div className="absolute flex flex-col items-center text-gray-500">
              <FiCamera size={64} />
              <p className="mt-2 text-lg">Camera is Offline</p>
            </div>
          )}
          {isProcessing && (
            <div className="absolute top-4 right-4 bg-blue-600 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <FiLoader className="animate-spin" />
              Processing...
            </div>
          )}
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>

        <div className="text-center p-4 rounded-lg bg-gray-700 min-h-[100px] flex flex-col justify-center">
          <p className="text-lg font-medium text-gray-300">Status</p>
          <p className="text-xl font-bold text-white">{status}</p>
          {matchStatus && (
            <p className="text-lg text-indigo-400 mt-2">{matchStatus}</p>
          )}
        </div>

        {showOtpForm && (
          <form onSubmit={handleOtpSubmit} className="mt-6">
            <h2 className="text-2xl font-semibold text-center text-green-400 mb-4">Verification Required</h2>
            <p className="text-center text-gray-300 mb-4">
              {guestEmail 
                ? `An OTP has been sent to the email ${maskEmail(guestEmail)}. ` 
                : 'An OTP has been sent to the guest\'s email. '
              }
              Please enter it below and allow location access.
            </p>
            
            <div className="mb-4">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-400 mb-2">
                Enter OTP
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                  placeholder="6-Digit Code"
                  maxLength={6}
                  disabled={isVerifying}
                />
              </div>
            </div>

            {otpError && (
              <div className="flex items-center gap-2 text-red-400 bg-red-900/50 p-3 rounded-lg mb-4">
                <FiAlertCircle />
                <span>{otpError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <FiLoader className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <FiMapPin />
                  Verify OTP & Location
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CameraMonitor;