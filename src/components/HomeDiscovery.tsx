import React, { useState } from 'react';
import { Streamer } from '../types';
import { Video, PhoneCall, Zap, Flame, Swords, Music, Sparkles, Search, Globe2 } from 'lucide-react';

interface HomeDiscoveryProps {
  streamers: Streamer[];
  onSelectStreamer: (streamer: Streamer) => void;
  onStart1v1Call: (streamer: Streamer) => void;
  onQuickMatch: () => void;
}

export const HomeDiscovery: React.FC<HomeDiscoveryProps> = ({
  streamers,
  onSelectStreamer,
  onStart1v1Call,
  onQuickMatch,
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterTabs = [
    { id: 'all', label: 'All Live', icon: Sparkles },
    { id: 'popular', label: 'Popular', icon: Flame },
    { id: 'pk', label: 'PK Battle', icon: Swords },
    { id: 'call', label: '1-on-1 Call', icon: PhoneCall },
    { id: 'music', label: 'Music', icon: Music },
  ];

  const filteredStreamers = streamers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'popular') return s.viewers > 12000;
    if (activeTab === 'pk') return s.isPK;
    if (activeTab === 'call') return s.tags.includes('1-on-1 Call');
    if (activeTab === 'music') return s.tags.includes('Music') || s.tags.includes('Acoustic');
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Quick 1v1 Matching Hero Banner (Chamet signature feature) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/60 via-pink-900/50 to-slate-900 border border-pink-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-pink-400">
              <Zap className="w-4 h-4 fill-pink-400" />
              <span>Instant Video Match</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">Over 3,400 Broadcasters Online</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Meet Global Streamers in 1-on-1 Real-Time Video
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Connect instantly with verified hosts worldwide using low-latency Agora WebRTC video.
              Send interactive 3D gifts and build high-energy live connections.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <button
              onClick={onQuickMatch}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-bold text-sm shadow-xl shadow-pink-500/25 transition-all transform active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Quick Match Now</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Discovery Header & Filter Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Interactive Segmented Filter Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hosts, tags, country..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500/60 transition-colors"
          />
        </div>
      </div>

      {/* Streamers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredStreamers.map((streamer) => (
          <div
            key={streamer.id}
            className="group relative flex flex-col rounded-2xl overflow-hidden bg-slate-900/90 border border-slate-800/80 hover:border-pink-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10"
          >
            {/* Thumbnail Media Container */}
            <div
              onClick={() => onSelectStreamer(streamer)}
              className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950 cursor-pointer"
            >
              <img
                src={streamer.thumbnail}
                alt={streamer.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback container
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />

              {/* Scrim gradient overlay for high contrast readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/30 pointer-events-none" />

              {/* Top Row Badges: Live indicator & Viewer count */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600/90 text-white text-[11px] font-bold tracking-wide backdrop-blur-sm shadow-md shadow-rose-950/40">
                  <span className="w-2 h-2 rounded-full bg-white animate-live-dot" />
                  <span>LIVE</span>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-slate-200 text-[11px] font-medium backdrop-blur-sm border border-white/10 tabular-nums">
                  <span>{(streamer.viewers / 1000).toFixed(1)}k</span>
                  <span className="text-slate-400">viewers</span>
                </div>
              </div>

              {/* PK Battle Badge if active */}
              {streamer.isPK && (
                <div className="absolute top-12 left-3 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                  ⚔️ PK Battle
                </div>
              )}

              {/* Bottom In-Image Details */}
              <div className="absolute bottom-3 left-3 right-3 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white font-display truncate">
                    {streamer.name}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[10px] font-black border border-amber-400/30">
                    Lv.{streamer.level}
                  </span>
                </div>

                {/* Clean unboxed metadata with separators */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                  <Globe2 className="w-3 h-3 text-slate-400" />
                  <span>{streamer.country}</span>
                  <span aria-hidden="true">·</span>
                  <span>{streamer.ratePerMin} Coins/min</span>
                </div>
              </div>
            </div>

            {/* Card Content & Action Bar */}
            <div className="p-3.5 space-y-3 bg-slate-900/95">
              <p className="text-xs text-slate-400 line-clamp-1">
                {streamer.bio}
              </p>

              {/* Tags text */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 overflow-hidden">
                {streamer.tags.map((tag, idx) => (
                  <React.Fragment key={tag}>
                    {idx > 0 && <span aria-hidden="true">·</span>}
                    <span className="truncate">{tag}</span>
                  </React.Fragment>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onSelectStreamer(streamer)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors border border-slate-700/60 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5 text-pink-400" />
                  <span>Watch Room</span>
                </button>

                <button
                  onClick={() => onStart1v1Call(streamer)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-pink-500/20 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-white" />
                  <span>1v1 Call</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
