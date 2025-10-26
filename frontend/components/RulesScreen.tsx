'use client';

import { useState } from 'react';

interface RulesScreenProps {
  onBack: () => void;
  onStart: () => void;
}

export default function RulesScreen({ onBack, onStart }: RulesScreenProps) {
  const [page, setPage] = useState(0);

  const pages = [
    {
      title: 'OBJECTIVE',
      content: [
        'COMPETE AGAINST OPPONENTS',
        'IN A WALLET GROWTH BATTLE',
        '',
        'YOUR CRYPTO PORTFOLIO VALUE',
        'IS YOUR HEALTH BAR',
        '',
        'WHOEVER GROWS THEIR WALLET',
        'THE MOST WINS THE BATTLE',
      ],
    },
    {
      title: 'HOW TO WIN',
      content: [
        'INCREASE YOUR PORTFOLIO VALUE',
        'BY HOLDING WINNING TOKENS',
        '',
        'WINNING CONDITION:',
        '> HIGHEST % GROWTH',
        '',
        'EXAMPLE:',
        '$10,000 → $15,000 = +50%',
        '$50,000 → $60,000 = +20%',
        '',
        'PLAYER 1 WINS!',
      ],
    },
    {
      title: 'BATTLE MECHANICS',
      content: [
        'BATTLES LAST 7 DAYS',
        '',
        'YOUR WALLET IS TRACKED:',
        '> EVERY 24 HOURS',
        '> REAL-TIME UPDATES',
        '',
        'PORTFOLIO VALUE =',
        'ALL YOUR CRYPTO ASSETS',
        'MEASURED IN USD',
      ],
    },
    {
      title: 'PRIZE POOL',
      content: [
        'WINNER TAKES ALL',
        '',
        'ENTRY FEE: 5 ETH',
        'PRIZE POOL: 10 ETH',
        '',
        '1ST PLACE: 10 ETH',
        '2ND PLACE: NOTHING',
        '',
        'NO MERCY IN THE ARENA',
      ],
    },
  ];

  const currentPage = pages[page];

  return (
    <div className="min-h-screen bg-black crt-screen flex items-center justify-center">
      <div className="scanline" />

      <div className="w-full max-w-4xl px-8">

        <div className="text-center mb-12">
          <div className="terminal-yellow press-start text-3xl mb-4">
            BATTLE RULES
          </div>
          <div className="terminal-green vt323 text-xl">
            PAGE {page + 1} / {pages.length}
          </div>
        </div>

        <div className="border-4 border-green-500 bg-black p-12 retro-shadow mx-auto max-w-3xl">
          <div className="border-2 border-green-700 p-8">

            <div className="text-center mb-8">
              <div className="terminal-yellow press-start text-xl mb-6">
                {currentPage.title}
              </div>
              <div className="w-full h-1 bg-green-500 mb-6" />
            </div>

            <div className="space-y-3 terminal-green vt323 text-2xl min-h-[400px] flex flex-col justify-center">
              {currentPage.content.map((line, idx) => (
                <div key={idx} className="text-center whitespace-pre">
                  {line || '\u00A0'}
                </div>
              ))}
            </div>

            <div className="w-full h-1 bg-green-500 mt-8" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 mt-8">
          {page > 0 && (
            <button
              onClick={() => setPage(page - 1)}
              className="border-4 border-blue-500 bg-black px-8 py-4 terminal-blue press-start text-sm hover:bg-blue-500 hover:bg-opacity-20 transition-all retro-shadow"
            >
              ← PREV
            </button>
          )}

          {page < pages.length - 1 && (
            <button
              onClick={() => setPage(page + 1)}
              className="border-4 border-blue-500 bg-black px-8 py-4 terminal-blue press-start text-sm hover:bg-blue-500 hover:bg-opacity-20 transition-all retro-shadow"
            >
              NEXT →
            </button>
          )}

          {page === pages.length - 1 && (
            <button
              onClick={onStart}
              className="border-4 border-yellow-500 bg-black px-8 py-4 terminal-yellow press-start text-sm hover:bg-yellow-500 hover:bg-opacity-20 transition-all retro-shadow blink"
            >
              START BATTLE
            </button>
          )}

          <button
            onClick={onBack}
            className="border-4 border-red-500 bg-black px-8 py-4 terminal-red press-start text-sm hover:bg-red-500 hover:bg-opacity-20 transition-all retro-shadow"
          >
            BACK
          </button>
        </div>

        <div className="text-center mt-8 terminal-green vt323 text-lg opacity-70">
          STUDY THE RULES TO MASTER THE ARENA
        </div>
      </div>
    </div>
  );
}
