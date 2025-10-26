'use client';

import { useState, useEffect } from 'react';

interface AttractModeProps {
  onStart: () => void;
}

export default function AttractMode({ onStart }: AttractModeProps) {

  return (
    <div className="min-h-screen bg-black crt-screen flex items-center justify-center p-4" onClick={onStart}>
      <div className="scanline" />

      <div className="w-full max-w-4xl">

        <div className="text-center mb-12">
          <div className="press-start terminal-yellow text-7xl mb-4 tracking-widest" style={{ textShadow: '6px 6px 0 #663300' }}>
            SOLANA
          </div>
          <div className="press-start terminal-green text-5xl mb-3 tracking-widest" style={{ textShadow: '4px 4px 0 #003300' }}>
            WALLET
          </div>
          <div className="press-start terminal-red text-5xl tracking-widest" style={{ textShadow: '4px 4px 0 #330000' }}>
            KOMBAT
          </div>
        </div>

        <div className="text-center mb-10">
          <div className="press-start terminal-yellow text-3xl animate-pulse">
            &gt;&gt; INSERT COIN &lt;&lt;
          </div>
        </div>

        <div className="border-4 border-yellow-500 bg-black p-6 mb-8">
          <div className="vt323 terminal-green text-xl space-y-3">
            <div className="flex gap-3">
              <div className="terminal-yellow">1.</div>
              <div>CONNECT SOLANA WALLET</div>
            </div>
            <div className="flex gap-3">
              <div className="terminal-yellow">2.</div>
              <div>ZERION TRACKS PORTFOLIO</div>
            </div>
            <div className="flex gap-3">
              <div className="terminal-yellow">3.</div>
              <div>BATTLE 7 DAYS - MAIN EVENT</div>
            </div>
            <div className="flex gap-3">
              <div className="terminal-yellow">4.</div>
              <div>CHALLENGE FRIENDS FOR SOL</div>
            </div>
            <div className="flex gap-3">
              <div className="terminal-yellow">5.</div>
              <div>WIN 50 SOL PRIZE</div>
            </div>
          </div>
        </div>

        <div className="text-center vt323 terminal-blue text-lg mb-6">
          DEVELOPED WITH ZERION API
        </div>

        <div className="text-center vt323 terminal-green text-sm opacity-50">
          (C) 1995 SOLANA GAMES
        </div>
      </div>
    </div>
  );
}
