'use client';

import { useState, useMemo } from 'react';
import { WalletSnapshot, TokenBalance, Player } from '../types';

interface PortfolioDisplayProps {
  player: Player;
  snapshots: WalletSnapshot[];
  currentSnapshot: WalletSnapshot;
}

export default function PortfolioDisplay({ player, snapshots, currentSnapshot }: PortfolioDisplayProps) {
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'tokens'>('chart');

  const chartData = useMemo(() => {
    return snapshots.slice(-20).map((snap, idx) => ({
      timestamp: snap.timestamp,
      value: snap.totalValue,
      index: idx,
    }));
  }, [snapshots]);

  const maxValue = Math.max(...chartData.map(d => d.value));
  const minValue = Math.min(...chartData.map(d => d.value));
  const valueRange = maxValue - minValue;

  const topTokens = currentSnapshot.tokens
    .sort((a, b) => b.valueUSD - a.valueUSD)
    .slice(0, 5);

  const totalValue = currentSnapshot.totalValue;
  const startValue = snapshots[0]?.totalValue || totalValue;
  const growth = ((totalValue - startValue) / startValue) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-purple-500/50">
              {player.username[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">{player.username}</h1>
              <p className="text-purple-300 font-mono text-sm">{player.walletAddress.slice(0, 24)}...</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-6 py-3 rounded-xl font-bold uppercase text-sm transition-all duration-200 ${
                viewMode === 'chart'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-slate-900/50 border-2 border-purple-500/30 text-purple-300 hover:border-purple-500/60'
              }`}
            >
              Chart
            </button>
            <button
              onClick={() => setViewMode('tokens')}
              className={`px-6 py-3 rounded-xl font-bold uppercase text-sm transition-all duration-200 ${
                viewMode === 'tokens'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-slate-900/50 border-2 border-purple-500/30 text-purple-300 hover:border-purple-500/60'
              }`}
            >
              Tokens
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/30 border-2 border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl">
            <div className="text-purple-300 text-sm uppercase tracking-wider mb-2">Total Value</div>
            <div className="text-4xl font-black text-white">
              ${totalValue.toLocaleString()}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/30 border-2 border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl">
            <div className="text-purple-300 text-sm uppercase tracking-wider mb-2">Growth</div>
            <div className={`text-4xl font-black ${growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {growth >= 0 ? '+' : ''}{growth.toFixed(2)}%
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/30 border-2 border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl">
            <div className="text-purple-300 text-sm uppercase tracking-wider mb-2">Assets</div>
            <div className="text-4xl font-black text-white">
              {currentSnapshot.tokens.length}
            </div>
          </div>
        </div>

        {viewMode === 'chart' && (
          <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/30 border-2 border-purple-500/30 rounded-2xl p-8 backdrop-blur-xl mb-8">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-6">Portfolio Evolution</h2>

            <div className="relative h-80">
              <div className="absolute inset-0 flex items-end justify-between gap-1">
                {chartData.map((point, idx) => {
                  const heightPercent = valueRange > 0
                    ? ((point.value - minValue) / valueRange) * 100
                    : 50;

                  return (
                    <div
                      key={idx}
                      className="flex-1 relative group cursor-pointer"
                      style={{ height: '100%' }}
                    >
                      <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t-lg transition-all duration-300 hover:from-purple-500 hover:to-pink-400"
                        style={{ height: `${heightPercent}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>

                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-purple-500 rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                        <div className="text-white font-bold text-sm">
                          ${point.value.toLocaleString()}
                        </div>
                        <div className="text-purple-300 text-xs">
                          {new Date(point.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 border-t border-purple-500/20" />
                <div className="absolute top-1/4 left-0 right-0 border-t border-purple-500/20" />
                <div className="absolute top-1/2 left-0 right-0 border-t border-purple-500/20" />
                <div className="absolute top-3/4 left-0 right-0 border-t border-purple-500/20" />
                <div className="absolute bottom-0 left-0 right-0 border-t border-purple-500/20" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 text-xs text-purple-300">
              <span>Start</span>
              <span>Now</span>
            </div>
          </div>
        )}

        {viewMode === 'tokens' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">Top Holdings</h2>

            {topTokens.map((token, idx) => {
              const percentage = (token.valueUSD / totalValue) * 100;

              return (
                <div
                  key={token.address}
                  onClick={() => setSelectedToken(token)}
                  className="bg-gradient-to-br from-slate-900/80 to-purple-900/30 border-2 border-purple-500/30 hover:border-purple-500/60 rounded-2xl p-6 backdrop-blur-xl cursor-pointer transition-all duration-200 hover:scale-102"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-black text-lg">
                        {token.symbol[0]}
                      </div>
                      <div>
                        <div className="text-white font-black text-xl">{token.symbol}</div>
                        <div className="text-purple-300 text-sm">{token.name}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-white">
                        ${token.valueUSD.toLocaleString()}
                      </div>
                      <div className={`text-sm font-bold ${
                        token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}% 24h
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-300">Portfolio Share</span>
                      <span className="text-white font-bold">{percentage.toFixed(2)}%</span>
                    </div>

                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-1000 ease-out relative overflow-hidden"
                        style={{ width: `${percentage}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-300">Balance</span>
                      <span className="text-white font-mono">{token.balance.toFixed(6)} {token.symbol}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {currentSnapshot.tokens.length > 5 && (
              <div className="text-center">
                <button className="text-purple-400 hover:text-purple-300 font-bold uppercase text-sm tracking-wider transition-colors duration-200">
                  View All {currentSnapshot.tokens.length} Assets
                </button>
              </div>
            )}
          </div>
        )}

        {selectedToken && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => setSelectedToken(null)}
          >
            <div
              className="w-full max-w-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-4 border-purple-500/50 rounded-3xl p-8 shadow-2xl shadow-purple-500/30 animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-black text-2xl">
                    {selectedToken.symbol[0]}
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">{selectedToken.symbol}</div>
                    <div className="text-purple-300">{selectedToken.name}</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedToken(null)}
                  className="text-slate-400 hover:text-white text-3xl font-bold transition-colors duration-200"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-purple-500/20">
                  <span className="text-purple-300 font-medium">Value</span>
                  <span className="text-white font-black text-xl">${selectedToken.valueUSD.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-purple-500/20">
                  <span className="text-purple-300 font-medium">Balance</span>
                  <span className="text-white font-mono">{selectedToken.balance.toFixed(6)}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-purple-500/20">
                  <span className="text-purple-300 font-medium">24h Change</span>
                  <span className={`font-bold ${selectedToken.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedToken.priceChange24h >= 0 ? '+' : ''}{selectedToken.priceChange24h.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-purple-500/20">
                  <span className="text-purple-300 font-medium">Address</span>
                  <span className="text-white font-mono text-sm">{selectedToken.address.slice(0, 16)}...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}
