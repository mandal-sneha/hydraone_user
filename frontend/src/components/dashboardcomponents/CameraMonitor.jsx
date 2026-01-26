import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { axiosInstance } from '../../lib/axios.js';
import { useTheme } from '../UserDashboard';
import { FiCamera, FiLoader, FiMapPin, FiLock } from 'react-icons/fi';

const socket = io(axiosInstance.defaults.baseURL, {
  withCredentials: true
});

const CameraMonitor = () => {
  const location = useLocation();
  const waterId = location.state?.waterId;
  const theme = useTheme();
  
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
    if (!waterId) {
      setStatus('Error: Water ID not found. Please navigate from the dashboard.');
      return;
    }

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
          aspectRatio: { ideal: 1.7777777778 }
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
        setMatchStatus('Analyzing frame...');
        
        const res = await axiosInstance.post(`/camera/${waterId}/verify-arrival`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 25000
        });

        if (res.data.match) {
          setMatchStatus(`Face Verified! Sending OTP...`);
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
          setMatchStatus('Request timeout. Retrying...');
        } else if (err.response?.status === 503) {
          setMatchStatus('Camera service unavailable. Retrying...');
        } else if (err.response) {
          setMatchStatus(`Error: ${err.response.data?.message || 'Unknown error'}`);
        } else {
          setMatchStatus('Connection error. Retrying...');
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
        setStatus(`Welcome, ${arrivingGuestId}!`);
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
    <div 
      className="flex flex-col items-center justify-center min-h-screen w-full p-4"
      style={{ 
        backgroundColor: 'transparent',
        overflow: 'hidden' 
      }}
    >
      <style>
        {`
          ::-webkit-scrollbar {
            display: none;
          }
          * {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
      <div 
        className="w-full max-w-4xl rounded-3xl shadow-2xl p-8 border transition-all duration-300 flex flex-col gap-6"
        style={{ 
          backgroundColor: theme.colors.cardBg,
          borderColor: theme.colors.borderColor,
          boxShadow: theme.colors.shadowLg,
        }}
      >
        <div className="text-center">
          <h1 
            className="text-4xl font-extrabold mb-2"
            style={{ color: theme.darkMode ? '#8a74f9' : '#6e8efb' }}
          >
            Camera Monitor
          </h1>
          <p className="text-lg opacity-80" style={{ color: theme.colors.mutedText }}>
            Property ID: <span className="font-mono font-bold">{waterId || 'N/A'}</span>
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div 
            className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 flex items-center justify-center shadow-inner mx-auto"
            style={{ 
              backgroundColor: theme.darkMode ? '#1a1a2e' : '#f0f0f0',
              borderColor: theme.colors.borderColor,
            }}
          >
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            ></video>
            {!isCameraActive && (
              <div className="absolute flex flex-col items-center" style={{ color: theme.colors.mutedText }}>
                <FiCamera size={64} className="opacity-20 mb-4" />
                <p className="text-xl font-semibold">Camera Standby</p>
              </div>
            )}
            {isProcessing && (
              <div 
                className="absolute top-4 right-4 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse shadow-lg"
                style={{ backgroundColor: theme.colors.primaryBg, color: '#fff' }}
              >
                <FiLoader className="animate-spin" />
                ANALYZING
              </div>
            )}
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>

          <div 
            className="text-center p-6 rounded-2xl border"
            style={{ 
              backgroundColor: theme.colors.activeBg,
              borderColor: theme.colors.borderColor
            }}
          >
            <p className="text-xs uppercase tracking-widest font-bold mb-1 opacity-60" style={{ color: theme.colors.mutedText }}>System Status</p>
            <p className="text-xl font-bold" style={{ color: theme.colors.textColor }}>{status}</p>
            {matchStatus && (
              <p className="text-lg font-semibold mt-2" style={{ color: theme.darkMode ? '#8a74f9' : '#6e8efb' }}>{matchStatus}</p>
            )}
          </div>
        </div>

        {showOtpForm && (
          <form onSubmit={handleOtpSubmit} className="p-6 rounded-2xl border-2 border-dashed flex-shrink-0 animate-in fade-in zoom-in duration-300" style={{ borderColor: theme.colors.primaryBg }}>
            <h2 className="text-xl font-bold text-center mb-4" style={{ color: theme.colors.textColor }}>Verify Guest Identity</h2>
            <div className="mb-6">
              <div className="relative">
                <FiLock 
                  className="absolute left-4 top-1/2 -translate-y-1/2" 
                  style={{ color: theme.colors.mutedText }}
                />
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl focus:outline-none font-mono text-center text-2xl tracking-[0.5em]"
                  style={{ 
                    backgroundColor: theme.colors.baseColor,
                    color: theme.colors.textColor,
                    border: `2px solid ${theme.colors.borderColor}`
                  }}
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg hover:brightness-110 active:scale-95"
              style={{ backgroundColor: theme.colors.primaryBg, color: '#ffffff' }}
            >
              {isVerifying ? <FiLoader className="animate-spin" /> : <FiMapPin />}
              {isVerifying ? 'VERIFYING...' : 'AUTHORIZE ENTRY'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CameraMonitor;