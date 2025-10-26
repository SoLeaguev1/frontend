'use client';

import { useState, ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  currentPage: 'dashboard' | 'leaderboard' | 'portfolio' | 'create';
  onNavigate: (page: 'dashboard' | 'leaderboard' | 'portfolio' | 'create') => void;
  user?: {
    username: string;
    walletAddress: string;
  };
}

export default function Layout({ children, currentPage, onNavigate, user }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Battle', icon: '⚔️' },
    { id: 'leaderboard', label: 'Legends', icon: '🏆' },
    { id: 'portfolio', label: 'Arsenal', icon: '💎' },
    { id: 'create', label: 'Forge', icon: '🔥' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">

      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/80 border-b-2 border-purple-500/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/50">
                  ⚡
                </div>
                <div>
                  <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    CRYPTO ARENA
                  </div>
                  <div className="text-xs text-purple-400 uppercase tracking-wider">
                    Fantasy League
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id as any)}
                    className={`px-6 py-3 rounded-xl font-bold uppercase text-sm transition-all duration-200 flex items-center gap-2 ${
                      currentPage === item.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 scale-105'
                        : 'text-purple-300 hover:text-white hover:bg-purple-900/30'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <div className="text-white font-bold">{user.username}</div>
                  <div className="text-purple-400 text-xs font-mono">
                    {user.walletAddress.slice(0, 12)}...
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-500/50">
                  {user.username[0].toUpperCase()}
                </div>
              </div>
            ) : (
              <button className="hidden md:block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/50 hover:scale-105 uppercase tracking-wide">
                Connect Wallet
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white text-3xl"
            >
              {mobileMenuOpen ? '×' : '☰'}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-2 animate-slideDown">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-6 py-4 rounded-xl font-bold uppercase text-sm transition-all duration-200 flex items-center gap-3 ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-slate-900/50 text-purple-300 hover:bg-purple-900/30'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}

              {user ? (
                <div className="mt-4 p-4 bg-gradient-to-r from-slate-900/50 to-purple-900/30 rounded-xl border border-purple-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-black text-lg">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-bold">{user.username}</div>
                      <div className="text-purple-400 text-xs font-mono">
                        {user.walletAddress.slice(0, 16)}...
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button className="w-full mt-4 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black rounded-xl shadow-lg uppercase tracking-wide">
                  Connect Wallet
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      <main className="relative">
        {children}
      </main>

      <footer className="bg-slate-900/50 border-t-2 border-purple-500/30 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-xl">
                  ⚡
                </div>
                <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  CRYPTO ARENA
                </div>
              </div>
              <p className="text-purple-300 text-sm">
                The ultimate fantasy crypto wallet league. Battle. Compete. Dominate.
              </p>
            </div>

            <div>
              <h3 className="text-white font-black uppercase tracking-wider mb-4">Quick Links</h3>
              <div className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id as any)}
                    className="block text-purple-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-black uppercase tracking-wider mb-4">Resources</h3>
              <div className="space-y-2 text-purple-300 text-sm">
                <div>API Documentation</div>
                <div>Smart Contracts</div>
                <div>Community Discord</div>
                <div>Support</div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-purple-500/20 text-center text-purple-400 text-sm">
            2024 Crypto Arena. Built for warriors by warriors.
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
