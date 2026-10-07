import React from 'react';
import { Coins, BookOpen, Plus, Radio, Zap, Video } from 'lucide-react';

interface NavbarProps {
  coins: number;
  onOpenWallet: () => void;
  onOpenAgoraGuide: () => void;
  onStartMatching: () => void;
  onGoLive: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  coins,
  onOpenWallet,
  onOpenAgoraGuide,
  onStartMatching,
  onGoLive,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-400 shadow-lg shadow-pink-500/25">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white font-display">CHAMET</span>
              <span className="px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider rounded bg-pink-500/20 text-pink-400 border border-pink-500/30">
                LIVE
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">Global Video Call & Streaming</span>
          </div>
        </div>

        {/* Zone 2: Navigation Actions */}
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={onStartMatching}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Random 1v1 Match</span>
          </button>

          <button
            onClick={onOpenAgoraGuide}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Agora SDK Guide & Snippets</span>
          </button>
        </div>

        {/* Zone 3: Wallet & Primary Actions */}
        <div className="flex items-center gap-2.5">
          {/* User Wallet Balance */}
          <button
            onClick={onOpenWallet}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-850 border border-amber-500/30 hover:border-amber-500/60 transition-all shadow-inner"
            title="Open Wallet / Recharge Coins"
          >
            <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-amber-300 tabular-nums">
              {coins.toLocaleString()}
            </span>
            <div className="w-4 h-4 rounded-full bg-pink-600 group-hover:bg-pink-500 text-white flex items-center justify-center text-[10px] font-bold">
              <Plus className="w-2.5 h-2.5" />
            </div>
          </button>

          {/* Go Live Button */}
          <button
            onClick={onGoLive}
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-lg shadow-pink-500/25 transition-all transform active:scale-95"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Go Live</span>
          </button>
        </div>
      </div>
    </header>
  );
};
