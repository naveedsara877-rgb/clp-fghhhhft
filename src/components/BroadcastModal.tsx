import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Video, VideoOff, Sparkles, Radio, Share2 } from 'lucide-react';
import { agoraService } from '../services/agoraService';

interface BroadcastModalProps {
  onClose: () => void;
  onOpenWallet: () => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({ onClose, onOpenWallet }) => {
  const [roomTitle, setRoomTitle] = useState('Chillin & Chatting with Fans! ✨');
  const [category, setCategory] = useState('Cozy Talk');
  const [isLive, setIsLive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [beautyFilter, setBeautyFilter] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    async function startPreview() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.log('Camera preview error', err);
      }
    }
    startPreview();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleStartBroadcast = () => {
    setIsLive(true);
    setViewerCount(Math.floor(25 + Math.random() * 40));

    // Simulate viewers increasing
    const interval = setInterval(() => {
      setViewerCount((prev) => prev + Math.floor(Math.random() * 8 + 1));
    }, 4000);

    return () => clearInterval(interval);
  };

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => (t.enabled = isMicMuted));
    }
    setIsMicMuted(!isMicMuted);
  };

  const toggleCam = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => (t.enabled = isVideoMuted));
    }
    setIsVideoMuted(!isVideoMuted);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xl">
      <div className="relative w-full max-w-md h-full max-h-[90vh] rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Top bar */}
        <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold text-white">
            <Radio className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
            <span>{isLive ? `LIVE (${viewerCount} Viewers)` : 'Broadcast Studio'}</span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Canvas Stage */}
        <div className="relative flex-1 w-full bg-slate-900 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 ${
              beautyFilter ? 'filter contrast-105 brightness-105' : ''
            }`}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

          {/* Setup controls before going live */}
          {!isLive && (
            <div className="absolute bottom-6 inset-x-4 z-20 space-y-4">
              <div className="p-4 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 space-y-3">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Stream Title
                  </label>
                  <input
                    type="text"
                    value={roomTitle}
                    onChange={(e) => setRoomTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Beauty & Soft Lighting</span>
                  <button
                    onClick={() => setBeautyFilter(!beautyFilter)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                      beautyFilter ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {beautyFilter ? '✨ Active' : 'Off'}
                  </button>
                </div>
              </div>

              {/* Start Live button */}
              <button
                onClick={handleStartBroadcast}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-pink-500/30 hover:opacity-95 transition-all transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4 animate-ping" />
                <span>Start Live Broadcast</span>
              </button>
            </div>
          )}

          {/* Controls while live */}
          {isLive && (
            <div className="absolute bottom-6 inset-x-4 z-20 flex items-center justify-around p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10">
              <button
                onClick={toggleMic}
                className="p-3 rounded-full bg-slate-800 text-white hover:bg-slate-700 cursor-pointer"
              >
                {isMicMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleCam}
                className="p-3 rounded-full bg-slate-800 text-white hover:bg-slate-700 cursor-pointer"
              >
                {isVideoMuted ? <VideoOff className="w-5 h-5 text-rose-400" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer"
              >
                End Stream
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
