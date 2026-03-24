import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { axiosInstance } from '../../lib/axios.js';
import { useTheme } from '../UserDashboard.jsx';
import { FiCamera, FiLoader, FiMapPin, FiLock } from 'react-icons/fi';

const socket = io(axiosInstance.defaults.baseURL, {
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: Infinity
});

const EntryCameraMonitor = () => {
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
      setStatus('Error: Water ID not found.');
      return;
    }

    const onConnect = () => {
      setStatus(`System Active • ${waterId}`);
      socket.emit('register-camera', waterId);
    };

    const onActivate = (data) => {
      setStatus(`Guest ${data.userId} Detected`);
      setArrivingGuestId(data.userId);
      setMatchStatus('');
      setShowOtpForm(false);
      startCamera(data.userId);
    };

    socket.on('connect', onConnect);
    socket.on('activate-camera', onActivate);

    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('activate-camera', onActivate);
      stopCamera();
    };
  }, [waterId]);

  const startCamera = async (guestId) => {
    if (streamRef.current) stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setIsCameraActive(true);
            if (processingIntervalRef.current) clearInterval(processingIntervalRef.current);
            processingIntervalRef.current = setInterval(() => {
              captureAndVerify(guestId);
            }, 3000);
          });
        };
      }
    } catch (err) {
      setMatchStatus('Camera access denied.');
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
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const captureAndVerify = async (guestId) => {
    if (isProcessing || !videoRef.current || !canvasRef.current || !guestId) return;
    
    setIsProcessing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsProcessing(false);
        return;
      }

      const formData = new FormData();
      formData.append('image', blob, 'capture.jpg');
      formData.append('userId', guestId);

      try {
        setMatchStatus('Analyzing face...');
        const res = await axiosInstance.post(`/camera/${waterId}/verify-arrival`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data.match) {
          setMatchStatus('Face Verified!');
          stopCamera();
          setGuestEmail(res.data.guestEmail);
          setShowOtpForm(true);
          setOtpError('');
        } else {
          setMatchStatus(res.data.message || 'No match found.');
        }
      } catch (err) {
        setMatchStatus('Service error. Retrying...');
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
      const pos = await new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true });
      });
      const res = await axiosInstance.post('/camera/verify-arrival-otp', {
        hostwaterId: waterId,
        userId: arrivingGuestId,
        otp,
        currentCoordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude }
      });
      if (res.data.success) {
        setStatus(`Verification Successful`);
        setMatchStatus('Entry Authorized');
        setShowOtpForm(false);
        setArrivingGuestId(null);
        setOtp('');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'OTP Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[85vh] w-full px-4 ${showOtpForm ? 'overflow-y-auto' : 'overflow-hidden'}`}>
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
      <div className="w-full max-w-3xl flex flex-col items-center">
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border-4" 
             style={{ backgroundColor: '#000', borderColor: theme.colors.borderColor }}>
          
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          
          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
              <FiCamera size={48} className="text-white/20 mb-4" />
              <p className="text-white/40 font-medium">Waiting for Guest Arrival...</p>
            </div>
          )}

          {isProcessing && (
            <div className="absolute top-6 right-6 px-4 py-2 bg-blue-600 text-white rounded-full text-xs font-bold animate-pulse shadow-lg">
              SCANNING
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="mt-10 w-full max-w-md text-center">
          <div className="p-5 rounded-2xl border transition-all duration-300" 
               style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.borderColor }}>
            <p className="text-sm uppercase tracking-widest font-bold opacity-50 mb-1" style={{ color: theme.colors.mutedText }}>Status</p>
            <p className="text-xl font-bold" style={{ color: theme.colors.textColor }}>{status}</p>
            {matchStatus && <p className="mt-2 font-semibold text-blue-500 animate-pulse">{matchStatus}</p>}
          </div>

          {showOtpForm && (
            <form onSubmit={handleOtpSubmit} className="mt-8 p-8 rounded-3xl border-2 border-dashed animate-in fade-in slide-in-from-bottom-4 duration-500" 
                  style={{ borderColor: theme.colors.primaryBg, backgroundColor: theme.colors.cardBg }}>
              <h2 className="text-lg font-bold mb-6" style={{ color: theme.colors.textColor }}>Guest Verification Required</h2>
              <div className="relative mb-6">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" style={{ color: theme.colors.textColor }} />
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  className="w-full pl-12 pr-4 py-4 text-center text-3xl tracking-[0.5em] font-mono rounded-2xl border-2 outline-none transition-all focus:border-blue-500" 
                  maxLength={6} 
                  placeholder="000000" 
                  style={{ backgroundColor: theme.colors.baseColor, color: theme.colors.textColor, borderColor: theme.colors.borderColor }}
                />
              </div>
              {otpError && <p className="text-red-500 text-sm mb-4 font-medium">{otpError}</p>}
              <button 
                type="submit" 
                disabled={isVerifying}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-blue-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isVerifying ? <FiLoader className="animate-spin" /> : <FiMapPin />}
                {isVerifying ? 'VERIFYING...' : 'AUTHORIZE ENTRY'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntryCameraMonitor;