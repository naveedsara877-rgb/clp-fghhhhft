import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { FloatingGiftEffect, FloatingHeart } from '../types';

interface GiftAnimationLayerProps {
  floatingGifts: FloatingGiftEffect[];
  floatingHearts: FloatingHeart[];
}

export const GiftAnimationLayer: React.FC<GiftAnimationLayerProps> = ({
  floatingGifts,
  floatingHearts,
}) => {
  // Trigger confetti burst on high-value gifts (Supercar or Space Rocket or Crown)
  useEffect(() => {
    if (floatingGifts.length > 0) {
      const latest = floatingGifts[floatingGifts.length - 1];
      if (latest.gift.coins >= 199) {
        confetti({
          particleCount: latest.gift.coins >= 500 ? 120 : 60,
          spread: 80,
          origin: { y: 0.6 },
          colors: [latest.gift.color, '#ffffff', '#fbbf24', '#f43f5e'],
        });
      }
    }
  }, [floatingGifts]);

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {/* Floating Hearts from viewer taps */}
      {floatingHearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute bottom-20 text-3xl animate-float-up select-none"
          style={{
            left: `${heart.x}%`,
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
          }}
        >
          {heart.color}
        </div>
      ))}

      {/* Floating Gift Cards & Combos */}
      {floatingGifts.map((fg) => (
        <div
          key={fg.id}
          className="absolute transition-all animate-float-up select-none"
          style={{
            bottom: '25%',
            left: `${Math.max(10, Math.min(70, fg.x))}%`,
          }}
        >
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/20 shadow-2xl">
            <span className="text-4xl filter drop-shadow-md animate-bounce">{fg.gift.icon}</span>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-pink-400">{fg.senderName} sent</span>
              <span className="text-sm font-bold text-white font-display">{fg.gift.name}</span>
            </div>
            {fg.count > 1 && (
              <div className="ml-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white text-xs font-black italic tracking-wide animate-pulse">
                x{fg.count}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
