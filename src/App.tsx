import React, { useState } from 'react';
import { Streamer, Gift } from './types';
import { MOCK_STREAMERS } from './data/mockStreamers';
import { Navbar } from './components/Navbar';
import { HomeDiscovery } from './components/HomeDiscovery';
import { LiveRoomModal } from './components/LiveRoomModal';
import { OneOnOneCallModal } from './components/OneOnOneCallModal';
import { WalletModal } from './components/WalletModal';
import { AgoraGuideModal } from './components/AgoraGuideModal';
import { BroadcastModal } from './components/BroadcastModal';
import { Zap, Radio, PhoneCall, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';

export default function App() {
  const [streamers] = useState<Streamer[]>(MOCK_STREAMERS);
  const [userCoins, setUserCoins] = useState<number>(2500);

  // Active view states
  const [activeLiveStreamer, setActiveLiveStreamer] = useState<Streamer | null>(null);
  const [active1v1Streamer, setActive1v1Streamer] = useState<Streamer | null>(null);
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isAgoraGuideOpen, setIsAgoraGuideOpen] = useState<boolean>(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState<boolean>(false);

  // Quick match finder state
  const [isMatching, setIsMatching] = useState<boolean>(false);

  // Gift sending handler (returns true if coins were sufficient, false otherwise)
  const handleSendGift = (gift: Gift, count: number = 1): boolean => {
    const totalCost = gift.coins * count;
    if (userCoins < totalCost) {
      return false;
    }
    setUserCoins((prev) => prev - totalCost);
    return true;
  };

  // 1-on-1 private call coin deduction (per minute)
  const handleDeductCoins = (amount: number): boolean => {
    if (userCoins < amount) {
      return false;
    }
    setUserCoins((prev) => prev - amount);
    return true;
  };

  // Add coins via recharge packages
  const handleAddCoins = (amount: number) => {
    setUserCoins((prev) => prev + amount);
  };

  // Quick Match simulated flow
  const handleQuickMatch = () => {
    setIsMatching(true);
    setTimeout(() => {
      setIsMatching(false);
      // Select random streamer from available list
      const randomHost = streamers[Math.floor(Math.random() * streamers.length)];
      setActive1v1Streamer(randomHost);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        coins={userCoins}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenAgoraGuide={() => setIsAgoraGuideOpen(true)}
        onStartMatching={handleQuickMatch}
        onGoLive={() => setIsBroadcastOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        <HomeDiscovery
          streamers={streamers}
          onSelectStreamer={(streamer) => setActiveLiveStreamer(streamer)}
          onStart1v1Call={(streamer) => setActive1v1Streamer(streamer)}
          onQuickMatch={handleQuickMatch}
        />
      </main>

      {/* Quick Matching Overlay */}
      {isMatching && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-150">
          <div className="flex flex-col items-center p-8 rounded-3xl bg-slate-900 border border-pink-500/40 shadow-2xl space-y-4 max-w-sm text-center">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" />
              <Zap className="w-8 h-8 text-amber-400 fill-amber-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">Finding Live Match...</h3>
            <p className="text-xs text-slate-400">
              Matching high-reputation broadcaster with best RTC latency...
            </p>
          </div>
        </div>
      )}

      {/* Live Stream Room View Modal */}
      {activeLiveStreamer && (
        <LiveRoomModal
          streamer={activeLiveStreamer}
          userCoins={userCoins}
          onClose={() => setActiveLiveStreamer(null)}
          onSendGift={handleSendGift}
          onOpenRecharge={() => setIsWalletOpen(true)}
          onStart1v1Call={(streamer) => {
            setActiveLiveStreamer(null);
            setActive1v1Streamer(streamer);
          }}
        />
      )}

      {/* 1-on-1 Private Video Call Modal */}
      {active1v1Streamer && (
        <OneOnOneCallModal
          streamer={active1v1Streamer}
          userCoins={userCoins}
          onEndCall={() => setActive1v1Streamer(null)}
          onSendGift={handleSendGift}
          onDeductCoins={handleDeductCoins}
        />
      )}

      {/* Coin Wallet & Recharge Modal */}
      {isWalletOpen && (
        <WalletModal
          coins={userCoins}
          onAddCoins={handleAddCoins}
          onClose={() => setIsWalletOpen(false)}
        />
      )}

      {/* Agora Web SDK Integration Guide & Snippets Modal */}
      {isAgoraGuideOpen && (
        <AgoraGuideModal onClose={() => setIsAgoraGuideOpen(false)} />
      )}

      {/* Host Broadcast Studio Modal */}
      {isBroadcastOpen && (
        <BroadcastModal
          onClose={() => setIsBroadcastOpen(false)}
          onOpenWallet={() => setIsWalletOpen(true)}
        />
      )}

      {/* Bottom Sticky Mobile Action Bar (for easy thumb navigation on mobile viewports) */}
      <footer className="fixed bottom-0 inset-x-0 z-30 sm:hidden bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 px-4 py-2 flex items-center justify-around">
        <button
          onClick={() => {
            setActiveLiveStreamer(null);
            setActive1v1Streamer(null);
          }}
          className="flex flex-col items-center text-pink-400 cursor-pointer"
        >
          <Radio className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Explore</span>
        </button>

        <button
          onClick={handleQuickMatch}
          className="flex flex-col items-center text-slate-400 hover:text-white cursor-pointer"
        >
          <Zap className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] font-bold mt-0.5">Match</span>
        </button>

        <button
          onClick={() => setIsBroadcastOpen(true)}
          className="w-10 h-10 -mt-4 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/40 cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsWalletOpen(true)}
          className="flex flex-col items-center text-slate-400 hover:text-white cursor-pointer"
        >
          <span className="text-xs font-bold text-amber-400 tabular-nums">{userCoins}</span>
          <span className="text-[10px] font-bold text-slate-400">Wallet</span>
        </button>

        <button
          onClick={() => setIsAgoraGuideOpen(true)}
          className="flex flex-col items-center text-slate-400 hover:text-white cursor-pointer"
        >
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <span className="text-[10px] font-bold mt-0.5">SDK Code</span>
        </button>
      </footer>
    </div>
  );
}
