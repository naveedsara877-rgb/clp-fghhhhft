import React, { useState } from 'react';
import { X, Coins, Sparkles, CheckCircle2, Shield, Gift, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WalletModalProps {
  coins: number;
  onAddCoins: (amount: number) => void;
  onClose: () => void;
}

interface RechargePackage {
  id: string;
  coins: number;
  bonus: number;
  price: string;
  popular?: boolean;
  bestValue?: boolean;
}

const RECHARGE_PACKAGES: RechargePackage[] = [
  { id: 'pack-1', coins: 100, bonus: 0, price: '$0.99' },
  { id: 'pack-2', coins: 550, bonus: 50, price: '$4.99', popular: true },
  { id: 'pack-3', coins: 1200, bonus: 200, price: '$9.99', bestValue: true },
  { id: 'pack-4', coins: 3500, bonus: 500, price: '$24.99' },
  { id: 'pack-5', coins: 7500, bonus: 1500, price: '$49.99' },
  { id: 'pack-6', coins: 16000, bonus: 4000, price: '$99.99' },
];

export const WalletModal: React.FC<WalletModalProps> = ({
  coins,
  onAddCoins,
  onClose,
}) => {
  const [selectedPackage, setSelectedPackage] = useState<RechargePackage>(RECHARGE_PACKAGES[1]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [recentTransaction, setRecentTransaction] = useState<string | null>(null);

  const handlePurchase = (pack: RechargePackage) => {
    const totalAdded = pack.coins + pack.bonus;
    onAddCoins(totalAdded);
    setIsSuccess(true);
    setRecentTransaction(`Added ${totalAdded.toLocaleString()} Coins successfully!`);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ec4899', '#ffffff'],
    });

    setTimeout(() => {
      setIsSuccess(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Chamet Coin Wallet</h3>
              <p className="text-xs text-slate-400">Recharge coins for live gifts & 1-on-1 private calls</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Balance Banner */}
        <div className="p-5 bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-slate-900/60 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Available Balance</span>
            <div className="flex items-center gap-2 mt-0.5">
              <Coins className="w-6 h-6 text-amber-400" />
              <span className="text-3xl font-extrabold text-amber-300 font-display tabular-nums">
                {coins.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-medium">Coins</span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-[11px] font-bold text-white shadow-sm">
              👑 VIP Level 3
            </span>
            <span className="text-[10px] text-slate-400 mt-1">+10% Bonus Coin Boost</span>
          </div>
        </div>

        {/* Success Alert if purchased */}
        {isSuccess && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{recentTransaction}</span>
          </div>
        )}

        {/* Packages Grid */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Select Coin Package
            </span>
            <span className="text-xs text-pink-400 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Instant Credit</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {RECHARGE_PACKAGES.map((pack) => {
              const isSelected = selectedPackage.id === pack.id;
              return (
                <div
                  key={pack.id}
                  onClick={() => setSelectedPackage(pack)}
                  className={`relative p-3.5 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60'
                  }`}
                >
                  {pack.popular && (
                    <span className="absolute -top-2 -right-1 px-2 py-0.2 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white text-[9px] font-black uppercase tracking-wider">
                      Popular
                    </span>
                  )}
                  {pack.bestValue && (
                    <span className="absolute -top-2 -right-1 px-2 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[9px] font-black uppercase tracking-wider">
                      Best Value
                    </span>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span className="text-base font-black text-white tabular-nums">
                        {pack.coins.toLocaleString()}
                      </span>
                    </div>

                    {pack.bonus > 0 ? (
                      <span className="text-[10px] text-pink-400 font-semibold block mt-0.5">
                        +{pack.bonus} Free Bonus
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 block mt-0.5">Standard Pack</span>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">{pack.price}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(pack);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-pink-600 hover:bg-pink-500 text-white transition-colors cursor-pointer"
                    >
                      Buy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer with Instant Test Recharge CTA */}
        <div className="p-5 pt-2 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Sandbox · Instant Balance Top-up</span>
          </div>

          <button
            onClick={() => handlePurchase(selectedPackage)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-pink-500/25 transition-all transform active:scale-95 cursor-pointer"
          >
            Recharge {selectedPackage.coins + selectedPackage.bonus} Coins Now ({selectedPackage.price})
          </button>
        </div>
      </div>
    </div>
  );
};
