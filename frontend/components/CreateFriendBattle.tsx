'use client';

import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Player } from '../types';
import { getSolanaTopTokens } from '../lib/api';

interface CreateFriendBattleProps {
  onCreateBattle: (friends: Player[], buyIn: number, coins: string[], timeline: number) => void;
  onBack: () => void;
}

interface SolanaToken {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  icon?: string;
}

const timelines = [
  { label: '1 DAY', value: 1 },
  { label: '3 DAYS', value: 3 },
  { label: '7 DAYS', value: 7 },
];

export default function CreateFriendBattle({ onCreateBattle, onBack }: CreateFriendBattleProps) {
  const [walletInput, setWalletInput] = useState('');
  const [friends, setFriends] = useState<Player[]>([]);
  const [buyIn, setBuyIn] = useState(5);
  const [selectedCoins, setSelectedCoins] = useState<string[]>([]);
  const [timeline, setTimeline] = useState(7);
  const [availableTokens, setAvailableTokens] = useState<SolanaToken[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTokens = async () => {
      setLoading(true);
      const tokens = await getSolanaTopTokens();
      setAvailableTokens(tokens.slice(0, 20));
      setLoading(false);
    };
    loadTokens();
  }, []);

  const isValidSolanaAddress = (address: string): boolean => {
    // Solana addresses are base58 encoded and typically 32-44 characters
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
  };

  const addFriend = () => {
    const trimmedInput = walletInput.trim();

    if (!trimmedInput) {
      alert('Please enter a wallet address');
      return;
    }

    if (!isValidSolanaAddress(trimmedInput)) {
      alert('Invalid Solana wallet address. Must be 32-44 characters (base58).');
      return;
    }

    if (friends.some(f => f.walletAddress === trimmedInput)) {
      alert('This wallet address is already added.');
      return;
    }

    if (friends.length >= 5) {
      alert('Maximum 5 friends allowed.');
      return;
    }

    const newFriend: Player = {
      id: `friend-${friends.length + 1}`,
      username: `PLAYER_${friends.length + 1}`,
      walletAddress: trimmedInput,
      level: Math.floor(Math.random() * 50) + 50,
    };
    setFriends([...friends, newFriend]);
    setWalletInput('');
  };

  const removeFriend = (id: string) => {
    setFriends(friends.filter(f => f.id !== id));
  };

  const toggleCoin = (tokenId: string) => {
    if (selectedCoins.includes(tokenId)) {
      setSelectedCoins(selectedCoins.filter(c => c !== tokenId));
    } else if (selectedCoins.length < 6) {
      setSelectedCoins([...selectedCoins, tokenId]);
    }
  };

  const handleCreate = () => {
    if (friends.length === 0) {
      alert('Please add at least one friend to battle!');
      return;
    }

    if (selectedCoins.length === 0) {
      alert('Please select at least one token to track!');
      return;
    }

    onCreateBattle(friends, buyIn, selectedCoins, timeline);
  };

  const totalPrize = (friends.length + 1) * buyIn;

  return (
    <div className="min-h-screen bg-black crt-screen flex items-center justify-center p-4">
      <div className="scanline" />

      <div className="fixed top-4 right-4 z-50">
        <WalletMultiButton />
      </div>

      <div className="w-full max-w-5xl">

        <div className="text-center mb-6">
          <div className="press-start terminal-yellow text-2xl mb-2">
            CREATE FRIEND BATTLE
          </div>
          <div className="vt323 terminal-green text-lg">
            SET UP YOUR COMPETITION
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">

          <div className="border-2 border-green-500 bg-black p-4">
            <div className="press-start terminal-green text-xs mb-3 text-center pb-2 border-b border-green-700">
              ADD FRIENDS ({friends.length}/5)
            </div>

            <div className="mb-3">
              <input
                type="text"
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addFriend()}
                placeholder="SOLANA WALLET ADDRESS (44 CHARS)"
                className="w-full bg-black border-2 border-green-700 p-2 vt323 terminal-green text-xs focus:border-yellow-500 outline-none"
                maxLength={44}
              />
            </div>

            <button
              onClick={addFriend}
              disabled={!walletInput.trim() || friends.length >= 5}
              className="w-full border-2 border-green-500 bg-black p-2 press-start terminal-green text-xs hover:bg-green-900 disabled:opacity-30 mb-3"
            >
              ADD FRIEND
            </button>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {friends.map((friend) => (
                <div key={friend.id} className="border border-green-700 p-2 flex items-center justify-between">
                  <div className="vt323 terminal-green text-sm truncate flex-1">
                    {friend.walletAddress}
                  </div>
                  <button
                    onClick={() => removeFriend(friend.id)}
                    className="ml-2 press-start terminal-red text-xs hover:bg-red-900 px-2"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">

            <div className="border-2 border-yellow-500 bg-black p-4">
              <div className="press-start terminal-yellow text-xs mb-2 text-center pb-2 border-b border-yellow-700">
                BUY-IN AMOUNT (SOL)
              </div>
              <div className="vt323 terminal-green text-xs text-center mb-3">
                SPREAD ACROSS SELECTED COINS
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setBuyIn(v => Math.max(1, v - 1))}
                  className="border-2 border-green-500 bg-black w-10 h-10 press-start terminal-green text-xl hover:bg-green-900"
                >
                  -
                </button>
                <div className="border-2 border-yellow-500 bg-black px-6 py-2 min-w-[80px]">
                  <div className="press-start terminal-yellow text-xl text-center">
                    {buyIn}
                  </div>
                </div>
                <button
                  onClick={() => setBuyIn(v => Math.min(50, v + 1))}
                  className="border-2 border-green-500 bg-black w-10 h-10 press-start terminal-green text-xl hover:bg-green-900"
                >
                  +
                </button>
              </div>
            </div>

            <div className="border-2 border-blue-500 bg-black p-4">
              <div className="press-start terminal-blue text-xs mb-3 text-center pb-2 border-b border-blue-700">
                TIMELINE
              </div>
              <div className="grid grid-cols-3 gap-2">
                {timelines.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTimeline(t.value)}
                    className={`border-2 p-2 press-start text-xs ${
                      timeline === t.value
                        ? 'border-yellow-500 bg-yellow-500 bg-opacity-20 terminal-yellow'
                        : 'border-blue-500 bg-black terminal-blue hover:bg-blue-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-2 border-green-500 bg-black p-3">
              <div className="vt323 terminal-green text-base text-center">
                TOTAL PRIZE: {totalPrize} SOL
              </div>
              <div className="vt323 terminal-green text-xs text-center mt-1">
                ({friends.length + 1} PLAYERS × {buyIn} SOL)
              </div>
            </div>

          </div>
        </div>

        <div className="border-2 border-yellow-500 bg-black p-4 mb-4">
          <div className="press-start terminal-yellow text-xs mb-3 text-center pb-2 border-b border-yellow-700">
            SELECT SOLANA TOKENS ({selectedCoins.length}/6) - WITH ZERION API
          </div>
          {loading ? (
            <div className="text-center vt323 terminal-yellow text-base py-6">
              LOADING SOLANA TOKENS FROM ZERION...
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {availableTokens.map((token) => (
                <button
                  key={token.id}
                  onClick={() => toggleCoin(token.id)}
                  className={`border-2 p-2 transition-all ${
                    selectedCoins.includes(token.id)
                      ? 'border-yellow-500 bg-yellow-500 bg-opacity-20'
                      : 'border-green-700 hover:bg-green-900'
                  }`}
                >
                  <div className="press-start terminal-yellow text-xs mb-1">{token.symbol}</div>
                  <div className="vt323 terminal-green text-xs">${(token.price || 0).toFixed(2)}</div>
                  <div className={`vt323 text-xs ${(token.change24h || 0) >= 0 ? 'terminal-green' : 'terminal-red'}`}>
                    {(token.change24h || 0) >= 0 ? '▲' : '▼'} {Math.abs(token.change24h || 0).toFixed(1)}%
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleCreate}
            disabled={friends.length === 0 || selectedCoins.length === 0}
            className="border-2 border-green-500 bg-green-500 bg-opacity-20 px-8 py-3 press-start terminal-green text-sm hover:bg-opacity-40 animate-pulse disabled:opacity-30 disabled:animate-none"
          >
            START BATTLE
          </button>
          <button
            onClick={onBack}
            className="border-2 border-red-500 bg-black px-8 py-3 press-start terminal-red text-sm hover:bg-red-900"
          >
            BACK
          </button>
        </div>
      </div>
    </div>
  );
}
