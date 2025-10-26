'use client';

import { useState } from 'react';
import { League, LeagueRules, Player } from '../types';

interface LeagueCreationFormProps {
  onSubmit: (league: Partial<League>) => void;
  currentUser: Player;
}

export default function LeagueCreationForm({ onSubmit, currentUser }: LeagueCreationFormProps) {
  const [step, setStep] = useState(1);
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    maxPlayers: 4,
    entryFee: 0,
    trackingInterval: 'daily' as 'hourly' | 'daily' | 'weekly',
    scoringMethod: 'percentage_growth' as const,
    duration: 7,
  });

  const [isCreating, setIsCreating] = useState(false);
  const [playerAddresses, setPlayerAddresses] = useState<string[]>(['']);

  const handleCreate = async () => {
    setIsCreating(true);

    const league: Partial<League> = {
      name: formState.name,
      description: formState.description,
      creatorId: currentUser.id,
      maxPlayers: formState.maxPlayers,
      entryFee: formState.entryFee,
      prizePool: formState.entryFee * formState.maxPlayers,
      startDate: new Date(),
      endDate: new Date(Date.now() + formState.duration * 24 * 60 * 60 * 1000),
      status: 'pending',
      rules: {
        trackingInterval: formState.trackingInterval,
        scoringMethod: formState.scoringMethod,
      },
    };

    setTimeout(() => {
      onSubmit(league);
      setIsCreating(false);
    }, 1500);
  };

  const addPlayerField = () => {
    if (playerAddresses.length < formState.maxPlayers - 1) {
      setPlayerAddresses([...playerAddresses, '']);
    }
  };

  const updatePlayerAddress = (index: number, value: string) => {
    const updated = [...playerAddresses];
    updated[index] = value;
    setPlayerAddresses(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">

        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 mb-2 tracking-tight">
            FORGE LEAGUE
          </h1>
          <p className="text-purple-300 text-lg">Create your fantasy crypto battle arena</p>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/30 border-2 border-purple-500/30 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-purple-500/20">

          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                  step >= s
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-110 shadow-lg shadow-purple-500/50'
                    : 'bg-slate-800 text-slate-600'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`h-1 flex-1 mx-2 transition-all duration-300 ${
                    step > s ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-slate-800'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-purple-300 font-bold mb-2 uppercase text-sm tracking-wider">
                  League Name
                </label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="The Crypto Colosseum"
                  className="w-full bg-slate-900/50 border-2 border-purple-500/30 rounded-xl px-6 py-4 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 text-lg font-medium"
                />
              </div>

              <div>
                <label className="block text-purple-300 font-bold mb-2 uppercase text-sm tracking-wider">
                  Battle Description
                </label>
                <textarea
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Warriors compete for crypto supremacy. May the best portfolio win."
                  rows={4}
                  className="w-full bg-slate-900/50 border-2 border-purple-500/30 rounded-xl px-6 py-4 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-purple-300 font-bold mb-2 uppercase text-sm tracking-wider">
                    Warriors
                  </label>
                  <select
                    value={formState.maxPlayers}
                    onChange={(e) => setFormState({ ...formState, maxPlayers: Number(e.target.value) })}
                    className="w-full bg-slate-900/50 border-2 border-purple-500/30 rounded-xl px-6 py-4 text-white focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 text-lg font-bold"
                  >
                    <option value={2}>2 Players</option>
                    <option value={4}>4 Players</option>
                    <option value={8}>8 Players</option>
                    <option value={16}>16 Players</option>
                  </select>
                </div>

                <div>
                  <label className="block text-purple-300 font-bold mb-2 uppercase text-sm tracking-wider">
                    Battle Duration
                  </label>
                  <select
                    value={formState.duration}
                    onChange={(e) => setFormState({ ...formState, duration: Number(e.target.value) })}
                    className="w-full bg-slate-900/50 border-2 border-purple-500/30 rounded-xl px-6 py-4 text-white focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 text-lg font-bold"
                  >
                    <option value={1}>1 Day</option>
                    <option value={3}>3 Days</option>
                    <option value={7}>7 Days</option>
                    <option value={14}>14 Days</option>
                    <option value={30}>30 Days</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formState.name}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-800 text-white font-black text-xl py-5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/50 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed uppercase tracking-wide"
              >
                Continue to Rules
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-purple-300 font-bold mb-2 uppercase text-sm tracking-wider">
                  Tracking Frequency
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {(['hourly', 'daily', 'weekly'] as const).map((interval) => (
                    <button
                      key={interval}
                      onClick={() => setFormState({ ...formState, trackingInterval: interval })}
                      className={`py-4 px-6 rounded-xl font-bold uppercase text-sm transition-all duration-200 ${
                        formState.trackingInterval === interval
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white scale-105 shadow-lg shadow-purple-500/50'
                          : 'bg-slate-900/50 border-2 border-purple-500/30 text-purple-300 hover:border-purple-500/60'
                      }`}
                    >
                      {interval}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-purple-300 font-bold mb-2 uppercase text-sm tracking-wider">
                  Victory Metric
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'percentage_growth', label: 'Growth Percentage', desc: 'Highest % increase wins' },
                    { value: 'absolute_value', label: 'Total Value', desc: 'Richest wallet wins' },
                    { value: 'risk_adjusted', label: 'Risk-Adjusted', desc: 'Best returns vs volatility' },
                  ].map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setFormState({ ...formState, scoringMethod: method.value as any })}
                      className={`w-full text-left py-4 px-6 rounded-xl transition-all duration-200 ${
                        formState.scoringMethod === method.value
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 scale-105'
                          : 'bg-slate-900/50 border-2 border-purple-500/30 hover:border-purple-500/60'
                      }`}
                    >
                      <div className="font-bold text-lg">{method.label}</div>
                      <div className={`text-sm ${formState.scoringMethod === method.value ? 'text-purple-200' : 'text-slate-400'}`}>
                        {method.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-purple-300 font-bold mb-2 uppercase text-sm tracking-wider">
                  Entry Fee (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formState.entryFee}
                  onChange={(e) => setFormState({ ...formState, entryFee: Number(e.target.value) })}
                  className="w-full bg-slate-900/50 border-2 border-purple-500/30 rounded-xl px-6 py-4 text-white focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 text-lg font-bold"
                />
                <div className="mt-2 text-purple-300 text-sm">
                  Prize Pool: <span className="font-bold text-pink-400">{(formState.entryFee * formState.maxPlayers).toFixed(3)} ETH</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-5 rounded-xl transition-all duration-200 uppercase tracking-wide"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black py-5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/50 hover:scale-105 uppercase tracking-wide"
                >
                  Add Warriors
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-purple-300 text-sm uppercase tracking-wider">Creator</div>
                    <div className="text-white font-bold text-lg mt-1">{currentUser.username}</div>
                    <div className="text-slate-400 text-sm font-mono">{currentUser.walletAddress.slice(0, 16)}...</div>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-2xl">
                    {currentUser.username[0].toUpperCase()}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-purple-300 font-bold mb-3 uppercase text-sm tracking-wider">
                  Invite Warriors ({playerAddresses.length}/{formState.maxPlayers - 1})
                </label>
                <div className="space-y-3">
                  {playerAddresses.map((address, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={address}
                      onChange={(e) => updatePlayerAddress(idx, e.target.value)}
                      placeholder={`Warrior ${idx + 1} wallet address`}
                      className="w-full bg-slate-900/50 border-2 border-purple-500/30 rounded-xl px-6 py-4 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 font-mono"
                    />
                  ))}
                </div>
                {playerAddresses.length < formState.maxPlayers - 1 && (
                  <button
                    onClick={addPlayerField}
                    className="mt-3 text-purple-400 hover:text-purple-300 font-bold uppercase text-sm tracking-wider transition-colors duration-200"
                  >
                    + Add Another Warrior
                  </button>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-5 rounded-xl transition-all duration-200 uppercase tracking-wide"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-purple-900 disabled:to-pink-900 text-white font-black py-5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/50 hover:scale-105 disabled:scale-100 uppercase tracking-wide relative overflow-hidden"
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Forging...
                    </span>
                  ) : (
                    'Launch League'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
