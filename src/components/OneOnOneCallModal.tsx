import React, { useState, useEffect, useRef } from 'react';
import { Streamer, Gift, FloatingGiftEffect } from '../types';
import { VIRTUAL_GIFTS } from '../data/gifts';
import { GiftAnimationLayer } from './GiftAnimationLayer';
import { agoraService } from '../services/agoraService';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Gift as GiftIcon,
  Coins,
  ShieldCheck,
  SwitchCamera,
  Signal,
} from 'lucide-react';

interface OneOnOneCallModalProps {
  streamer: Streamer;
  userCoins: number;
  onEndCall: () => void;
  onSendGift: (gift: Gift) => boolean;
  onDeductCoins: (amount: number) => boolean;
}

export const OneOnOneCallModal: React.FC<OneOnOneCallModalProps> = ({
  streamer,
  userCoins,
  onEndCall,
  onSendGift,
  onDeductCoins,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [showGiftTray, setShowGiftTray] = useState(false);
  const [floatingGifts, setFloatingGifts] = useState<FloatingGiftEffect[]>([]);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected'>('connecting');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Initialize camera and simulate Agora connection
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let billingTimer: NodeJS.Timeout;

    // Simulate swift 1.2s connection handshake
    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
    }, 1200);

    // Camera preview initialization
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.log('Local camera unavailable in environment, fallback applied.');
      }
    }
    setupCamera();

    // Call duration timer
    timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // Minute-based coin billing (every 60s deduct streamer.ratePerMin)
    billingTimer = setInterval(() => {
      const success = onDeductCoins(streamer.ratePerMin);
      if (!success) {
        // Insufficient coins, automatically end call
        alert('Insufficient coin balance for 1-on-1 private call. Ending session.');
        onEndCall();
      }
    }, 60000);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(timer);
      clearInterval(billingTimer);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      agoraService.leaveChannel();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMic = async () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMicMuted;
      });
    }
    await agoraService.toggleAudio();
    setIsMicMuted(!isMicMuted);
  };

  const toggleVideo = async () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoMuted;
      });
    }
    await agoraService.toggleVideo();
    setIsVideoMuted(!isVideoMuted);
  };

  const handleSendGift = (gift: Gift) => {
    const success = onSendGift(gift);
    if (success) {
      const effect: FloatingGiftEffect = {
        id: `call-gift-${Date.now()}`,
        gift,
        senderName: 'You',
        count: 1,
        x: 45,
        timestamp: Date.now(),
      };
      setFloatingGifts((prev) => [...prev, effect]);
      setTimeout(() => {
        setFloatingGifts((prev) => prev.filter((g) => g.id !== effect.id));
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-0 sm:p-4 backdrop-blur-2xl">
      <div className="relative w-full h-full max-w-md sm:max-h-[92vh] sm:rounded-3xl overflow-hidden bg-slate-950 flex flex-col border border-slate-800 shadow-2xl">
        {/* Floating Gift Animation */}
        <GiftAnimationLayer floatingGifts={floatingGifts} floatingHearts={[]} />

        {/* Remote Host Video Feed (Full Screen) */}
        <div className="relative flex-1 w-full h-full bg-slate-950">
          <img
            src={streamer.avatar}
            alt={streamer.name}
            className="w-full h-full object-cover object-center filter brightness-95"
          />

          {/* Scrim Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 pointer-events-none" />

          {/* Top Status Bar: Streamer details & Duration */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-pink-500">
                <img src={streamer.avatar} alt={streamer.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-display leading-tight">{streamer.name}</h4>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <Signal className="w-2.5 h-2.5 animate-pulse" />
                  <span>HD 1080p RTC</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono font-bold text-white tabular-nums">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>{formatTime(callDuration)}</span>
              </div>
            </div>
          </div>

          {/* Rate indicator & Coin Meter */}
          <div className="absolute top-20 left-4 z-20 flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-[11px] text-amber-300 font-semibold">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Rate: {streamer.ratePerMin} Coins/min</span>
            <span aria-hidden="true">·</span>
            <span>Bal: {userCoins}</span>
          </div>

          {/* User's PIP Local Camera */}
          <div className="absolute top-20 right-4 w-28 h-38 rounded-2xl overflow-hidden bg-slate-900 border-2 border-pink-500 shadow-2xl z-20">
            {!isVideoMuted ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400">
                <VideoOff className="w-5 h-5 mb-1" />
                <span className="text-[10px]">Cam Off</span>
              </div>
            )}
            <div className="absolute bottom-1 right-2 text-[9px] font-bold text-white/80 uppercase">You</div>
          </div>

          {/* Security & Private Call Watermark */}
          <div className="absolute bottom-28 left-4 right-4 flex items-center justify-center gap-1 text-[11px] text-slate-300 bg-black/40 backdrop-blur-sm py-1 rounded-full border border-white/5 pointer-events-none">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-End Encrypted Private 1-on-1 Call</span>
          </div>

          {/* In-Call Virtual Gift Tray Drawer */}
          {showGiftTray && (
            <div className="absolute bottom-24 inset-x-3 z-30 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">Send In-Call Surprise</span>
                <span className="text-xs text-amber-400 font-semibold">{userCoins} Coins left</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {VIRTUAL_GIFTS.map((gift) => (
                  <button
                    key={gift.id}
                    onClick={() => handleSendGift(gift)}
                    className="flex flex-col items-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="text-2xl">{gift.icon}</span>
                    <span className="text-[9px] text-slate-300 mt-0.5 truncate">{gift.name}</span>
                    <span className="text-[9px] font-bold text-amber-400">{gift.coins} 🪙</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Call Controls Bar */}
          <div className="absolute bottom-6 inset-x-4 z-20 flex items-center justify-around p-3 rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-2xl">
            {/* Toggle Mic */}
            <button
              onClick={toggleMic}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isMicMuted ? 'bg-rose-600/80 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={isMicMuted ? 'Unmute' : 'Mute'}
            >
              {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Toggle Camera */}
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isVideoMuted ? 'bg-rose-600/80 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={isVideoMuted ? 'Turn on video' : 'Turn off video'}
            >
              {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            {/* In-Call Gift Button */}
            <button
              onClick={() => setShowGiftTray(!showGiftTray)}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/20 active:scale-95 transition-transform cursor-pointer"
              title="Send Gift"
            >
              <GiftIcon className="w-5 h-5" />
            </button>

            {/* End Call Button */}
            <button
              onClick={onEndCall}
              className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-xl shadow-rose-600/40 active:scale-95 transition-transform cursor-pointer"
              title="Hang Up"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
