'use client';

import { useState, useEffect } from 'react';
import { League, WalletSnapshot } from '../types';

interface BattleArenaProps {
  league: League;
  snapshots: WalletSnapshot[];
  currentUserId: string;
  onExit: () => void;
}

export default function BattleArena({ league, snapshots, currentUserId, onExit }: BattleArenaProps) {
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [turn, setTurn] = useState(0);
  const [showPortfolio, setShowPortfolio] = useState<'p1' | 'p2' | null>(null);

  const player1 = snapshots[0];
  const player2 = snapshots[1];

  const player1Name = league.players.find(p => p.id === player1.playerId)?.username || 'PLAYER_01';
  const player2Name = league.players.find(p => p.id === player2.playerId)?.username || 'CPU_ENEMY';

  const maxValue = Math.max(player1.totalValue, player2.totalValue);
  const p1HealthPercent = (player1.totalValue / maxValue) * 100;
  const p2HealthPercent = (player2.totalValue / maxValue) * 100;

  useEffect(() => {
    const initialLogs = [
      '> BATTLE INITIATED',
      '> LOADING WALLET DATA...',
      `> ${player1Name}: $${player1.totalValue.toLocaleString()}`,
      `> ${player2Name}: $${player2.totalValue.toLocaleString()}`,
      '> SYNC COMPLETE',
      '> BATTLE START!',
    ];

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < initialLogs.length) {
        setBattleLog(prev => [...prev, initialLogs[idx]]);
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTurn(prev => {
        const newTurn = prev + 1;
        const events = [
          `> TURN ${newTurn}`,
          `> MARKET UPDATE...`,
          `> ${player1Name} DELTA: ${player1.percentageChange >= 0 ? '+' : ''}${player1.percentageChange.toFixed(1)}%`,
        ];
        events.forEach((e, i) => {
          setTimeout(() => {
            setBattleLog(prevLog => [...prevLog.slice(-20), e]);
          }, i * 300);
        });
        return newTurn;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [player1Name, player1.percentageChange]);

  const getTimeRemaining = () => {
    const now = new Date().getTime();
    const end = new Date(league.endDate).getTime();
    const diff = end - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}D ${hours.toString().padStart(2, '0')}H ${mins.toString().padStart(2, '0')}M`;
  };

  return (
    <div className="min-h-screen bg-black crt-screen">
      <div className="scanline" />

      <div className="p-4">

        <div className="flex items-center justify-between mb-4 border-b-4 border-green-500 pb-3">
          <div className="terminal-green press-start text-lg">
            {league.name}
          </div>
          <div className="flex items-center gap-6">
            <div className="terminal-yellow vt323 text-xl">
              TIME: {getTimeRemaining()}
            </div>
            <button
              onClick={onExit}
              className="border-4 border-red-500 bg-black px-6 py-3 terminal-red hover:bg-red-500 hover:bg-opacity-20 transition-all press-start text-xs retro-shadow"
            >
              EXIT
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          <div className="lg:col-span-2 space-y-4">

            <div className="border-4 border-green-500 bg-black retro-shadow">
              <div className="border-2 border-green-700 m-1 p-6">

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="terminal-green press-start">
                      {player1Name}
                    </div>
                    <div className="terminal-green vt323 text-lg">
                      LV.{league.players[0].level}
                    </div>
                  </div>
                  <div className="h-10 border-4 border-green-500 bg-black relative overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-1000 relative"
                      style={{ width: `${p1HealthPercent}%` }}
                    >
                      <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center press-start text-black text-sm">
                      ${player1.totalValue.toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className={`vt323 text-xl ${player1.percentageChange >= 0 ? 'terminal-green' : 'terminal-red'}`}>
                      {player1.percentageChange >= 0 ? '▲' : '▼'} {Math.abs(player1.percentageChange).toFixed(2)}%
                    </div>
                    <button
                      onClick={() => setShowPortfolio(showPortfolio === 'p1' ? null : 'p1')}
                      className="border-2 border-green-500 px-3 py-1 terminal-green vt323 text-sm hover:bg-green-500 hover:bg-opacity-20"
                    >
                      {showPortfolio === 'p1' ? 'HIDE' : 'PORTFOLIO'}
                    </button>
                  </div>
                </div>

                <div className="text-center terminal-yellow press-start text-3xl my-6">
                  ⚔ VS ⚔
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="terminal-red press-start">
                      {player2Name}
                    </div>
                    <div className="terminal-red vt323 text-lg">
                      LV.{league.players[1].level}
                    </div>
                  </div>
                  <div className="h-10 border-4 border-red-500 bg-black relative overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all duration-1000 relative"
                      style={{ width: `${p2HealthPercent}%` }}
                    >
                      <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center press-start text-black text-sm">
                      ${player2.totalValue.toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className={`vt323 text-xl ${player2.percentageChange >= 0 ? 'terminal-green' : 'terminal-red'}`}>
                      {player2.percentageChange >= 0 ? '▲' : '▼'} {Math.abs(player2.percentageChange).toFixed(2)}%
                    </div>
                    <button
                      onClick={() => setShowPortfolio(showPortfolio === 'p2' ? null : 'p2')}
                      className="border-2 border-red-500 px-3 py-1 terminal-red vt323 text-sm hover:bg-red-500 hover:bg-opacity-20"
                    >
                      {showPortfolio === 'p2' ? 'HIDE' : 'PORTFOLIO'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {showPortfolio && (
              <div className="border-4 border-yellow-500 bg-black retro-shadow">
                <div className="border-2 border-yellow-700 m-1 p-4">
                  <div className="terminal-yellow press-start text-sm mb-4 border-b-2 border-yellow-700 pb-2">
                    {showPortfolio === 'p1' ? player1Name : player2Name} PORTFOLIO
                  </div>
                  <div className="space-y-2">
                    {(showPortfolio === 'p1' ? player1.tokens : player2.tokens).map((token, idx) => (
                      <div key={idx} className="border-2 border-yellow-700 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="terminal-yellow press-start text-xs">
                            {token.symbol}
                          </div>
                          <div className="terminal-yellow vt323 text-lg">
                            ${token.valueUSD.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm vt323">
                          <div className="terminal-yellow opacity-70">
                            {token.balance.toFixed(4)} {token.symbol}
                          </div>
                          <div className={token.priceChange24h >= 0 ? 'terminal-green' : 'terminal-red'}>
                            {token.priceChange24h >= 0 ? '▲' : '▼'} {Math.abs(token.priceChange24h).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="border-4 border-green-500 bg-black p-4 text-center retro-shadow">
                <div className="terminal-yellow vt323 text-3xl mb-1">
                  {league.prizePool}
                </div>
                <div className="terminal-green vt323 text-sm">ETH PRIZE</div>
              </div>
              <div className="border-4 border-green-500 bg-black p-4 text-center retro-shadow">
                <div className="terminal-yellow vt323 text-3xl mb-1">
                  {turn}
                </div>
                <div className="terminal-green vt323 text-sm">TURN</div>
              </div>
              <div className="border-4 border-green-500 bg-black p-4 text-center retro-shadow">
                <div className="terminal-yellow vt323 text-3xl mb-1">
                  {Math.abs(player1.totalValue - player2.totalValue).toLocaleString()}
                </div>
                <div className="terminal-green vt323 text-sm">$ GAP</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">

            <div className="border-4 border-green-500 bg-black retro-shadow">
              <div className="border-2 border-green-700 m-1 p-4">
                <div className="terminal-green press-start text-xs mb-3 border-b-2 border-green-700 pb-2">
                  BATTLE LOG
                </div>
                <div className="h-96 overflow-y-auto space-y-1 vt323 text-base terminal-green">
                  {battleLog.map((log, idx) => (
                    <div key={idx} className="whitespace-pre">
                      {log}
                      {idx === battleLog.length - 1 && <span className="blink">█</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-4 border-yellow-500 bg-black retro-shadow">
              <div className="border-2 border-yellow-700 m-1 p-4">
                <div className="terminal-yellow press-start text-xs mb-3">
                  ACTIONS
                </div>
                <div className="space-y-2">
                  <button className="w-full border-2 border-green-500 p-3 terminal-green hover:bg-green-500 hover:bg-opacity-20 transition-all vt323 text-lg">
                    PLACE BET
                  </button>
                  <button className="w-full border-2 border-blue-500 p-3 terminal-blue hover:bg-blue-500 hover:bg-opacity-20 transition-all vt323 text-lg">
                    VIEW STATS
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
