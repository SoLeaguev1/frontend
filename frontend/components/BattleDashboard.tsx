'use client';

import { useState, useEffect } from 'react';
import { League, WalletSnapshot, GameEvent, Player } from '../types';

interface BattleDashboardProps {
  league: League;
  snapshots: WalletSnapshot[];
  onPlaceBet: () => void;
  currentUserId: string;
}

export default function BattleDashboard({ league, snapshots, onPlaceBet, currentUserId }: BattleDashboardProps) {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [animatingCoins, setAnimatingCoins] = useState<{ id: string; x: number; y: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent: GameEvent = {
        id: Math.random().toString(),
        type: 'rank_change',
        leagueId: league.id,
        message: 'Portfolio values updating...',
        timestamp: new Date(),
        severity: 'info',
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 5));
    }, 8000);

    return () => clearInterval(interval);
  }, [league.id]);

  const triggerCoinAnimation = () => {
    const newCoin = {
      id: Math.random().toString(),
      x: Math.random() * window.innerWidth,
      y: Math.random() * 200,
    };
    setAnimatingCoins(prev => [...prev, newCoin]);
    setTimeout(() => {
      setAnimatingCoins(prev => prev.filter(c => c.id !== newCoin.id));
    }, 2000);
  };

  const getTimeRemaining = () => {
    const now = new Date().getTime();
    const end = new Date(league.endDate).getTime();
    const diff = end - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  };

  const timeLeft = getTimeRemaining();
  const topTwo = snapshots.sort((a, b) => b.totalValue - a.totalValue).slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">

      {animatingCoins.map(coin => (
        <div
          key={coin.id}
          className="fixed pointer-events-none text-4xl animate-float-up z-50"
          style={{ left: coin.x, top: coin.y }}
        >
          <div className="animate-spin-slow text-yellow-400">◈</div>
        </div>
      ))}

      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 mb-2">
              {league.name}
            </h1>
            <p className="text-purple-300 text-lg">{league.description}</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/40 border-2 border-purple-500/30 rounded-2xl px-8 py-4 backdrop-blur-xl">
            <div className="text-purple-300 text-sm uppercase tracking-wider mb-1">Time Remaining</div>
            <div className="flex items-center gap-3 text-white">
              <div className="text-center">
                <div className="text-3xl font-black">{timeLeft.days}</div>
                <div className="text-xs text-purple-400 uppercase">Days</div>
              </div>
              <div className="text-2xl text-purple-500">:</div>
              <div className="text-center">
                <div className="text-3xl font-black">{timeLeft.hours}</div>
                <div className="text-xs text-purple-400 uppercase">Hours</div>
              </div>
              <div className="text-2xl text-purple-500">:</div>
              <div className="text-center">
                <div className="text-3xl font-black">{timeLeft.minutes}</div>
                <div className="text-xs text-purple-400 uppercase">Min</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          <div className="lg:col-span-2 space-y-6">

            <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/30 border-2 border-purple-500/30 rounded-2xl p-8 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-wide">Battle Arena</h2>
                <div className="px-4 py-2 bg-purple-600/20 border border-purple-500/40 rounded-lg">
                  <span className="text-purple-300 text-sm font-bold uppercase">{league.status}</span>
                </div>
              </div>

              {topTwo.length >= 2 ? (
                <div className="space-y-6">
                  {topTwo.map((snapshot, idx) => {
                    const player = league.players.find(p => p.id === snapshot.playerId);
                    const isCurrentUser = player?.id === currentUserId;
                    const isLeader = idx === 0;

                    return (
                      <div
                        key={snapshot.playerId}
                        className={`relative overflow-hidden rounded-xl p-6 transition-all duration-500 ${
                          isLeader
                            ? 'bg-gradient-to-r from-yellow-900/40 via-yellow-800/30 to-purple-900/40 border-2 border-yellow-500/50 shadow-xl shadow-yellow-500/20'
                            : 'bg-gradient-to-r from-slate-800/50 to-purple-900/30 border-2 border-purple-500/30'
                        }`}
                      >
                        {isLeader && (
                          <div className="absolute top-0 right-0 bg-gradient-to-br from-yellow-500 to-yellow-600 text-black font-black text-xs px-4 py-1 rounded-bl-xl uppercase tracking-wider">
                            Leader
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-2xl ${
                              isLeader
                                ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/50 animate-pulse-slow'
                                : 'bg-gradient-to-br from-purple-600 to-pink-600'
                            }`}>
                              {player?.username[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-black text-xl">{player?.username}</span>
                                {isCurrentUser && (
                                  <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full font-bold uppercase">You</span>
                                )}
                              </div>
                              <div className="text-slate-400 text-sm font-mono">{player?.walletAddress.slice(0, 16)}...</div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-3xl font-black text-white mb-1">
                              ${snapshot.totalValue.toLocaleString()}
                            </div>
                            <div className={`text-lg font-bold flex items-center justify-end gap-1 ${
                              snapshot.percentageChange >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              <span>{snapshot.percentageChange >= 0 ? '↑' : '↓'}</span>
                              <span>{Math.abs(snapshot.percentageChange).toFixed(2)}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 relative">
                          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-1000 ease-out ${
                                isLeader
                                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                  : 'bg-gradient-to-r from-purple-600 to-pink-600'
                              }`}
                              style={{
                                width: `${Math.min((snapshot.totalValue / topTwo[0].totalValue) * 100, 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {topTwo.length === 2 && (
                    <div className="text-center">
                      <div className="text-sm text-purple-400 mb-2 uppercase tracking-wider">Gap</div>
                      <div className="text-2xl font-black text-white">
                        ${(topTwo[0].totalValue - topTwo[1].totalValue).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-purple-300">
                  Waiting for warriors to enter the arena...
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/30 border-2 border-purple-500/30 rounded-xl p-6 backdrop-blur-xl">
                <div className="text-purple-300 text-sm uppercase tracking-wider mb-2">Prize Pool</div>
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                  {league.prizePool} ETH
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/30 border-2 border-purple-500/30 rounded-xl p-6 backdrop-blur-xl">
                <div className="text-purple-300 text-sm uppercase tracking-wider mb-2">Warriors</div>
                <div className="text-3xl font-black text-white">
                  {league.players.length}/{league.maxPlayers}
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/30 border-2 border-purple-500/30 rounded-xl p-6 backdrop-blur-xl">
                <div className="text-purple-300 text-sm uppercase tracking-wider mb-2">Updates</div>
                <div className="text-3xl font-black text-white uppercase text-sm">
                  {league.rules.trackingInterval}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">

            <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/30 border-2 border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl">
              <h3 className="text-xl font-black text-white uppercase tracking-wide mb-4">Live Events</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.map(event => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border-l-4 transition-all duration-300 animate-slideInRight ${
                      event.severity === 'critical'
                        ? 'bg-red-900/20 border-red-500'
                        : event.severity === 'success'
                        ? 'bg-green-900/20 border-green-500'
                        : event.severity === 'warning'
                        ? 'bg-yellow-900/20 border-yellow-500'
                        : 'bg-purple-900/20 border-purple-500'
                    }`}
                  >
                    <div className="text-white text-sm font-medium">{event.message}</div>
                    <div className="text-slate-400 text-xs mt-1">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                onPlaceBet();
                triggerCoinAnimation();
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-lg py-5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/50 hover:scale-105 uppercase tracking-wide"
            >
              Place Bet
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-200px) scale(1.5);
            opacity: 0;
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

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-float-up {
          animation: float-up 2s ease-out forwards;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
