'use client';

import { useState, useEffect } from 'react';

interface GameOverProps {
  onContinue: () => void;
  onExit: () => void;
}

export default function GameOver({ onContinue, onExit }: GameOverProps) {
  const [countdown, setCountdown] = useState(9);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(v => {
        if (v <= 1) {
          onExit();
          return 0;
        }
        return v - 1;
      });
    }, 1000);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        clearInterval(interval);
        onContinue();
      }
    };

    window.addEventListener('keydown', handleKey);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKey);
    };
  }, [onContinue, onExit]);

  return (
    <div className="min-h-screen bg-black crt-screen flex flex-col items-center justify-center">
      <div className="scanline" />

      <div className="text-center space-y-8">
        <div className="press-start terminal-red text-6xl animate-pulse leading-tight" style={{ textShadow: '6px 6px 0 #330000' }}>
          GAME
          <br />
          OVER
        </div>

        <div className="border-4 border-yellow-500 bg-black p-8 inline-block">
          <div className="press-start terminal-yellow text-5xl">
            {countdown}
          </div>
        </div>

        <div className="space-y-4">
          <div className="press-start terminal-green text-2xl">
            CONTINUE?
          </div>

          <div className="vt323 terminal-green text-xl">
            PRESS START
          </div>
        </div>
      </div>
    </div>
  );
}
