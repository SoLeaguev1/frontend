'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { createBattle, joinBattle } from '../lib/solana';
import { PublicKey } from '@solana/web3.js';

interface BattleManagerProps {
  onBack: () => void;
  onBattleCreated?: (battlePDA: string) => void;
  onBattleJoined?: (battleAddress: string) => void;
}

export default function BattleManager({ onBack, onBattleCreated, onBattleJoined }: BattleManagerProps) {
  const wallet = useWallet();
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create Battle State
  const [battleType, setBattleType] = useState<'OneVsOne' | 'Friends'>('OneVsOne');
  const [leagueAmount, setLeagueAmount] = useState(1);
  const [durationDays, setDurationDays] = useState(7);

  // Join Battle State
  const [battleAddress, setBattleAddress] = useState('');

  const handleCreateBattle = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setError('WALLET NOT CONNECTED');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Creating battle:', {
        battleType,
        leagueAmount,
        durationDays,
        wallet: wallet.publicKey.toBase58()
      });

      const result = await createBattle(
        wallet,
        battleType,
        leagueAmount,
        durationDays
      );

      console.log('Battle created successfully:', {
        battlePDA: result.battlePDA.toBase58(),
        signature: result.signature
      });

      setSuccess(`BATTLE CREATED! PDA: ${result.battlePDA.toBase58().slice(0, 8)}...`);
      
      if (onBattleCreated) {
        onBattleCreated(result.battlePDA.toBase58());
      }

    } catch (err: any) {
      console.error('Battle creation failed:', err);
      
      let errorMsg = 'BATTLE CREATION FAILED';
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
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
    }
  };


  const handleJoinBattle = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setError('WALLET NOT CONNECTED');
      return;
    }

    if (!battleAddress || battleAddress.length < 32) {
      setError('INVALID BATTLE ADDRESS');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Joining battle:', {
        battleAddress,
        wallet: wallet.publicKey.toBase58()
      });

      const signature = await joinBattle(wallet, battleAddress);

      console.log('Battle joined successfully:', {
        signature,
        battleAddress
      });

      setSuccess(`BATTLE JOINED! TX: ${signature.slice(0, 8)}...`);
      
      if (onBattleJoined) {
        onBattleJoined(battleAddress);
      }

    } catch (err: any) {
      console.error('Battle join failed:', err);
      
      let errorMsg = 'BATTLE JOIN FAILED';
      if (err?.message) {
        if (err.message.includes('User rejected')) {
          errorMsg = 'USER REJECTED TX';
        } else if (err.message.includes('Insufficient')) {
          errorMsg = 'INSUFFICIENT FUNDS';
        } else if (err.message.includes('Invalid')) {
          errorMsg = 'INVALID BATTLE ADDRESS';
        } else {
          errorMsg = err.message.substring(0, 50);
        }
      }
      
      setError(errorMsg);
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-black crt-screen flex items-center justify-center p-4">
      <div className="scanline" />

      <div className="fixed top-4 right-4 z-50">
        <WalletMultiButton />
      </div>

      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <div className="press-start terminal-yellow text-3xl mb-3">
            BATTLE MANAGER
          </div>
          <div className="vt323 terminal-green text-lg">
            CREATE OR JOIN BATTLES ON-CHAIN
          </div>
        </div>


        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 border-2 p-3 press-start text-sm transition-all ${
              activeTab === 'create'
                ? 'border-yellow-500 bg-yellow-500 bg-opacity-20 terminal-yellow'
                : 'border-green-500 bg-black terminal-green hover:bg-green-900'
            }`}
          >
            CREATE BATTLE
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 border-2 p-3 press-start text-sm transition-all ${
              activeTab === 'join'
                ? 'border-yellow-500 bg-yellow-500 bg-opacity-20 terminal-yellow'
                : 'border-green-500 bg-black terminal-green hover:bg-green-900'
            }`}
          >
            JOIN BATTLE
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="border-2 border-red-500 bg-red-500 bg-opacity-20 p-3 mb-4">
            <div className="press-start terminal-red text-xs text-center animate-pulse">
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="border-2 border-green-500 bg-green-500 bg-opacity-20 p-3 mb-4">
            <div className="press-start terminal-green text-xs text-center animate-pulse">
              {success}
            </div>
          </div>
        )}

        {/* Create Battle Tab */}
        {activeTab === 'create' && (
          <div className="border-4 border-yellow-500 bg-black p-6 mb-6">
            <div className="press-start terminal-yellow text-lg mb-4 text-center">
              CREATE NEW BATTLE
            </div>

            {/* Battle Type */}
            <div className="mb-4">
              <div className="press-start terminal-green text-xs mb-2">BATTLE TYPE</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setBattleType('OneVsOne')}
                  disabled={isProcessing}
                  className={`flex-1 border-2 p-2 press-start text-xs transition-all ${
                    battleType === 'OneVsOne'
                      ? 'border-yellow-500 bg-yellow-500 bg-opacity-20 terminal-yellow'
                      : 'border-green-500 bg-black terminal-green hover:bg-green-900'
                  } disabled:opacity-30`}
                >
                  1 VS 1
                </button>
                <button
                  onClick={() => setBattleType('Friends')}
                  disabled={isProcessing}
                  className={`flex-1 border-2 p-2 press-start text-xs transition-all ${
                    battleType === 'Friends'
                      ? 'border-yellow-500 bg-yellow-500 bg-opacity-20 terminal-yellow'
                      : 'border-green-500 bg-black terminal-green hover:bg-green-900'
                  } disabled:opacity-30`}
                >
                  FRIENDS
                </button>
              </div>
            </div>

            {/* League Amount */}
            <div className="mb-4">
              <div className="press-start terminal-green text-xs mb-2">ENTRY FEE (SOL)</div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setLeagueAmount(v => Math.max(0.1, v - 0.1))}
                  disabled={isProcessing}
                  className="border-2 border-green-500 bg-black w-10 h-10 press-start terminal-green text-xl hover:bg-green-900 disabled:opacity-30"
                >
                  -
                </button>
                <div className="border-2 border-yellow-500 bg-black px-6 py-2 min-w-[120px]">
                  <div className="press-start terminal-yellow text-lg text-center">
                    {leagueAmount.toFixed(1)}
                  </div>
                </div>
                <button
                  onClick={() => setLeagueAmount(v => Math.min(10, v + 0.1))}
                  disabled={isProcessing}
                  className="border-2 border-green-500 bg-black w-10 h-10 press-start terminal-green text-xl hover:bg-green-900 disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>

            {/* Duration */}
            <div className="mb-6">
              <div className="press-start terminal-green text-xs mb-2">DURATION (DAYS)</div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDurationDays(v => Math.max(1, v - 1))}
                  disabled={isProcessing}
                  className="border-2 border-green-500 bg-black w-10 h-10 press-start terminal-green text-xl hover:bg-green-900 disabled:opacity-30"
                >
                  -
                </button>
                <div className="border-2 border-yellow-500 bg-black px-6 py-2 min-w-[120px]">
                  <div className="press-start terminal-yellow text-lg text-center">
                    {durationDays}
                  </div>
                </div>
                <button
                  onClick={() => setDurationDays(v => Math.min(30, v + 1))}
                  disabled={isProcessing}
                  className="border-2 border-green-500 bg-black w-10 h-10 press-start terminal-green text-xl hover:bg-green-900 disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleCreateBattle}
              disabled={isProcessing || !wallet.connected}
              className={`w-full border-2 p-3 press-start text-sm transition-all ${
                isProcessing
                  ? 'border-blue-500 bg-blue-500 bg-opacity-20 terminal-blue animate-pulse'
                  : 'border-green-500 bg-green-500 bg-opacity-20 terminal-green hover:bg-opacity-40'
              } disabled:opacity-30`}
            >
              {isProcessing ? 'CREATING BATTLE...' : 'CREATE BATTLE'}
            </button>
          </div>
        )}

        {/* Join Battle Tab */}
        {activeTab === 'join' && (
          <div className="border-4 border-blue-500 bg-black p-6 mb-6">
            <div className="press-start terminal-blue text-lg mb-4 text-center">
              JOIN EXISTING BATTLE
            </div>

            <div className="mb-6">
              <div className="press-start terminal-green text-xs mb-2">BATTLE ADDRESS</div>
              <input
                type="text"
                value={battleAddress}
                onChange={(e) => setBattleAddress(e.target.value)}
                placeholder="Enter battle PDA address..."
                disabled={isProcessing}
                className="w-full border-2 border-green-500 bg-black p-3 vt323 terminal-green text-base focus:border-yellow-500 focus:outline-none disabled:opacity-30"
              />
              <div className="vt323 terminal-blue text-xs mt-1">
                PASTE THE BATTLE PDA ADDRESS FROM BATTLE CREATOR
              </div>
            </div>

            <button
              onClick={handleJoinBattle}
              disabled={isProcessing || !wallet.connected || !battleAddress}
              className={`w-full border-2 p-3 press-start text-sm transition-all ${
                isProcessing
                  ? 'border-blue-500 bg-blue-500 bg-opacity-20 terminal-blue animate-pulse'
                  : 'border-green-500 bg-green-500 bg-opacity-20 terminal-green hover:bg-opacity-40'
              } disabled:opacity-30`}
            >
              {isProcessing ? 'JOINING BATTLE...' : 'JOIN BATTLE'}
            </button>
          </div>
        )}

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={onBack}
            disabled={isProcessing}
            className="border-2 border-red-500 bg-black px-6 py-3 press-start terminal-red text-sm hover:bg-red-900 disabled:opacity-30"
          >
            BACK TO MENU
          </button>
        </div>
      </div>
    </div>
  );
}