'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Player } from '../types';
import { placeBet, connection } from '../lib/solana';

interface BettingModalProps {
  players: Player[];
  battlePDA?: string;
  onViewLive: () => void;
  onConfirm: (playerId: string, amount: number) => void;
  onBack: () => void;
}

export default function BettingModal({ players, battlePDA, onViewLive, onConfirm, onBack }: BettingModalProps) {
  const wallet = useWallet();
  const [selectedPlayer, setSelectedPlayer] = useState(0);
  const [amount, setAmount] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setError('WALLET NOT CONNECTED');
      return;
    }

    if (!players || !players[selectedPlayer]) {
      setError('INVALID PLAYER SELECTION');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // For demo mode, create a temporary battle PDA for betting
      const actualBattlePDA: string =
        (!battlePDA || battlePDA === 'main-event-demo')
          ? 'DemoB4tt1ePDA1111111111111111111111111111111'
          : battlePDA;

      console.log('Placing bet:', {
        battle: actualBattlePDA,
        winner: players[selectedPlayer].username,
        amount: amount + ' SOL'
      });

      const result = await placeBet(
        wallet,
        actualBattlePDA,
        players[selectedPlayer].walletAddress,
        amount
      );

      console.log('Bet placed successfully:', result);

      setConfirmed(true);
      setIsProcessing(false);
      onConfirm(players[selectedPlayer].id, amount);
    } catch (err: any) {

      let errorMsg = 'TRANSACTION FAILED';
      if (err?.message) {
        if (err.message.includes('User rejected')) {
          errorMsg = 'USER REJECTED TX';
        } else if (err.message.includes('Insufficient')) {
          errorMsg = 'INSUFFICIENT FUNDS';
        } else {
          errorMsg = err.message.substring(0, 50);
        }
      }

      setError(errorMsg);
      setIsProcessing(false);
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-black crt-screen flex items-center justify-center p-4">
      <div className="scanline" />

      <div className="fixed top-4 right-4 z-50">
        <WalletMultiButton />
      </div>

      <div className="border-4 border-yellow-500 bg-black p-6 max-w-2xl w-full">

        <div className="text-center mb-6">
          <div className="press-start terminal-yellow text-2xl mb-3">
            CHOOSE WINNER
          </div>
          <div className="vt323 terminal-green text-lg mb-2">
            STAKE SOL ON YOUR PICK
          </div>
          {battlePDA === 'main-event-demo' ? (
            <div className="vt323 terminal-red text-xs mt-2 animate-pulse">
              REAL SOL BETTING - WALLET REQUIRED
            </div>
          ) : battlePDA ? (
            <div className="vt323 terminal-blue text-xs mt-2">
              BATTLE: {battlePDA.slice(0, 8)}...{battlePDA.slice(-8)}
            </div>
          ) : null}
        </div>

        {error && (
          <div className="border-2 border-red-500 bg-red-500 bg-opacity-20 p-3 mb-4">
            <div className="press-start terminal-red text-xs text-center animate-pulse">
              {error}
            </div>
          </div>
        )}

        <div className="flex gap-6 mb-6 justify-center">
          {players.map((player, idx) => (
            <div
              key={player.id}
              onClick={() => !isProcessing && setSelectedPlayer(idx)}
              className={`cursor-pointer border-4 p-4 transition-all ${
                selectedPlayer === idx
                  ? 'border-yellow-500 bg-yellow-500 bg-opacity-10 scale-105'
                  : 'border-green-800'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-green-900 to-green-700 border-4 border-green-500 flex items-center justify-center mb-2">
                <div className="press-start text-4xl text-black">
                  {player.username[0]}
                </div>
              </div>
              <div className={`text-center press-start text-xs ${selectedPlayer === idx ? 'terminal-yellow' : 'terminal-green'}`}>
                {player.username}
              </div>
            </div>
          ))}
        </div>

        <div className="border-2 border-green-500 bg-black p-3 mb-4">
          <div className="press-start terminal-green text-xs mb-3 text-center">
            STAKE AMOUNT (SOL)
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setAmount(v => Math.max(1, v - 1))}
              disabled={isProcessing}
              className="border-2 border-green-500 bg-black w-10 h-10 press-start terminal-green text-xl hover:bg-green-900 disabled:opacity-30"
            >
              -
            </button>
            <div className="border-2 border-yellow-500 bg-black px-6 py-2 min-w-[100px]">
              <div className="press-start terminal-yellow text-2xl text-center">
                {amount}
              </div>
            </div>
            <button
              onClick={() => setAmount(v => Math.min(10, v + 1))}
              disabled={isProcessing}
              className="border-2 border-green-500 bg-black w-10 h-10 press-start terminal-green text-xl hover:bg-green-900 disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>

        <div className="border-2 border-blue-500 bg-black p-3 mb-4">
          <div className="vt323 terminal-blue text-base text-center">
            IF {players[selectedPlayer].username} WINS:
            <div className="terminal-yellow text-xl mt-1">
              +{(amount * 2).toFixed(1)} SOL
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-3">
          <button
            onClick={handleConfirm}
            disabled={confirmed || isProcessing}
            className={`flex-1 border-2 p-3 press-start text-sm transition-all ${
              confirmed
                ? 'border-yellow-500 bg-yellow-500 bg-opacity-40 terminal-yellow'
                : isProcessing
                ? 'border-blue-500 bg-blue-500 bg-opacity-20 terminal-blue animate-pulse'
                : 'border-green-500 bg-green-500 bg-opacity-20 terminal-green hover:bg-opacity-40 animate-pulse'
            }`}
          >
            {confirmed ? 'BET PLACED!' : isProcessing ? 'PROCESSING...' : 'CONFIRM BET'}
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onViewLive}
            disabled={isProcessing}
            className={`flex-1 border-2 p-3 press-start text-sm transition-all ${
              confirmed
                ? 'border-green-500 bg-green-500 bg-opacity-20 terminal-green hover:bg-opacity-40 animate-pulse'
                : 'border-yellow-500 bg-black terminal-yellow hover:bg-yellow-900 disabled:opacity-30'
            }`}
          >
            {confirmed ? 'VIEW LIVE FIGHT' : 'SKIP BET - VIEW LIVE'}
          </button>
          <button
            onClick={onBack}
            disabled={isProcessing}
            className="flex-1 border-2 border-red-500 bg-black p-3 press-start terminal-red text-sm hover:bg-red-900 disabled:opacity-30"
          >
            BACK
          </button>
        </div>

        <div className="border-t-2 border-green-700 mt-4 pt-3">
          <div className="vt323 terminal-green text-xs text-center space-y-1">
            <div>WINNER TAKES ALL BATTLE</div>
            <div>CORRECT BETS SHARE POOL</div>
            <div>WRONG BETS LOSE EVERYTHING</div>
          </div>
        </div>
      </div>
    </div>
  );
}
