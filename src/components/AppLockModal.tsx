import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AppLockModal: React.FC = () => {
  const { isAppLocked, verifyPin } = useApp();
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAppLocked) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const ok = verifyPin(pinInput);
    if (!ok) {
      setErrorMsg('Incorrect PIN Code. Please try again.');
      setPinInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in">
      <div className="max-w-sm w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center shadow-2xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 animate-pulse" />
        </div>

        <div>
          <h3 className="text-xl font-black text-white font-display">CineStream App Lock</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Enter your 4-digit security PIN to unlock access.
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <input 
            type="password"
            maxLength={6}
            autoFocus
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="••••"
            className="w-full text-center text-2xl tracking-[0.5em] font-mono bg-zinc-950 border border-zinc-800 text-white p-3 rounded-2xl focus:outline-none focus:border-red-500"
          />

          {errorMsg && <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>}

          <button 
            type="submit"
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-xl shadow-red-600/30 transition-all cursor-pointer"
          >
            Unlock App
          </button>
        </form>
      </div>
    </div>
  );
};
