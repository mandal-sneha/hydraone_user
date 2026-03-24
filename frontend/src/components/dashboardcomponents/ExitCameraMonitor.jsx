import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { axiosInstance } from '../../lib/axios';
import { useTheme } from '../UserDashboard.jsx';

const ExitCameraMonitor = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const waterid = user?.waterId;
  const theme = useTheme();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('Monitoring Exit');

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setStatus('Camera Error');
      }
    };

    startVideo();

    const interval = setInterval(() => {
      captureAndVerify();
    }, 3000);

    return () => {
      clearInterval(interval);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureAndVerify = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 640, 480);
    
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('image', blob, 'exit_frame.jpg');

      try {
        const res = await axiosInstance.post(`/camera/${waterid}/mark-exit`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (res.data.match) {
          setStatus(`Exit: ${res.data.userId} (${res.data.exitTime})`);
          setTimeout(() => setStatus('Monitoring Exit'), 5000);
        }
      } catch (err) {
        console.error("Exit verification error");
      }
    }, 'image/jpeg');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] w-full px-4 overflow-hidden">
      <div 
        className="w-full max-w-3xl flex flex-col items-center p-8 rounded-3xl border shadow-2xl transition-all duration-300"
        style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.borderColor }}
      >
        <h2 className="text-xl font-bold mb-6 uppercase tracking-widest" style={{ color: theme.colors.textColor }}>
          Exit Monitor
        </h2>
        <div 
          className="relative w-full aspect-video overflow-hidden rounded-2xl border-4 shadow-lg"
          style={{ borderColor: theme.colors.borderColor, backgroundColor: '#000' }}
        >
          <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
          <canvas ref={canvasRef} width="640" height="480" className="hidden" />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
          </div>
        </div>
        <div 
          className="mt-8 px-8 py-4 rounded-2xl border text-center min-w-[250px]"
          style={{ backgroundColor: theme.colors.baseColor, borderColor: theme.colors.borderColor }}
        >
          <p className="text-sm uppercase tracking-widest font-bold opacity-50 mb-1" style={{ color: theme.colors.mutedText }}>System Status</p>
          <p className="font-mono text-lg font-bold" style={{ color: theme.colors.textColor }}>
            {status}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExitCameraMonitor;