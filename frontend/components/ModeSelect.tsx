'use client';

import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface ModeSelectProps {
  onSelectMainEvent: () => void;
  onSelectFriendBattle: () => void;
  onSelectBattleManager: () => void;
  onBack: () => void;
}

export default function ModeSelect({ onSelectMainEvent, onSelectFriendBattle, onSelectBattleManager, onBack }: ModeSelectProps) {
  const [selected, setSelected] = useState(0);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        setSelected(Math.max(0, selected - 1));
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        setSelected(Math.min(2, selected + 1));
      } else if (e.key === 'Enter') {
        if (selected === 0) {
          onSelectMainEvent();
        } else if (selected === 1) {
          onSelectFriendBattle();
        } else if (selected === 2) {
          onSelectBattleManager();
        }
      } else if (e.key === 'Escape') {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selected, onSelectMainEvent, onSelectFriendBattle, onSelectBattleManager, onBack]);

  return (
    <div className="min-h-screen bg-black crt-screen flex items-center justify-center p-2 sm:p-4">
      <div className="scanline" />

      <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50">
        <WalletMultiButton />
      </div>

      <div className="w-full max-w-2xl">

        <div className="text-center mb-4 sm:mb-6">
          <div className="press-start terminal-yellow text-xl sm:text-3xl mb-2 sm:mb-4">
            SELECT MODE
          </div>
        </div>

        <div className="space-y-2 sm:space-y-4 mb-4 sm:mb-6">
          <div
            onClick={() => setSelected(0)}
            className={`cursor-pointer border-2 bg-black p-3 sm:p-6 transition-all ${
              selected === 0
                ? 'border-yellow-500 bg-yellow-500 bg-opacity-10 scale-105'
                : 'border-green-500'
            }`}
          >
            <div className="text-center">
              <div className={`press-start text-sm sm:text-xl mb-1 sm:mb-2 ${selected === 0 ? 'terminal-yellow' : 'terminal-green'}`}>
                MAIN EVENT
              </div>
              <div className={`vt323 text-xs sm:text-lg ${selected === 0 ? 'terminal-yellow' : 'terminal-green'}`}>
                7 DAY TOURNAMENT - 50 SOL PRIZE
              </div>
            </div>
          </div>

          <div
            onClick={() => setSelected(1)}
            className={`cursor-pointer border-2 bg-black p-3 sm:p-6 transition-all ${
              selected === 1
                ? 'border-yellow-500 bg-yellow-500 bg-opacity-10 scale-105'
                : 'border-blue-500'
            }`}
          >
            <div className="text-center">
              <div className={`press-start text-sm sm:text-xl mb-1 sm:mb-2 ${selected === 1 ? 'terminal-yellow' : 'terminal-blue'}`}>
                FRIEND BATTLE
              </div>
              <div className={`vt323 text-xs sm:text-lg ${selected === 1 ? 'terminal-yellow' : 'terminal-blue'}`}>
                CHALLENGE FRIENDS - STAKE SOL
              </div>
            </div>
          </div>

          <div
            onClick={() => setSelected(2)}
            className={`cursor-pointer border-2 bg-black p-3 sm:p-6 transition-all ${
              selected === 2
                ? 'border-yellow-500 bg-yellow-500 bg-opacity-10 scale-105'
                : 'border-red-500'
            }`}
          >
            <div className="text-center">
              <div className={`press-start text-sm sm:text-xl mb-1 sm:mb-2 ${selected === 2 ? 'terminal-yellow' : 'terminal-red'}`}>
                BATTLE MANAGER
              </div>
              <div className={`vt323 text-xs sm:text-lg ${selected === 2 ? 'terminal-yellow' : 'terminal-red'}`}>
                CREATE OR JOIN ON-CHAIN BATTLES
              </div>
            </div>
          </div>
        </div>

        <div className="border-2 border-green-500 bg-black p-2 sm:p-3 mb-2 sm:mb-4">
          <div className="vt323 terminal-green text-xs sm:text-base text-center">
            ↑ ↓ SELECT | ENTER CONFIRM | ESC BACK
          </div>
        </div>

        {showRules && (
          <div className="border-2 border-blue-500 bg-black p-3 mb-4">
            <div className="press-start terminal-blue text-xs mb-2 text-center">GAME RULES</div>
            <div className="vt323 terminal-green text-sm space-y-1">
              <div className="terminal-yellow">MAIN EVENT:</div>
              <div>• 2 PLAYERS COMPETE FOR 7 DAYS</div>
              <div>• PLACE BETS ON YOUR CHOSEN WINNER</div>
              <div>• WINNING BET PAYS 2X YOUR STAKE</div>
              <div>• 50 SOL TOTAL PRIZE POOL</div>
              <div className="terminal-yellow mt-2">FRIEND BATTLE:</div>
              <div>• INVITE UP TO 5 FRIENDS (6 TOTAL)</div>
              <div>• SET TIMELINE: 1, 3, OR 7 DAYS</div>
              <div>• EACH PLAYER STAKES SOL BUY-IN</div>
              <div>• CHOOSE 1-6 TOKENS TO TRACK</div>
              <div>• HIGHEST % GAIN WINS THE POOL</div>
              <div className="terminal-yellow mt-2">BATTLE MANAGER:</div>
              <div>• CREATE ON-CHAIN BATTLES</div>
              <div>• JOIN EXISTING BATTLES</div>
              <div>• SET CUSTOM BUY-INS & DURATION</div>
              <div>• ALL TRANSACTIONS ON SOLANA</div>
              <div className="terminal-yellow mt-2">TRACKING:</div>
              <div>• LIVE WALLET PORTFOLIO TRACKING</div>
              <div>• REAL-TIME TOKEN PRICES</div>
              <div>• WITH ZERION API & SOLANA</div>
            </div>
          </div>
        )}

        <div className="flex gap-2 sm:gap-3 justify-center">
          <button
            onClick={() => setShowRules(!showRules)}
            className="border-2 border-blue-500 bg-black px-3 py-2 sm:px-6 sm:py-3 press-start terminal-blue text-[8px] sm:text-xs hover:bg-blue-900"
          >
            {showRules ? 'HIDE RULES' : 'SHOW RULES'}
          </button>
          <button
            onClick={onBack}
            className="border-2 border-red-500 bg-black px-3 py-2 sm:px-6 sm:py-3 press-start terminal-red text-[8px] sm:text-xs hover:bg-red-900"
          >
            BACK
          </button>
        </div>
      </div>
    </div>
  );
}
