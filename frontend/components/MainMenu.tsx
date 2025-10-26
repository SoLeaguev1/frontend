'use client';

import { useState, useEffect } from 'react';

interface MainMenuProps {
  onSelect: (screen: string) => void;
}

export default function MainMenu({ onSelect }: MainMenuProps) {
  const [selected, setSelected] = useState(0);
  const [blinkVisible, setBlinkVisible] = useState(true);

  const menuItems = [
    { id: 'rules', label: 'BATTLE RULES', desc: 'LEARN HOW TO WIN' },
    { id: 'battle', label: 'START BATTLE', desc: 'ENTER THE ARENA' },
    { id: 'leaderboard', label: 'RANKINGS', desc: 'VIEW TOP WARRIORS' },
    { id: 'options', label: 'OPTIONS', desc: 'SYSTEM CONFIG' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkVisible(v => !v);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        setSelected((prev) => (prev > 0 ? prev - 1 : menuItems.length - 1));
      } else if (e.key === 'ArrowDown') {
        setSelected((prev) => (prev < menuItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Enter') {
        onSelect(menuItems[selected].id);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selected, menuItems, onSelect]);

  return (
    <div className="min-h-screen bg-black crt-screen flex flex-col items-center justify-center">
      <div className="scanline" />

      <div className="w-full max-w-4xl px-8">

        <div className="text-center mb-16">
          <div className="mb-8">
            <div className="terminal-green press-start text-7xl mb-6 tracking-wider">
              CRYPTO
            </div>
            <div className="terminal-blue press-start text-5xl mb-4 tracking-wider">
              BATTLE
            </div>
            <div className="terminal-yellow press-start text-3xl tracking-wider">
              SYSTEM
            </div>
          </div>

          <div className="terminal-green vt323 text-2xl mt-8">
            v1.0 - 1995
          </div>

          {blinkVisible && (
            <div className="terminal-yellow vt323 text-xl mt-4">
              ▼ INSERT COIN ▼
            </div>
          )}
        </div>

        <div className="border-4 border-green-500 bg-black retro-shadow max-w-2xl mx-auto">
          <div className="border-2 border-green-700 m-2">

            <div className="text-center py-4 border-b-2 border-green-700">
              <div className="terminal-yellow press-start text-sm">
                MAIN MENU
              </div>
            </div>

            <div className="p-6 space-y-1">
              {menuItems.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelected(idx);
                    setTimeout(() => onSelect(item.id), 150);
                  }}
                  className={`cursor-pointer border-2 transition-all ${
                    selected === idx
                      ? 'border-yellow-500 bg-yellow-500 bg-opacity-10'
                      : 'border-green-900 hover:border-green-700'
                  }`}
                >
                  <div className="flex items-center p-4">
                    <div className={`w-12 text-2xl ${selected === idx ? 'terminal-yellow' : 'terminal-green'}`}>
                      {selected === idx && blinkVisible ? '►' : ' '}
                    </div>
                    <div className="flex-1">
                      <div className={`press-start text-base mb-2 ${selected === idx ? 'terminal-yellow' : 'terminal-green'}`}>
                        {item.label}
                      </div>
                      <div className={`vt323 text-lg ${selected === idx ? 'terminal-yellow opacity-90' : 'terminal-green opacity-60'}`}>
                        {item.desc}
                      </div>
                    </div>
                    {selected === idx && (
                      <div className="terminal-yellow vt323 text-sm">
                        [ENTER]
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center py-4 border-t-2 border-green-700">
              <div className="terminal-green vt323 text-lg">
                USE ↑↓ KEYS TO SELECT
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center terminal-green vt323 text-lg space-y-2 opacity-70">
          <div>WALLET: CONNECTED</div>
          <div>NETWORK: ONLINE</div>
          <div>STATUS: READY</div>
        </div>
      </div>

      <div className="fixed bottom-8 left-8 border-4 border-green-500 bg-black p-4">
        <div className="terminal-green vt323 text-lg space-y-1">
          <div>↑ ↓  MOVE</div>
          <div>⏎    SELECT</div>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 terminal-green vt323 text-sm opacity-50">
        (C) 1995 BLOCKCHAIN CORP
      </div>
    </div>
  );
}
