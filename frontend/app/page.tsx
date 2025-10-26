'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import AttractMode from '../components/AttractMode';
import ModeSelect from '../components/ModeSelect';
import CharacterSelect from '../components/CharacterSelect';
import CreateFriendBattle from '../components/CreateFriendBattle';
import FriendBattleLive from '../components/FriendBattleLive';
import FightScreen from '../components/FightScreen';
import GameOver from '../components/GameOver';
import BettingModal from '../components/BettingModal';
import BattleManager from '../components/BattleManager';
import { League, Player, WalletSnapshot } from '../types';
import { getWalletSnapshot } from '../lib/api';
import { createBattle } from '../lib/solana';

// Real mainnet Solana whales with real token portfolios
const FEATURED_WALLETS = [
  {
    username: 'COBIE',
    walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', // $5.6B portfolio, 2231 tokens
  },
  {
    username: 'CRYPTOKALEO',
    walletAddress: 'GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ', // $33M portfolio, 120 tokens
  },
];

export default function Home() {
  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  const [gameState, setGameState] = useState<'attract' | 'wallet' | 'modeSelect' | 'battleManager' | 'battleCreated' | 'select' | 'createFriend' | 'friendLive' | 'bet' | 'fight' | 'gameover'>('attract');
  const [battleMode, setBattleMode] = useState<'main' | 'friend'>('main');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [friendBattleData, setFriendBattleData] = useState<{
    friends: Player[];
    buyIn: number;
    coins: string[];
    timeline: number;
  } | null>(null);
  const [currentBet, setCurrentBet] = useState<{ playerId: string; amount: number } | null>(null);
  const [walletSnapshots, setWalletSnapshots] = useState<WalletSnapshot[]>([]);
  const [createdBattlePDA, setCreatedBattlePDA] = useState<string | null>(null);

  useEffect(() => {
    if (connected && publicKey) {
      const player: Player = {
        id: publicKey.toBase58(),
        username: publicKey.toBase58().slice(0, 8).toUpperCase(),
        walletAddress: publicKey.toBase58(),
        level: 1,
      };
      setCurrentPlayer(player);

      if (gameState === 'wallet') {
        setGameState('modeSelect');
      }
    } else {
      setCurrentPlayer(null);
    }
  }, [connected, publicKey]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState === 'attract' && (e.key === 'Enter' || e.key === ' ')) {
        if (connected) {
          setGameState('modeSelect');
        } else {
          setGameState('wallet');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, connected]);

  useEffect(() => {
    if (!currentPlayer || !league) return;

    const loadWalletSnapshots = async () => {
      const snapshots = await Promise.all(
        league.players.map(async (player) => {
          const snapshot = await getWalletSnapshot(player.walletAddress);
          if (snapshot) {
            return {
              playerId: player.id,
              timestamp: new Date(snapshot.timestamp),
              totalValue: snapshot.totalValue,
              tokens: snapshot.tokens,
              percentageChange: snapshot.percentageChange,
              rank: snapshot.rank,
            };
          }
          return {
            playerId: player.id,
            timestamp: new Date(),
            totalValue: 0,
            tokens: [],
            percentageChange: 0,
            rank: 0,
          };
        })
      );
      setWalletSnapshots(snapshots);
    };

    if (gameState === 'fight') {
      loadWalletSnapshots();
      const interval = setInterval(loadWalletSnapshots, 30000);
      return () => clearInterval(interval);
    }
  }, [gameState, currentPlayer, league]);

  useEffect(() => {
    if (gameState === 'select' && league && league.maxPlayers === 2) {
      const opponent = league.players.find(p => p.id !== currentPlayer?.id);
      if (opponent) {
        setSelectedPlayer(opponent);
        setGameState('bet');
      }
    }
  }, [gameState, league, currentPlayer]);

  if (gameState === 'attract') {
    return <AttractMode onStart={() => {
      if (connected) {
        setGameState('modeSelect');
      } else {
        setGameState('wallet');
      }
    }} />;
  }

  if (gameState === 'wallet') {
    return (
      <div className="min-h-screen bg-black crt-screen flex items-center justify-center p-4">
        <div className="scanline" />
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <div className="press-start terminal-yellow text-4xl mb-6">
              CONNECT WALLET
            </div>
            <div className="vt323 terminal-green text-xl mb-8">
              CONNECT YOUR SOLANA WALLET TO START
            </div>
          </div>

          <div className="border-4 border-yellow-500 bg-black p-8 mb-8">
            <div className="flex justify-center mb-6">
              <WalletMultiButton className="!bg-yellow-500 !bg-opacity-20 border-2 !border-yellow-500" />
            </div>

            <div className="vt323 terminal-green text-base space-y-3">
              <div className="flex gap-3">
                <div className="terminal-yellow">1.</div>
                <div>CLICK CONNECT WALLET</div>
              </div>
              <div className="flex gap-3">
                <div className="terminal-yellow">2.</div>
                <div>SELECT YOUR WALLET</div>
              </div>
              <div className="flex gap-3 ml-6 terminal-blue text-sm">
                <div>• PHANTOM • SOLFLARE • COINBASE</div>
              </div>
              <div className="flex gap-3 ml-6 terminal-blue text-sm">
                <div>• TRUST WALLET</div>
              </div>
              <div className="flex gap-3 ml-6 terminal-green text-sm">
                <div>• ZERION (VIA WALLETCONNECT)</div>
              </div>
              <div className="flex gap-3">
                <div className="terminal-yellow">3.</div>
                <div>APPROVE CONNECTION</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setGameState('attract')}
              className="border-2 border-red-500 bg-black px-6 py-3 press-start terminal-red text-sm hover:bg-red-900"
            >
              BACK
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!connected || !currentPlayer) {
    return (
      <div className="min-h-screen bg-black crt-screen flex items-center justify-center p-4">
        <div className="scanline" />
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <div className="press-start terminal-red text-3xl mb-4 animate-pulse">
              WALLET NOT CONNECTED
            </div>
            <div className="vt323 terminal-yellow text-xl mb-6">
              PLEASE CONNECT YOUR WALLET
            </div>
            <div className="flex justify-center mb-4">
              <WalletMultiButton />
            </div>
            <button
              onClick={() => setGameState('attract')}
              className="border-2 border-green-500 bg-black px-6 py-3 press-start terminal-green text-sm hover:bg-green-900"
            >
              BACK TO START
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'modeSelect') {
    return (
      <ModeSelect
        onSelectMainEvent={async () => {
          setBattleMode('main');

          try {
            const [snapshot1, snapshot2] = await Promise.all([
              getWalletSnapshot(FEATURED_WALLETS[0].walletAddress),
              getWalletSnapshot(FEATURED_WALLETS[1].walletAddress),
            ]);

            const player1: Player = {
              id: FEATURED_WALLETS[0].walletAddress,
              username: FEATURED_WALLETS[0].username,
              walletAddress: FEATURED_WALLETS[0].walletAddress,
              level: Math.floor((snapshot1?.totalValue || 0) / 1000),
            };

            const player2: Player = {
              id: FEATURED_WALLETS[1].walletAddress,
              username: FEATURED_WALLETS[1].username,
              walletAddress: FEATURED_WALLETS[1].walletAddress,
              level: Math.floor((snapshot2?.totalValue || 0) / 1000),
            };

            const newLeague: League = {
              id: 'main-event-demo',
              name: 'MAIN_EVENT_BATTLE',
              description: '1V1 WALLET BATTLE',
              createdAt: new Date(),
              startDate: new Date(),
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              creatorId: currentPlayer.id,
              players: [player1, player2],
              status: 'active',
              maxPlayers: 2,
              prizePool: 50,
              rules: {
                trackingInterval: 'daily',
                scoringMethod: 'percentage_growth',
              },
            };
            setLeague(newLeague);
            setSelectedPlayer(player2);
            setGameState('bet');
          } catch (error) {
            console.error('Failed to load Main Event wallets:', error);
            alert('FAILED TO LOAD WALLET DATA');
          }
        }}
        onSelectFriendBattle={() => {
          setBattleMode('friend');
          setGameState('createFriend');
        }}
        onSelectBattleManager={() => {
          setGameState('battleManager');
        }}
        onBack={() => setGameState('attract')}
      />
    );
  }

  if (gameState === 'select' && league) {
    if (league.maxPlayers === 2) {
      return (
        <div className="min-h-screen bg-black crt-screen flex items-center justify-center">
          <div className="scanline" />
          <div className="press-start terminal-yellow text-2xl">LOADING...</div>
        </div>
      );
    }
    return (
      <CharacterSelect
        players={league.players.filter(p => p.id !== currentPlayer.id)}
        onSelect={(player) => {
          setSelectedPlayer(player);
          setGameState('bet');
        }}
        onBack={() => setGameState('modeSelect')}
      />
    );
  }

  if (gameState === 'createFriend') {
    return (
      <CreateFriendBattle
        onCreateBattle={(friends, buyIn, coins, timeline) => {
          const allPlayers = [currentPlayer, ...friends];
          const newLeague: League = {
            id: `league-${Date.now()}`,
            name: 'FRIEND_BATTLE',
            description: 'CUSTOM BATTLE',
            createdAt: new Date(),
            startDate: new Date(),
            endDate: new Date(Date.now() + timeline * 24 * 60 * 60 * 1000),
            creatorId: currentPlayer.id,
            players: allPlayers,
            status: 'active',
            maxPlayers: allPlayers.length,
            prizePool: buyIn * allPlayers.length,
            rules: {
              trackingInterval: 'daily',
              scoringMethod: 'percentage_growth',
            },
          };
          setLeague(newLeague);
          setFriendBattleData({ friends, buyIn, coins, timeline });
          setGameState('friendLive');
        }}
        onBack={() => setGameState('modeSelect')}
      />
    );
  }

  if (gameState === 'friendLive' && friendBattleData && league) {
    return (
      <FriendBattleLive
        friends={league.players.filter(p => p.id !== currentPlayer.id)}
        buyIn={friendBattleData.buyIn}
        coins={friendBattleData.coins}
        timeline={friendBattleData.timeline}
        onBack={() => setGameState('createFriend')}
      />
    );
  }

  if (gameState === 'bet' && league) {
    return (
      <BettingModal
        players={league.players}
        battlePDA={league.id}
        onViewLive={() => setGameState('fight')}
        onConfirm={(playerId, amount) => {
          setCurrentBet({ playerId, amount });
        }}
        onBack={() => setGameState('modeSelect')}
      />
    );
  }

  if (gameState === 'fight' && selectedPlayer && league) {
    return (
      <FightScreen
        league={league}
        snapshots={walletSnapshots}
        selectedPlayer={selectedPlayer}
        betAmount={currentBet?.amount}
        bettedPlayerId={currentBet?.playerId}
        onGameOver={(winner) => setGameState('gameover')}
        onChooseWinner={() => setGameState('bet')}
        onBack={() => setGameState('select')}
      />
    );
  }

  if (gameState === 'battleManager') {
    return (
      <BattleManager
        onBack={() => setGameState('modeSelect')}
        onBattleCreated={(battlePDA) => {
          setCreatedBattlePDA(battlePDA);
          setGameState('battleCreated');
        }}
        onBattleJoined={(battleAddress) => {
          setCreatedBattlePDA(battleAddress);
          setGameState('battleCreated');
        }}
      />
    );
  }

  if (gameState === 'battleCreated' && createdBattlePDA) {
    return (
      <div className="min-h-screen bg-black crt-screen flex items-center justify-center p-4">
        <div className="scanline" />
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="press-start terminal-green text-4xl mb-6 animate-pulse">
              BATTLE CREATED!
            </div>
            <div className="vt323 terminal-yellow text-xl mb-8">
              YOUR BATTLE IS READY
            </div>
          </div>

          <div className="border-4 border-green-500 bg-black p-8 mb-8">
            <div className="press-start terminal-yellow text-sm mb-4 text-center">
              BATTLE ADDRESS (PDA)
            </div>
            <div className="border-2 border-yellow-500 bg-black p-4 mb-6">
              <div className="vt323 terminal-green text-sm break-all text-center">
                {createdBattlePDA}
              </div>
            </div>

            <div className="vt323 terminal-blue text-base space-y-2 mb-6">
              <div className="flex gap-3">
                <div className="terminal-yellow">1.</div>
                <div>SHARE THIS ADDRESS WITH YOUR FRIEND</div>
              </div>
              <div className="flex gap-3">
                <div className="terminal-yellow">2.</div>
                <div>THEY WILL USE IT TO JOIN YOUR BATTLE</div>
              </div>
              <div className="flex gap-3">
                <div className="terminal-yellow">3.</div>
                <div>BATTLE STARTS WHEN BOTH PLAYERS JOIN</div>
              </div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(createdBattlePDA);
                alert('Battle address copied to clipboard!');
              }}
              className="w-full border-2 border-yellow-500 bg-yellow-500 bg-opacity-20 px-6 py-3 press-start terminal-yellow text-sm hover:bg-opacity-40 mb-3"
            >
              COPY ADDRESS
            </button>
          </div>

          <div className="text-center space-y-3">
            <button
              onClick={() => setGameState('battleManager')}
              className="border-2 border-blue-500 bg-black px-6 py-3 press-start terminal-blue text-sm hover:bg-blue-900 mr-3"
            >
              CREATE ANOTHER
            </button>
            <button
              onClick={() => setGameState('modeSelect')}
              className="border-2 border-green-500 bg-black px-6 py-3 press-start terminal-green text-sm hover:bg-green-900"
            >
              BACK TO MENU
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return <GameOver onContinue={() => setGameState('modeSelect')} onExit={() => setGameState('attract')} />;
  }

  return (
    <div className="min-h-screen bg-black crt-screen flex items-center justify-center p-4">
      <div className="scanline" />
      <div className="fixed top-4 right-4 z-50">
        <WalletMultiButton />
      </div>
      <div className="w-full max-w-3xl text-center">
        <div className="press-start terminal-yellow text-2xl mb-4">
          LOADING...
        </div>
      </div>
    </div>
  );
}
