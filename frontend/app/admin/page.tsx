'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { initializeGlobalState } from '@/lib/solana';

export default function AdminPage() {
  const wallet = useWallet();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [txSignature, setTxSignature] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleInitialize = async () => {
    if (!wallet.connected) {
      setError('Wallet not connected');
      return;
    }

    setStatus('loading');
    setError('');
    setTxSignature('');

    try {
      const tx = await initializeGlobalState(wallet);
      setTxSignature(tx);
      setStatus('success');
    } catch (err: any) {
      setError(err.message || 'Failed to initialize');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 border-2 border-purple-500/50 rounded-xl p-8 shadow-2xl">
          <h1 className="text-4xl font-black text-white mb-8 text-center">ADMIN PANEL</h1>

          <div className="mb-8 flex justify-center">
            <WalletMultiButton />
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-purple-500/30 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Initialize Global State</h2>
              <p className="text-purple-300 mb-4">
                This will initialize the global state account on the smart contract. 
                Only needs to be done once.
              </p>

              <button
                onClick={handleInitialize}
                disabled={!wallet.connected || status === 'loading'}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold py-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'INITIALIZING...' : 'INITIALIZE GLOBAL STATE'}
              </button>
            </div>

            {status === 'success' && txSignature && (
              <div className="bg-green-900/20 border-2 border-green-500/50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-green-400 mb-2">SUCCESS</h3>
                <p className="text-white text-sm break-all">
                  Transaction: {txSignature}
                </p>
                <a
                  href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline text-sm mt-2 inline-block"
                >
                  View on Explorer
                </a>
              </div>
            )}

            {status === 'error' && error && (
              <div className="bg-red-900/20 border-2 border-red-500/50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-red-400 mb-2">ERROR</h3>
                <p className="text-white text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
