'use client';

import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Player } from '../types';
import { fetchWalletSnapshot, getWalletPortfolioValue } from '../lib/api';

interface CharacterSelectProps {
  players: Player[];
  onSelect: (player: Player) => void;
  onBack: () => void;
}

interface PlayerPreview {
  player: Player;
  portfolioValue: number;
  topTokens: Array<{symbol: string; value: number}>;
  loading: boolean;
}

export default function CharacterSelect({ players, onSelect, onBack }: CharacterSelectProps) {
  const [selected, setSelected] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [playerPreviews, setPlayerPreviews] = useState<PlayerPreview[]>([]);

  useEffect(() => {
    const loadPlayerData = async () => {
      const previews = await Promise.all(
        players.map(async (player) => {
          const snapshot = await fetchWalletSnapshot(player.walletAddress);
          return {
            player,
            portfolioValue: snapshot?.totalValue || 0,
            topTokens: snapshot?.tokens.slice(0, 3).map((t: any) => ({
              symbol: t.symbol,
              value: t.valueUSD
            })) || [],
            loading: false,
          };
        })
      );
      setPlayerPreviews(previews);
    };

    loadPlayerData();
  }, [players]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(v => {
        if (v <= 1) {
          onSelect(players[selected]);
          return 0;
        }
        return v - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selected, players, onSelect]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelected(v => v > 0 ? v - 1 : players.length - 1);
        setCountdown(10);
      } else if (e.key === 'ArrowRight') {
        setSelected(v => v < players.length - 1 ? v + 1 : 0);
        setCountdown(10);
      } else if (e.key === 'Enter') {
        onSelect(players[selected]);
      } else if (e.key === 'Escape') {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selected, players, onSelect, onBack]);

  return (
    <div className="min-h-screen bg-black crt-screen flex items-center justify-center p-4">
      <div className="scanline" />

      <div className="fixed top-4 right-4 z-50">
        <WalletMultiButton />
      </div>

      <div className="w-full max-w-5xl">

        <div className="text-center mb-8">
          <div className="press-start terminal-yellow text-4xl mb-3">
            SELECT FIGHTER
          </div>
          <div className="vt323 terminal-red text-3xl animate-pulse">
            TIME: {countdown}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          {players.map((player, idx) => {
            const preview = playerPreviews[idx];
            return (
              <div
                key={player.id}
                onClick={() => {
                  setSelected(idx);
                  setCountdown(10);
                }}
                className={`cursor-pointer border-4 bg-black p-6 transition-all ${
                  selected === idx
                    ? 'border-yellow-500 scale-110 bg-yellow-500 bg-opacity-10'
                    : 'border-green-500 opacity-60'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-32 h-32 rounded-full border-4 mb-4 flex items-center justify-center ${
                    selected === idx
                      ? 'border-yellow-500 bg-gradient-to-br from-yellow-900 to-yellow-700'
                      : 'border-green-500 bg-gradient-to-br from-green-900 to-green-700'
                  }`}>
                    <div className="press-start text-5xl text-black">{player.username[0]}</div>
                  </div>

                  <div className={`press-start text-2xl mb-2 ${
                    selected === idx ? 'terminal-yellow' : 'terminal-green'
                  }`}>
                    {player.username}
                  </div>

                  <div className={`vt323 text-sm mb-4 ${
                    selected === idx ? 'terminal-yellow' : 'terminal-green'
                  }`}>
                    {player.walletAddress.slice(0, 8)}...{player.walletAddress.slice(-4)}
                  </div>

                  {preview && (
                    <div className="w-full border-2 border-green-700 bg-black p-3 mb-3">
                      <div className="press-start terminal-green text-xs mb-2 text-center">
                        PORTFOLIO
                      </div>
                      <div className="vt323 terminal-yellow text-lg text-center mb-2">
                        ${preview.portfolioValue.toLocaleString()}
                      </div>
                      <div className="space-y-1">
                        {preview.topTokens.map((token, i) => (
                          <div key={i} className="flex justify-between vt323 terminal-green text-sm">
                            <span>{token.symbol}</span>
                            <span>${token.value.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={`press-start text-sm ${
                    selected === idx ? 'terminal-yellow' : 'terminal-green'
                  }`}>
                    LVL {player.level}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-2 border-green-500 bg-black p-4">
          <div className="vt323 terminal-green text-lg text-center">
            ← → CHOOSE | ENTER SELECT | ESC BACK
          </div>
        </div>

      </div>
    </div>
  );
}
