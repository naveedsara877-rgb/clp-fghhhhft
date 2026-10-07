import React, { useState, useEffect, useRef } from 'react';
import { Streamer, ChatMessage, Gift, FloatingGiftEffect, FloatingHeart } from '../types';
import { VIRTUAL_GIFTS, INITIAL_CHAT_MESSAGES } from '../data/gifts';
import { GiftAnimationLayer } from './GiftAnimationLayer';
import {
  X,
  Heart,
  Send,
  Gift as GiftIcon,
  PhoneCall,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Sparkles,
  Users,
  Settings,
  Share2,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface LiveRoomModalProps {
  streamer: Streamer;
  userCoins: number;
  onClose: () => void;
  onSendGift: (gift: Gift, count?: number) => boolean;
  onOpenRecharge: () => void;
  onStart1v1Call: (streamer: Streamer) => void;
}

export const LiveRoomModal: React.FC<LiveRoomModalProps> = ({
  streamer,
  userCoins,
  onClose,
  onSendGift,
  onOpenRecharge,
  onStart1v1Call,
}) => {
  // Live Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Media & Interaction states
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isGiftTrayOpen, setIsGiftTrayOpen] = useState(false);
  const [viewerCount, setViewerCount] = useState(streamer.viewers);
  const [likesCount, setLikesCount] = useState(streamer.likes);

  // Floating gift animations & hearts
  const [floatingGifts, setFloatingGifts] = useState<FloatingGiftEffect[]>([]);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);

  // Local camera stream ref for PIP
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localMediaStreamRef = useRef<MediaStream | null>(null);

  // Initialize local webcam for interactive user PIP (with graceful fallback)
  useEffect(() => {
    let active = true;
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (active && localVideoRef.current) {
          localMediaStreamRef.current = stream;
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.log('Webcam not active or permission denied in iframe, using avatar preview');
      }
    }
    startCamera();

    return () => {
      active = false;
      if (localMediaStreamRef.current) {
        localMediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Periodic simulated live chat chatter & hearts to give an authentic Chamet live experience
  useEffect(() => {
    const chatSamples = [
      'Sending love from California! 💕',
      'Can you play that song again please? 🎶',
      'You are glowing today! ✨',
      'Hello from Germany! Guten Abend! 🇩🇪',
      'The video quality is super smooth! ⚡',
      'Just sent a diamond! Keep going! 💎',
      'Level 50 soon! Let’s push for top 10 today!',
    ];

    const interval = setInterval(() => {
      const randomText = chatSamples[Math.floor(Math.random() * chatSamples.length)];
      const randomUser = `User_${Math.floor(100 + Math.random() * 900)}`;
      const randomLevel = Math.floor(5 + Math.random() * 45);

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        userId: `u-${Date.now()}`,
        userName: randomUser,
        text: randomText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        level: randomLevel,
      };

      setMessages((prev) => [...prev.slice(-40), newMsg]);
      setViewerCount((prev) => prev + Math.floor(Math.random() * 7 - 3));
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending chat message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const myMsg: ChatMessage = {
      id: `my-${Date.now()}`,
      userId: 'user-me',
      userName: 'You',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      level: 15,
      badge: 'VIP',
    };

    setMessages((prev) => [...prev, myMsg]);
    setInputText('');
  };

  // Handle virtual gift send
  const handleGiftClick = (gift: Gift) => {
    const success = onSendGift(gift, 1);
    if (!success) {
      // Trigger recharge prompt
      onOpenRecharge();
      return;
    }

    // Trigger visual floating effect
    const newEffect: FloatingGiftEffect = {
      id: `gift-${Date.now()}-${Math.random()}`,
      gift,
      senderName: 'You',
      count: 1,
      x: 35 + Math.floor(Math.random() * 30),
      timestamp: Date.now(),
    };

    setFloatingGifts((prev) => [...prev.slice(-5), newEffect]);

    // Add gift announcement in chat
    const giftChat: ChatMessage = {
      id: `chat-gift-${Date.now()}`,
      userId: 'user-me',
      userName: 'You',
      text: `sent ${gift.name} ${gift.icon}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGift: true,
      giftInfo: {
        name: gift.name,
        icon: gift.icon,
        count: 1,
      },
      level: 15,
      badge: 'VIP',
    };
    setMessages((prev) => [...prev, giftChat]);

    // Clean up animation after 3s
    setTimeout(() => {
      setFloatingGifts((prev) => prev.filter((g) => g.id !== newEffect.id));
    }, 3000);
  };

  // Handle tap heart reactions
  const handleTapHeart = () => {
    const heartColors = ['❤️', '💖', '🔥', '✨', '💜', '💙'];
    const randomHeart = heartColors[Math.floor(Math.random() * heartColors.length)];
    const heartObj: FloatingHeart = {
      id: `heart-${Date.now()}-${Math.random()}`,
      color: randomHeart,
      x: 70 + Math.floor(Math.random() * 20),
    };

    setFloatingHearts((prev) => [...prev.slice(-15), heartObj]);
    setLikesCount((prev) => prev + 1);

    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== heartObj.id));
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-0 sm:p-4 backdrop-blur-xl">
      {/* Container simulating high-end mobile Chamet live room */}
      <div className="relative w-full h-full max-w-md sm:max-h-[92vh] sm:rounded-3xl overflow-hidden bg-slate-950 flex flex-col border border-slate-800 shadow-2xl">
        {/* Floating Gift & Heart Animations Layer */}
        <GiftAnimationLayer
          floatingGifts={floatingGifts}
          floatingHearts={floatingHearts}
        />

        {/* Top Streamer Header Overlay */}
        <div className="absolute top-0 inset-x-0 z-30 p-4 pt-3 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {/* Streamer Profile Badge */}
          <div className="flex items-center gap-2 p-1 pr-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-pink-500">
              <img
                src={streamer.avatar}
                alt={streamer.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white font-display truncate max-w-[90px]">
                  {streamer.name}
                </span>
                <span className="text-[10px] text-pink-400 font-bold">Lv.{streamer.level}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-300">
                <Heart className="w-2.5 h-2.5 fill-pink-500 text-pink-500" />
                <span className="tabular-nums">{(likesCount / 1000).toFixed(1)}k</span>
              </div>
            </div>

            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`ml-1 px-2.5 py-1 text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                isFollowing
                  ? 'bg-slate-800 text-slate-300'
                  : 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm shadow-pink-500/30'
              }`}
            >
              {isFollowing ? 'Joined' : '+ Follow'}
            </button>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[11px] text-slate-200 border border-white/10">
              <Users className="w-3 h-3 text-pink-400" />
              <span className="tabular-nums font-semibold">{(viewerCount / 1000).toFixed(1)}k</span>
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-slate-200 hover:text-white border border-white/10 cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-rose-600 transition-colors cursor-pointer border border-white/10"
              title="Close Stream"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Video Stage (Interactive Video Stream) */}
        <div className="relative flex-1 w-full bg-slate-950 overflow-hidden">
          {/* Streamer backdrop / live camera visual */}
          <img
            src={streamer.thumbnail}
            alt={streamer.name}
            className="w-full h-full object-cover object-center filter brightness-95"
          />

          {/* Dynamic soft light motion overlay simulating a live stream broadcast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-black/30 pointer-events-none" />

          {/* Live Watermark & PK Status */}
          <div className="absolute top-16 left-4 flex flex-col gap-1 pointer-events-none">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-600/80 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>Agora RTC 1080p · 60fps</span>
            </div>
            {streamer.isPK && (
              <div className="px-2 py-0.5 rounded bg-amber-500/80 text-white text-[10px] font-bold backdrop-blur-sm">
                ⚔️ PK Battle in progress
              </div>
            )}
          </div>

          {/* User's Local Camera Picture-in-Picture (PIP) Window */}
          <div className="absolute top-16 right-4 w-24 h-32 rounded-2xl overflow-hidden bg-slate-900 border-2 border-pink-500/60 shadow-xl z-20 group">
            {isCameraOn ? (
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
                <span className="text-[9px]">Cam Off</span>
              </div>
            )}

            {/* Local PIP mini controls */}
            <div className="absolute bottom-1 inset-x-1 flex items-center justify-between px-1 py-0.5 rounded bg-black/60 backdrop-blur-sm">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className="p-1 rounded text-white hover:text-pink-400"
                title="Toggle Mic"
              >
                {isMicOn ? <Mic className="w-3 h-3 text-emerald-400" /> : <MicOff className="w-3 h-3 text-rose-400" />}
              </button>
              <button
                onClick={() => setIsCameraOn(!isCameraOn)}
                className="p-1 rounded text-white hover:text-pink-400"
                title="Toggle Cam"
              >
                {isCameraOn ? <Video className="w-3 h-3 text-emerald-400" /> : <VideoOff className="w-3 h-3 text-rose-400" />}
              </button>
            </div>
            <div className="absolute top-1 left-1 px-1 py-0.2 rounded bg-black/60 text-[8px] font-bold text-white">
              YOU
            </div>
          </div>
        </div>

        {/* Live Overlay Chat Box (Translucent Glassmorphism) */}
        <div className="relative z-20 px-4 pb-2 max-h-48 flex flex-col justify-end pointer-events-auto">
          <div className="overflow-y-auto space-y-1.5 custom-scrollbar pr-1 max-h-44">
            {messages.slice(-8).map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-1.5 text-xs py-1 px-2.5 rounded-xl backdrop-blur-md max-w-[92%] transition-all ${
                  msg.isSystem
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30 text-[11px]'
                    : msg.isGift
                    ? 'bg-gradient-to-r from-pink-600/70 to-purple-700/70 text-white border border-pink-400/30'
                    : 'bg-black/55 text-slate-100 border border-white/5'
                }`}
              >
                {msg.level && (
                  <span className="px-1 py-0.2 text-[9px] font-black rounded bg-pink-500/30 text-pink-300 shrink-0">
                    Lv.{msg.level}
                  </span>
                )}
                {msg.badge && (
                  <span className="px-1 py-0.2 text-[9px] font-black rounded bg-amber-400/30 text-amber-300 shrink-0">
                    {msg.badge}
                  </span>
                )}
                <span className="font-bold text-pink-400 shrink-0">{msg.userName}:</span>
                <span className="text-slate-200 break-words">{msg.text}</span>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>
        </div>

        {/* Bottom Interaction Action Bar */}
        <div className="relative z-20 p-3 pt-2 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent space-y-2">
          {/* Chat Input & Action Buttons Row */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSendMessage} className="flex-1 flex items-center relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Say something warm to Elena..."
                className="w-full pl-3 pr-9 py-2 text-xs rounded-full bg-slate-900/90 border border-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-pink-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="absolute right-1 w-7 h-7 rounded-full bg-pink-600 disabled:opacity-40 text-white flex items-center justify-center hover:bg-pink-500 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Virtual Gifts Drawer Toggle */}
            <button
              onClick={() => setIsGiftTrayOpen(!isGiftTrayOpen)}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ${
                isGiftTrayOpen
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                  : 'bg-gradient-to-tr from-amber-500 to-pink-500 text-white shadow-amber-500/25'
              }`}
              title="Send Virtual Gift"
            >
              <GiftIcon className="w-5 h-5 animate-bounce" />
            </button>

            {/* 1-on-1 Private Video Call Invite */}
            <button
              onClick={() => onStart1v1Call(streamer)}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 transition-transform active:scale-95 cursor-pointer"
              title="Request 1v1 Private Video Call"
            >
              <PhoneCall className="w-5 h-5" />
            </button>

            {/* Rapid Floating Heart Tap Action */}
            <button
              onClick={handleTapHeart}
              className="w-10 h-10 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-transform active:scale-125 cursor-pointer"
              title="Send Heart"
            >
              <Heart className="w-5 h-5 fill-white text-white" />
            </button>
          </div>

          {/* Virtual Gifts Selection Tray Sheet */}
          {isGiftTrayOpen && (
            <div className="pt-2 border-t border-slate-800/80 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Virtual Gifts</span>
                </span>
                <button
                  onClick={onOpenRecharge}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Balance: {userCoins} Coins</span>
                  <span className="underline">+ Recharge</span>
                </button>
              </div>

              {/* Grid of Chamet Virtual Gifts */}
              <div className="grid grid-cols-6 gap-1.5">
                {VIRTUAL_GIFTS.map((gift) => (
                  <button
                    key={gift.id}
                    onClick={() => handleGiftClick(gift)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-pink-500/60 transition-all transform active:scale-90 cursor-pointer group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{gift.icon}</span>
                    <span className="text-[10px] font-medium text-slate-300 mt-1 truncate max-w-full">
                      {gift.name}
                    </span>
                    <span className="text-[9px] font-bold text-amber-400 tabular-nums">
                      {gift.coins} 🪙
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
