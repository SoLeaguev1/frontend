'use client';

import { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  onPlayerClick?: (playerId: string) => void;
}

export default function Leaderboard({ entries, currentUserId, onPlayerClick }: LeaderboardProps) {
  const [sortedEntries, setSortedEntries] = useState<LeaderboardEntry[]>(entries);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    setSortedEntries(entries);
  }, [entries]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '👑';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return rank;
    }
  };

  const getMomentumIndicator = (momentum: string, previousRank: number, currentRank: number) => {
    if (momentum === 'rising' && previousRank > currentRank) {
      return (
        <div className="flex items-center gap-1 text-green-400">
          <span className="animate-bounce">↑</span>
          <span className="text-xs font-bold">+{previousRank - currentRank}</span>
        </div>
      );
    }
    if (momentum === 'falling' && previousRank < currentRank) {
      return (
        <div className="flex items-center gap-1 text-red-400">
          <span className="animate-bounce">↓</span>
          <span className="text-xs font-bold">-{currentRank - previousRank}</span>
        </div>
      );
    }
    return <span className="text-slate-500 text-xs">—</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 mb-2">
            HALL OF LEGENDS
          </h1>
          <p className="text-purple-300 text-lg">Warriors ranked by their conquest</p>
        </div>

        <div className="space-y-4">
          {sortedEntries.map((entry, index) => {
            const isCurrentUser = entry.player.id === currentUserId;
            const isTopThree = entry.rank <= 3;
            const rankChanged = entry.rank !== entry.previousRank;

            return (
              <div
                key={entry.player.id}
                onClick={() => {
                  setHighlightedId(entry.player.id);
                  setTimeout(() => setHighlightedId(null), 2000);
                  onPlayerClick?.(entry.player.id);
                }}
                className={`relative overflow-hidden transition-all duration-500 cursor-pointer transform hover:scale-102 ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-purple-900/60 via-pink-900/40 to-purple-900/60 border-2 border-purple-400 shadow-xl shadow-purple-500/30'
                    : isTopThree
                    ? 'bg-gradient-to-r from-yellow-900/30 via-purple-900/30 to-slate-900/80 border-2 border-yellow-500/40 shadow-lg shadow-yellow-500/10'
                    : 'bg-gradient-to-r from-slate-900/80 to-purple-900/30 border-2 border-purple-500/20 hover:border-purple-500/40'
                } rounded-2xl p-6 backdrop-blur-xl ${
                  highlightedId === entry.player.id ? 'ring-4 ring-purple-500 ring-opacity-50' : ''
                } ${
                  rankChanged ? 'animate-rankChange' : ''
                }`}
              >

                {isTopThree && entry.rank === 1 && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent animate-shimmer" />
                )}

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-6">

                    <div className={`relative ${isTopThree ? 'w-20 h-20' : 'w-16 h-16'}`}>
                      <div className={`w-full h-full rounded-full flex items-center justify-center font-black text-3xl transition-all duration-300 ${
                        entry.rank === 1
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-xl shadow-yellow-500/50 animate-pulse-slow'
                          : entry.rank === 2
                          ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-black shadow-lg shadow-slate-400/30'
                          : entry.rank === 3
                          ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-black shadow-lg shadow-orange-500/30'
                          : 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
                      }`}>
                        {isTopThree ? getRankIcon(entry.rank) : entry.rank}
                      </div>

                      {entry.momentum !== 'stable' && (
                        <div className="absolute -top-1 -right-1">
                          {getMomentumIndicator(entry.momentum, entry.previousRank, entry.rank)}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`font-black text-2xl ${isCurrentUser ? 'text-purple-300' : 'text-white'}`}>
                          {entry.player.username}
                        </span>
                        {isCurrentUser && (
                          <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-bold uppercase">
                            You
                          </span>
                        )}
                        {entry.player.level && (
                          <span className="text-slate-400 text-sm font-bold">
                            LVL {entry.player.level}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-sm font-mono">
                        {entry.player.walletAddress.slice(0, 20)}...
                      </div>
                      {entry.totalBetsWon > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-yellow-500 text-xs font-bold uppercase tracking-wide">
                            {entry.totalBetsWon} Bets Won
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-4xl font-black text-white mb-2">
                      ${entry.currentValue.toLocaleString()}
                    </div>
                    <div className={`text-xl font-bold flex items-center justify-end gap-2 ${
                      entry.percentageGrowth >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <span className="text-2xl">{entry.percentageGrowth >= 0 ? '▲' : '▼'}</span>
                      <span>{Math.abs(entry.percentageGrowth).toFixed(2)}%</span>
                    </div>
                    <div className="text-slate-400 text-sm mt-1">
                      from ${entry.startingValue.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mt-6 relative">
                  <div className="flex items-center justify-between mb-2 text-xs text-slate-400 uppercase tracking-wider">
                    <span>Growth Progress</span>
                    <span>{entry.percentageGrowth.toFixed(2)}%</span>
                  </div>
                  <div className="h-4 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full transition-all duration-1000 ease-out relative overflow-hidden ${
                        entry.rank === 1
                          ? 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600'
                          : entry.rank === 2
                          ? 'bg-gradient-to-r from-slate-400 via-slate-300 to-slate-500'
                          : entry.rank === 3
                          ? 'bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600'
                          : entry.percentageGrowth >= 0
                          ? 'bg-gradient-to-r from-green-600 to-green-400'
                          : 'bg-gradient-to-r from-red-600 to-red-400'
                      }`}
                      style={{
                        width: `${Math.min(Math.max(Math.abs(entry.percentageGrowth), 0), 100)}%`
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </div>
                  </div>
                </div>

                {entry.player.badges && entry.player.badges.length > 0 && (
                  <div className="mt-4 flex gap-2">
                    {entry.player.badges.map((badge, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1 bg-purple-600/30 border border-purple-500/50 rounded-full text-purple-300 text-xs font-bold uppercase"
                      >
                        {badge}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {sortedEntries.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚔️</div>
            <div className="text-2xl font-bold text-purple-300 mb-2">No warriors yet</div>
            <div className="text-slate-400">The arena awaits its champions</div>
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

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        @keyframes rankChange {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animate-rankChange {
          animation: rankChange 0.6s ease-in-out;
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}
