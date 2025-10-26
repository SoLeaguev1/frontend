'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Player } from '../types';
import { fetchTokenPrices, fetchWalletSnapshot } from '../lib/api';

interface FriendBattleLiveProps {
  friends: Player[];
  buyIn: number;
  coins: string[];
  timeline: number;
  onBack: () => void;
}

interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
}

interface PlayerScore {
  player: Player;
  portfolioValue: number;
  percentageChange: number;
  rank: number;
}

export default function FriendBattleLive({ friends, buyIn, coins, timeline, onBack }: FriendBattleLiveProps) {
  const wallet = useWallet();
  const [timeRemaining, setTimeRemaining] = useState(timeline * 24 * 60 * 60);
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);
  const [attackingTokens, setAttackingTokens] = useState<Set<string>>(new Set());
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [showAllTokens, setShowAllTokens] = useState(false);

  const userWalletAddress = wallet.publicKey?.toBase58() || '';

  const allPlayers = userWalletAddress
    ? [{ id: 'you', username: 'YOU', walletAddress: userWalletAddress, level: 99 }, ...friends]
    : friends;

  useEffect(() => {
    const loadTokenPrices = async () => {
      if (!coins || coins.length === 0) {
        console.log('No coins selected');
        return;
      }
      console.log('Loading prices for coins:', coins);
      try {
        const prices = await fetchTokenPrices(coins);
        console.log('Received prices:', prices);
        if (prices.length > 0) {
          setTokenPrices(prices);
        } else {
          console.error('No prices received from API');
        }
      } catch (error) {
        console.error('Error loading token prices:', error);
      }
    };
    loadTokenPrices();
  }, [coins]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const prices = await fetchTokenPrices(coins);
      if (prices.length > 0) {
        setTokenPrices(prev => {
          const newAttacking = new Set<string>();
          prices.forEach((newToken: any, idx: number) => {
            if (prev[idx] && newToken.price > prev[idx].price) {
              newAttacking.add(newToken.symbol);
            }
          });

          if (newAttacking.size > 0) {
            setAttackingTokens(newAttacking);
            setTimeout(() => setAttackingTokens(new Set()), 600);
          }

          return prices;
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [coins]);

  useEffect(() => {
    const loadPlayerScores = async () => {
      const validPlayers = allPlayers.filter(p => p.walletAddress && p.walletAddress.length >= 32);

      console.log('Valid players:', validPlayers.map(p => ({
        username: p.username,
        wallet: p.walletAddress
      })));
      console.log('Battle coins (selected tokens):', coins);

      const scores = await Promise.all(
        validPlayers.map(async (player) => {
          const snapshot = await fetchWalletSnapshot(player.walletAddress);
          console.log('Full snapshot for', player.username, {
            totalValue: snapshot?.totalValue,
            percentageChange: snapshot?.percentageChange,
            tokenCount: snapshot?.tokens?.length
          });

          // Calculate value of ONLY the selected tokens for this battle
          let battleTokensValue = 0;
          if (snapshot?.tokens && coins.length > 0) {
            snapshot.tokens.forEach((token: any) => {
              // Check if this token is one of the selected battle tokens
              if (coins.includes(token.address)) {
                battleTokensValue += token.valueUSD || 0;
                console.log(`  ${player.username} has ${token.symbol}: $${token.valueUSD}`);
              }
            });
          }

          console.log(`${player.username} total battle value: $${battleTokensValue}`);

          return {
            player,
            portfolioValue: battleTokensValue, // Value of selected tokens only
            percentageChange: snapshot?.percentageChange || 0,
            rank: 0,
          };
        })
      );

      // Sort by portfolio value (highest $ wins)
      const sorted = scores.sort((a, b) => b.portfolioValue - a.portfolioValue).map((item, idx) => ({
        ...item,
        rank: idx + 1,
      }));

      console.log('Final scores (sorted by $ value):', sorted.map(s => ({
        rank: s.rank,
        username: s.player.username,
        battleValue: s.portfolioValue,
        change: s.percentageChange
      })));

      setPlayerScores(sorted);
    };

    loadPlayerScores();
    const interval = setInterval(loadPlayerScores, 30000);

    return () => clearInterval(interval);
  }, [allPlayers.length, userWalletAddress, coins]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(v => Math.max(0, v - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(timeRemaining / (24 * 60 * 60));
  const hours = Math.floor((timeRemaining % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((timeRemaining % (60 * 60)) / 60);
  const seconds = timeRemaining % 60;

  const totalPrize = allPlayers.length * buyIn;
  const perCoinAmount = buyIn / coins.length;

  return (
    <div className="min-h-screen bg-black crt-screen flex items-center justify-center p-4">
      <div className="scanline" />

      <div className="fixed top-4 right-4 z-50">
        <WalletMultiButton />
      </div>

      <div className="w-full max-w-4xl">

        <div className="text-center mb-3">
          <div className="press-start terminal-yellow text-2xl mb-1">
            LIVE BATTLE
          </div>
          <div className="vt323 terminal-green text-lg">
            {timeline} DAY COMPETITION
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="border-2 border-red-500 bg-black p-2">
            <div className="press-start terminal-red text-xs text-center mb-1">TIME</div>
            <div className="press-start terminal-yellow text-sm text-center">
              {days}D {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
            </div>
          </div>

          <div className="border-2 border-yellow-500 bg-black p-2">
            <div className="press-start terminal-yellow text-xs text-center mb-1">PRIZE</div>
            <div className="press-start terminal-yellow text-sm text-center">
              {totalPrize} SOL
            </div>
          </div>

          <div className="border-2 border-blue-500 bg-black p-2">
            <div className="press-start terminal-blue text-xs text-center mb-1">PLAYERS</div>
            <div className="press-start terminal-blue text-sm text-center">
              {allPlayers.length}
            </div>
          </div>
        </div>

        <div className="border-2 border-green-500 bg-black p-2 mb-3">
          <div className="press-start terminal-green text-xs mb-2 text-center pb-1 border-b border-green-700">
            LIVE PRICES ({tokenPrices.length} TOKENS)
          </div>
          <div className="grid grid-cols-3 gap-1">
            {tokenPrices.slice(0, showAllTokens ? tokenPrices.length : 9).map((token) => {
              const isAttacking = attackingTokens.has(token.symbol);
              return (
                <div
                  key={token.symbol}
                  className={`border border-green-700 p-1 relative ${isAttacking ? 'pokemon-attack' : ''}`}
                >
                  {isAttacking && (
                    <div className="absolute -top-1 -right-1 press-start terminal-yellow text-xs z-10">
                      +
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="press-start terminal-yellow text-xs">{token.symbol}</div>
                    <div className="vt323 terminal-green text-xs">${token.price.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className={`vt323 text-xs ${token.change24h >= 0 ? 'terminal-green' : 'terminal-red'}`}>
                      {token.change24h >= 0 ? '▲' : '▼'} {Math.abs(token.change24h).toFixed(1)}%
                    </div>
                    <div className="vt323 terminal-blue text-xs">
                      {perCoinAmount.toFixed(1)} SOL
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {tokenPrices.length > 9 && (
            <div className="text-center mt-2">
              <button
                onClick={() => setShowAllTokens(!showAllTokens)}
                className="border-2 border-yellow-500 bg-black px-4 py-1 press-start terminal-yellow text-xs hover:bg-yellow-900"
              >
                {showAllTokens ? 'VIEW LESS' : `VIEW MORE (${tokenPrices.length - 9})`}
              </button>
            </div>
          )}
        </div>

        <div className="border-2 border-yellow-500 bg-black p-2 mb-3">
          <div className="press-start terminal-yellow text-xs mb-2 text-center pb-1 border-b border-yellow-700">
            LEADERBOARD
          </div>
          <div className="space-y-1">
            {playerScores.map((score) => (
              <div
                key={score.player.id}
                className={`border-2 p-2 ${
                  score.rank === 1
                    ? 'border-yellow-500 bg-yellow-500 bg-opacity-10'
                    : score.player.id === 'you'
                    ? 'border-green-500'
                    : 'border-blue-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                      score.rank === 1
                        ? 'border-yellow-500 bg-gradient-to-br from-yellow-900 to-yellow-700'
                        : score.player.id === 'you'
                        ? 'border-green-500 bg-gradient-to-br from-green-900 to-green-700'
                        : 'border-blue-500 bg-gradient-to-br from-blue-900 to-blue-700'
                    }`}>
                      <div className="press-start text-lg text-black">{score.player.username[0]}</div>
                    </div>
                    <div className={`press-start text-sm ${
                      score.rank === 1 ? 'terminal-yellow' : 'terminal-green'
                    }`}>
                      #{score.rank}
                    </div>
                    <div>
                      <div className={`press-start text-xs ${
                        score.player.id === 'you' || score.rank === 1 ? 'terminal-yellow' : 'terminal-green'
                      }`}>
                        {score.player.username}
                      </div>
                      <div className="vt323 terminal-green text-xs">
                        {score.player.walletAddress.length > 20
                          ? `${score.player.walletAddress.slice(0, 8)}...${score.player.walletAddress.slice(-4)}`
                          : score.player.walletAddress
                        }
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="vt323 terminal-blue text-xs">
                      BATTLE VALUE
                    </div>
                    <div className={`press-start text-base ${
                      score.rank === 1 ? 'terminal-yellow' : 'terminal-green'
                    }`}>
                      ${score.portfolioValue.toLocaleString()}
                    </div>
                    <div className="vt323 terminal-green text-xs mt-1">
                      Total Wallet: ${score.percentageChange >= 0 ? '▲' : '▼'} {Math.abs(score.percentageChange).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-2 border-red-500 bg-black p-2 mb-3">
          <div className="vt323 terminal-yellow text-xs text-center mb-1">
            BATTLE RULE: HIGHEST $ VALUE OF SELECTED TOKENS WINS
          </div>
          <div className="vt323 terminal-red text-sm text-center">
            {playerScores[0]?.player.username || 'LOADING'} LEADS: ${playerScores[0]?.portfolioValue.toLocaleString() || '0'}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onBack}
            className="border-2 border-red-500 bg-black px-6 py-2 press-start terminal-red text-xs hover:bg-red-900"
          >
            EXIT
          </button>
        </div>
      </div>
    </div>
  );
}
