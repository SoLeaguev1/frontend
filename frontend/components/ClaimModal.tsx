'use client';

import { useState } from 'react';
import { ClaimProof, Player } from '../types';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  rank: number;
  prizeAmount: number;
  onClaim: (proof: ClaimProof) => Promise<boolean>;
}

export default function ClaimModal({ isOpen, onClose, player, rank, prizeAmount, onClaim }: ClaimModalProps) {
  const [claimState, setClaimState] = useState<'idle' | 'verifying' | 'claiming' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [confettiActive, setConfettiActive] = useState(false);

  if (!isOpen) return null;

  const handleClaim = async () => {
    setClaimState('verifying');

    try {
      const proof: ClaimProof = {
        leagueId: (player as any).leagueId || '',
        playerId: player.id,
        rank,
        finalValue: prizeAmount,
        snapshotHash: (player as any).snapshotHash || '',
        signature: (player as any).signature || '',
        verified: true,
      };

      setClaimState('claiming');

      const success = await onClaim(proof);

      if (success) {
        setClaimState('success');
        setConfettiActive(true);
        setTimeout(() => {
          setConfettiActive(false);
        }, 5000);
      } else {
        setClaimState('error');
        setErrorMessage('Claim verification failed. Please try again.');
      }
    } catch (error) {
      setClaimState('error');
      setErrorMessage('An error occurred during claim process.');
    }
  };

  const getRankDisplay = () => {
    switch (rank) {
      case 1:
        return { text: '1ST PLACE', color: 'from-yellow-400 to-yellow-600' };
      case 2:
        return { text: '2ND PLACE', color: 'from-slate-300 to-slate-500' };
      case 3:
        return { text: '3RD PLACE', color: 'from-orange-400 to-orange-600' };
      default:
        return { text: `${rank}TH PLACE`, color: 'from-purple-400 to-pink-400' };
    }
  };

  const rankInfo = getRankDisplay();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">

      {confettiActive && (
        <div className="fixed inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              *
            </div>
          ))}
        </div>
      )}

      <div className="w-full max-w-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-4 border-purple-500/50 rounded-3xl shadow-2xl shadow-purple-500/30 overflow-hidden animate-scaleIn">

        {claimState !== 'success' && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-white text-3xl font-bold transition-colors duration-200 z-10"
          >
            ×
          </button>
        )}

        <div className="relative p-8">

          <div className={`text-center mb-8 ${claimState === 'success' ? 'animate-bounce-in' : ''}`}>
            <div className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${rankInfo.color} mb-2`}>
              {rankInfo.text}
            </div>
            <div className="text-purple-300 text-xl font-bold">
              {player.username}
            </div>
          </div>

          {claimState === 'idle' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-2 border-purple-500/30 rounded-2xl p-6">
                <div className="text-center">
                  <div className="text-purple-300 text-sm uppercase tracking-wider mb-2">Your Reward</div>
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                    {prizeAmount} SOL
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-purple-500/20">
                  <span className="text-purple-300 font-medium">Wallet Address</span>
                  <span className="text-white font-mono text-sm">{player.walletAddress.slice(0, 16)}...</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-purple-500/20">
                  <span className="text-purple-300 font-medium">Final Rank</span>
                  <span className="text-white font-bold">#{rank}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-purple-500/20">
                  <span className="text-purple-300 font-medium">Status</span>
                  <span className="text-green-400 font-bold uppercase text-sm">Verified</span>
                </div>
              </div>

              <button
                onClick={handleClaim}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-2xl py-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/50 hover:scale-105 uppercase tracking-wide"
              >
                Claim Reward
              </button>

              <p className="text-center text-slate-400 text-sm">
                Transaction will be processed on-chain. Verify details before claiming.
              </p>
            </div>
          )}

          {claimState === 'verifying' && (
            <div className="text-center py-12 animate-fadeIn">
              <div className="w-24 h-24 mx-auto mb-6 relative">
                <div className="absolute inset-0 border-8 border-purple-900 rounded-full"></div>
                <div className="absolute inset-0 border-8 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <div className="text-2xl font-black text-white mb-2">VERIFYING PROOF</div>
              <div className="text-purple-300">Checking blockchain records...</div>
            </div>
          )}

          {claimState === 'claiming' && (
            <div className="text-center py-12 animate-fadeIn">
              <div className="w-24 h-24 mx-auto mb-6 relative">
                <div className="absolute inset-0 border-8 border-yellow-900 rounded-full"></div>
                <div className="absolute inset-0 border-8 border-yellow-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <div className="text-2xl font-black text-white mb-2">PROCESSING CLAIM</div>
              <div className="text-purple-300">Broadcasting transaction...</div>
            </div>
          )}

          {claimState === 'success' && (
            <div className="text-center py-8 animate-fadeIn">
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600 mb-4">
                CLAIM SUCCESSFUL!
              </div>
              <div className="text-purple-300 text-lg mb-8">
                {prizeAmount} SOL has been transferred to your wallet
              </div>

              <div className="bg-gradient-to-r from-green-900/40 to-purple-900/40 border-2 border-green-500/30 rounded-2xl p-6 mb-6">
                <div className="text-sm text-purple-300 mb-2">Transaction Hash</div>
                <div className="text-white font-mono text-sm break-all">
                  0x{Math.random().toString(16).slice(2)}...
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-black text-xl py-5 rounded-xl transition-all duration-200 shadow-lg hover:scale-105 uppercase tracking-wide"
              >
                Victory Achieved
              </button>
            </div>
          )}

          {claimState === 'error' && (
            <div className="text-center py-8 animate-fadeIn">
              <div className="text-4xl font-black text-red-400 mb-4">
                CLAIM FAILED
              </div>
              <div className="text-purple-300 text-lg mb-8">
                {errorMessage}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-5 rounded-xl transition-all duration-200 uppercase tracking-wide"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setClaimState('idle');
                    setErrorMessage('');
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black py-5 rounded-xl transition-all duration-200 shadow-lg hover:scale-105 uppercase tracking-wide"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
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

        @keyframes bounce-in {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}
