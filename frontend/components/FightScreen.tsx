'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { League, WalletSnapshot, Player } from '../types';

interface FightScreenProps {
  league: League;
  snapshots: WalletSnapshot[];
  selectedPlayer: Player;
  betAmount?: number;
  bettedPlayerId?: string;
  onGameOver: (winner: string) => void;
  onChooseWinner: () => void;
  onBack: () => void;
}

export default function FightScreen({ league, snapshots, selectedPlayer, betAmount, bettedPlayerId, onGameOver, onChooseWinner, onBack }: FightScreenProps) {
  const [round, setRound] = useState(1);
  const [showRound, setShowRound] = useState(true);
  const [timer, setTimer] = useState(99);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [showHoldings, setShowHoldings] = useState<'player1' | 'player2' | null>(null);

  const hasSnapshots = snapshots && snapshots.length >= 2;
  const player1 = hasSnapshots ? (snapshots.find(s => s.playerId === selectedPlayer.id) || snapshots[0]) : null;
  const player2 = hasSnapshots ? (snapshots.find(s => s.playerId !== selectedPlayer.id) || snapshots[1]) : null;

  const p1 = player1 ? league.players.find(p => p.id === player1.playerId) : null;
  const p2 = player2 ? league.players.find(p => p.id === player2.playerId) : null;

  const maxHP = player1 && player2 ? Math.max(player1.totalValue, player2.totalValue) || 1 : 1;
  const p1HP = player1 ? (player1.totalValue / maxHP) * 100 : 0;
  const p2HP = player2 ? (player2.totalValue / maxHP) * 100 : 0;

  useEffect(() => {
    if (!hasSnapshots || !p1 || !p2) return;

    const roundTimeout = setTimeout(() => setShowRound(false), 2000);

    const logs = [
      'FIGHT START!',
      `${p1.username} PORTFOLIO: $${player1!.totalValue.toLocaleString()}`,
      `${p2.username} PORTFOLIO: $${player2!.totalValue.toLocaleString()}`,
    ];

    const logTimeouts: NodeJS.Timeout[] = [];
    logs.forEach((log, i) => {
      const timeout = setTimeout(() => {
        setCombatLog(prev => [...prev, log]);
      }, 2500 + i * 500);
      logTimeouts.push(timeout);
    });

    return () => {
      clearTimeout(roundTimeout);
      logTimeouts.forEach(t => clearTimeout(t));
    };
  }, [hasSnapshots, p1?.username, p2?.username, player1?.totalValue, player2?.totalValue]);

  useEffect(() => {
    if (!hasSnapshots) return;

    const roundInterval = setInterval(() => {
      setRound(prev => {
        const nextRound = prev + 1;
        if (nextRound <= 9) {
          setShowRound(true);
          setTimeout(() => setShowRound(false), 2000);
          return nextRound;
        }
        return prev;
      });
    }, 180000); // 3 minutes per round

    return () => clearInterval(roundInterval);
  }, [hasSnapshots]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(v => v > 0 ? v - 1 : 99);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!p1) return;

    const interval = setInterval(() => {
      const events = [
        `MARKET UPDATE: SOL ${Math.random() > 0.5 ? '+' : ''}${(Math.random() * 5 - 2.5).toFixed(2)}%`,
        `${p1.username} GAINS!`,
        `ZERION SYNC COMPLETE`,
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setCombatLog(prev => [...prev.slice(-10), randomEvent]);
    }, 4000);

    return () => clearInterval(interval);
  }, [p1?.username]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onBack]);

  if (!hasSnapshots) {
    return (
      <div className="min-h-screen bg-black crt-screen flex items-center justify-center">
        <div className="scanline" />
        <div className="w-full max-w-3xl text-center">
          <div className="press-start terminal-yellow text-3xl mb-6 animate-pulse">
            LOADING WALLET DATA
          </div>
          <div className="vt323 terminal-green text-xl mb-8">
            FETCHING PORTFOLIO FROM ZERION...
          </div>
          <div className="border-2 border-yellow-500 bg-black p-6">
            <div className="vt323 terminal-green text-base space-y-2">
              <div>SCANNING SOLANA CHAIN...</div>
              <div>RETRIEVING TOKEN BALANCES...</div>
              <div>CALCULATING PORTFOLIO VALUE...</div>
            </div>
          </div>
          <button
            onClick={onBack}
            className="mt-6 border-2 border-red-500 bg-black px-6 py-3 press-start terminal-red text-sm hover:bg-red-900"
          >
            BACK
          </button>
        </div>
      </div>
    );
  }

  if (!player1 || !player2) {
    return (
      <div className="min-h-screen bg-black crt-screen flex items-center justify-center">
        <div className="scanline" />
        <div className="w-full max-w-3xl text-center">
          <div className="press-start terminal-red text-3xl mb-6">
            ERROR
          </div>
          <div className="vt323 terminal-yellow text-xl mb-8">
            COULD NOT LOAD WALLET DATA
          </div>
          <button
            onClick={onBack}
            className="border-2 border-green-500 bg-black px-6 py-3 press-start terminal-green text-sm hover:bg-green-900"
          >
            BACK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black crt-screen flex items-center justify-center relative">
      <div className="scanline" />

      <div className="fixed top-4 right-4 z-50">
        <WalletMultiButton />
      </div>

      {showRound && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
          <div className="press-start terminal-yellow text-6xl animate-pulse" style={{ textShadow: '6px 6px 0 #663300' }}>
            ROUND {round}
          </div>
        </div>
      )}

      {showHoldings && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-95 z-50 p-4"
          onClick={() => setShowHoldings(null)}
        >
          <div
            className="border-8 border-double border-yellow-500 bg-black p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="press-start terminal-yellow text-2xl mb-2">
                {showHoldings === 'player1' ? p1?.username : p2?.username} HOLDINGS
              </div>
              <div className="vt323 terminal-green text-lg">
                PORTFOLIO: ${(showHoldings === 'player1' ? player1?.totalValue : player2?.totalValue)?.toLocaleString() || 0}
              </div>
              <div className={`vt323 text-base ${(showHoldings === 'player1' ? player1?.percentageChange : player2?.percentageChange) >= 0 ? 'terminal-green' : 'terminal-red'}`}>
                24H {(showHoldings === 'player1' ? player1?.percentageChange : player2?.percentageChange) >= 0 ? '▲' : '▼'} {Math.abs((showHoldings === 'player1' ? player1?.percentageChange : player2?.percentageChange) || 0).toFixed(2)}%
              </div>
            </div>

            <div className="border-2 border-green-500 bg-black p-3 mb-4">
              <div className="press-start terminal-green text-xs mb-3 text-center">
                COIN HOLDINGS ({(showHoldings === 'player1' ? player1?.tokens : player2?.tokens)?.length || 0} TOKENS)
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {(showHoldings === 'player1' ? player1?.tokens : player2?.tokens)?.map((token: any, idx: number) => (
                  <div
                    key={idx}
                    className="border-2 border-yellow-700 bg-black p-2 grid grid-cols-4 gap-2 items-center"
                  >
                    <div>
                      <div className="press-start terminal-yellow text-xs">{token.symbol}</div>
                      <div className="vt323 terminal-green text-xs">{token.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="vt323 terminal-blue text-xs">BALANCE</div>
                      <div className="press-start terminal-green text-xs">
                        {token.balance?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '0'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="vt323 terminal-blue text-xs">VALUE</div>
                      <div className="press-start terminal-yellow text-xs">
                        ${token.valueUSD?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="vt323 terminal-blue text-xs">24H</div>
                      <div className={`press-start text-xs ${(token.priceChange24h || 0) >= 0 ? 'terminal-green' : 'terminal-red'}`}>
                        {(token.priceChange24h || 0) >= 0 ? '▲' : '▼'}{Math.abs(token.priceChange24h || 0).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowHoldings(null)}
                className="border-2 border-red-500 bg-black px-6 py-3 press-start terminal-red text-sm hover:bg-red-900"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl px-2 sm:px-4 py-2">

        <div className="border-2 border-yellow-500 bg-black p-2 mb-2 relative min-h-[40px]">
          <div className="absolute top-2 left-2 border-2 border-yellow-500 bg-black px-1 sm:px-3 py-1">
            <div className="press-start terminal-yellow text-[8px] sm:text-sm">
              ROUND {round}
            </div>
          </div>
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 border-2 border-yellow-500 bg-black px-2 sm:px-4 py-1">
            <div className="press-start terminal-yellow text-[6px] sm:text-xs">
              CRYPTO WALLET CHAMPIONSHIP
            </div>
          </div>
          <div className="absolute top-2 right-2 border-2 border-yellow-500 bg-black px-1 sm:px-3 py-1">
            <div className="press-start terminal-yellow text-[8px] sm:text-sm">
              {timer.toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1 sm:gap-3 mb-2">
          <div>
            <div className="border-2 border-green-500 bg-black p-1 sm:p-2 mb-1 sm:mb-2">
              <a
                href={`https://app.zerion.io/${p1?.walletAddress}/overview`}
                target="_blank"
                rel="noopener noreferrer"
                className="press-start terminal-green text-[8px] sm:text-base text-center block hover:terminal-yellow transition-colors underline"
              >
                {p1?.username}
              </a>
              <div className="vt323 terminal-green text-[8px] sm:text-xs text-center">BLUE CORNER</div>
            </div>
            <div className="border-2 border-green-500 bg-black p-1 sm:p-2">
              <div className="h-4 sm:h-6 border-2 border-green-500 bg-black relative mb-1 sm:mb-2">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${p1HP}%` }}
                />
              </div>
              <div className="press-start terminal-green text-xs sm:text-2xl text-center mb-1">
                ${player1.totalValue.toLocaleString()}
              </div>
              <div className={`vt323 text-[10px] sm:text-base text-center terminal-green`}>
                24H {player1.percentageChange >= 0 ? '▲' : '▼'} {Math.abs(player1.percentageChange).toFixed(2)}%
              </div>
            </div>
          </div>

          <div>
            <div className="border-2 border-red-500 bg-black p-1 sm:p-2 mb-1 sm:mb-2">
              <a
                href={`https://app.zerion.io/${p2?.walletAddress}/overview`}
                target="_blank"
                rel="noopener noreferrer"
                className="press-start terminal-red text-[8px] sm:text-base text-center block hover:terminal-yellow transition-colors underline"
              >
                {p2?.username}
              </a>
              <div className="vt323 terminal-red text-[8px] sm:text-xs text-center">RED CORNER</div>
            </div>
            <div className="border-2 border-red-500 bg-black p-1 sm:p-2">
              <div className="h-4 sm:h-6 border-2 border-red-500 bg-black relative mb-1 sm:mb-2">
                <div
                  className="h-full bg-red-500 transition-all duration-500 ml-auto"
                  style={{ width: `${p2HP}%` }}
                />
              </div>
              <div className="press-start terminal-red text-xs sm:text-2xl text-center mb-1">
                ${player2.totalValue.toLocaleString()}
              </div>
              <div className={`vt323 text-[10px] sm:text-base text-center terminal-red`}>
                24H {player2.percentageChange >= 0 ? '▲' : '▼'} {Math.abs(player2.percentageChange).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        <div className="border-4 sm:border-8 border-double border-yellow-500 bg-gradient-to-b from-blue-950 to-black p-2 sm:p-6 mb-2 relative min-h-[250px] sm:min-h-[380px]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255, 255, 0, 0.05) 40px, rgba(255, 255, 0, 0.05) 42px)',
        }}>

          <div className="hidden sm:block absolute top-0 left-6 w-3 h-full border-l-4 border-r-4 border-yellow-500 opacity-40"></div>
          <div className="hidden sm:block absolute top-0 right-6 w-3 h-full border-l-4 border-r-4 border-yellow-500 opacity-40"></div>

          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 border-2 border-yellow-500 bg-black px-2 sm:px-3 py-1">
            <div className="vt323 terminal-yellow text-[8px] sm:text-xs">LIVE FROM SOLANA ARENA</div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-8 h-full items-center mt-6 sm:mt-8">

            <div className="flex flex-col items-center">
              <div className="border-2 sm:border-4 border-green-500 bg-black p-1 sm:p-2 mb-1 sm:mb-3">
                <div className="vt323 terminal-green text-[8px] sm:text-xs text-center">BLUE</div>
              </div>
              <div className="relative">
                <div
                  onClick={() => setShowHoldings('player1')}
                  className="w-20 h-20 sm:w-40 sm:h-40 rounded-full border-4 sm:border-8 border-green-500 relative cursor-pointer hover:scale-105 transition-all hover:border-yellow-500 overflow-hidden"
                  style={{
                    boxShadow: '0 0 20px rgba(0, 255, 0, 0.6)',
                    animation: 'pulse-border 2s ease-in-out infinite'
                  }}
                >
                  <Image
                    src="/kaleo.jpg"
                    alt="CRYPTOKALEO"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 border border-green-500 bg-black px-0.5 sm:px-1 rounded z-10">
                    <div className="press-start terminal-yellow text-[6px] sm:text-xs">↖</div>
                  </div>
                  <div className="absolute -bottom-4 sm:-bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className="border border-green-500 sm:border-2 bg-black px-1 sm:px-2 py-0.5 sm:py-1">
                      <div className="press-start terminal-green text-[6px] sm:text-xs">{player1?.tokens?.length || 0} COINS</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="border-2 sm:border-4 border-yellow-500 bg-black px-2 py-2 sm:px-6 sm:py-4 mb-2 sm:mb-4">
                <div className="press-start terminal-yellow text-xl sm:text-4xl text-center">VS</div>
              </div>
              <div className="border border-yellow-500 sm:border-2 bg-black px-1 py-1 sm:px-4 sm:py-2">
                <div className="vt323 terminal-yellow text-[6px] sm:text-xs text-center">DEVELOPED WITH ZERION API</div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="border-2 sm:border-4 border-red-500 bg-black p-1 sm:p-2 mb-1 sm:mb-3">
                <div className="vt323 terminal-red text-[8px] sm:text-xs text-center">RED</div>
              </div>
              <div className="relative">
                <div
                  onClick={() => setShowHoldings('player2')}
                  className="w-20 h-20 sm:w-40 sm:h-40 rounded-full border-4 sm:border-8 border-red-500 relative cursor-pointer hover:scale-105 transition-all hover:border-yellow-500 overflow-hidden"
                  style={{
                    boxShadow: '0 0 20px rgba(255, 0, 0, 0.6)',
                    animation: 'pulse-border 2s ease-in-out infinite'
                  }}
                >
                  <Image
                    src="/cobie.jpg"
                    alt="COBIE"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 border border-red-500 bg-black px-0.5 sm:px-1 rounded z-10">
                    <div className="press-start terminal-yellow text-[6px] sm:text-xs">↖</div>
                  </div>
                  <div className="absolute -bottom-4 sm:-bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className="border border-red-500 sm:border-2 bg-black px-1 sm:px-2 py-0.5 sm:py-1">
                      <div className="press-start terminal-red text-[6px] sm:text-xs">{player2?.tokens?.length || 0} COINS</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2 w-full px-2 sm:px-4">
            <div className="border border-yellow-500 sm:border-2 bg-black p-1 sm:p-2">
              <div className="vt323 terminal-yellow text-[8px] sm:text-xs text-center">
                {combatLog[combatLog.length - 1] || 'WAITING FOR ACTION...'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1 sm:gap-3 mb-2">
          <div className="border border-green-500 sm:border-2 bg-black p-1 sm:p-2">
            <div className="press-start terminal-green text-[8px] sm:text-xs mb-1 sm:mb-2 text-center">FIGHTER STATS</div>
            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex justify-between vt323 terminal-green text-[8px] sm:text-xs">
                <span>PORTFOLIO:</span>
                <span>${(player1.totalValue / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between vt323 terminal-green text-[8px] sm:text-xs">
                <span>TOKENS:</span>
                <span>{player1?.tokens?.length || 0}</span>
              </div>
              <div className="flex justify-between vt323 terminal-yellow text-[8px] sm:text-xs">
                <span>TOP COIN:</span>
                <span>{player1?.tokens?.[0]?.symbol || 'N/A'}</span>
              </div>
              <div className="flex justify-between vt323 terminal-yellow text-[8px] sm:text-xs">
                <span>STRENGTH:</span>
                <span>${(player1?.tokens?.[0]?.valueUSD / 1000 || 0).toFixed(0)}K</span>
              </div>
            </div>
          </div>

          <div className="border border-red-500 sm:border-2 bg-black p-1 sm:p-2">
            <div className="press-start terminal-red text-[8px] sm:text-xs mb-1 sm:mb-2 text-center">FIGHTER STATS</div>
            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex justify-between vt323 terminal-red text-[8px] sm:text-xs">
                <span>PORTFOLIO:</span>
                <span>${(player2.totalValue / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between vt323 terminal-red text-[8px] sm:text-xs">
                <span>TOKENS:</span>
                <span>{player2?.tokens?.length || 0}</span>
              </div>
              <div className="flex justify-between vt323 terminal-yellow text-[8px] sm:text-xs">
                <span>TOP COIN:</span>
                <span>{player2?.tokens?.[0]?.symbol || 'N/A'}</span>
              </div>
              <div className="flex justify-between vt323 terminal-yellow text-[8px] sm:text-xs">
                <span>STRENGTH:</span>
                <span>${(player2?.tokens?.[0]?.valueUSD / 1000 || 0).toFixed(0)}K</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-4 justify-center items-center">
          <div className="border border-yellow-500 sm:border-2 bg-black px-2 py-1 sm:px-3 sm:py-2 min-w-[80px] sm:min-w-[120px]">
            <div className="vt323 terminal-yellow text-[8px] sm:text-xs text-center">PRIZE POOL</div>
            <div className="press-start terminal-yellow text-[10px] sm:text-sm text-center">{league.prizePool} SOL</div>
          </div>

          {betAmount && betAmount > 0 && (
            <>
              <div className="border border-yellow-500 sm:border-2 bg-yellow-500 bg-opacity-10 px-2 py-1 sm:px-3 sm:py-2 min-w-[80px] sm:min-w-[120px]">
                <div className="vt323 terminal-yellow text-[8px] sm:text-xs text-center">YOUR BET</div>
                <div className="press-start terminal-yellow text-[10px] sm:text-sm text-center">{betAmount} SOL</div>
              </div>
              <div className="border border-yellow-500 sm:border-2 bg-black px-2 py-1 sm:px-3 sm:py-2 min-w-[80px] sm:min-w-[120px]">
                <div className="vt323 terminal-yellow text-[8px] sm:text-xs text-center">POTENTIAL WIN</div>
                <div className="press-start terminal-yellow text-[10px] sm:text-sm text-center">{(betAmount * 2).toFixed(1)} SOL</div>
              </div>
            </>
          )}

          <button
            onClick={onBack}
            className="border border-yellow-500 sm:border-2 bg-black px-2 py-1 sm:px-3 sm:py-2 press-start terminal-yellow text-sm sm:text-xl hover:bg-yellow-900 transition-all"
          >
            ←
          </button>
        </div>
      </div>
    </div>
  );
}
