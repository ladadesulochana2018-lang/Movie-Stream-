import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginUser, signupUser, appBranding } = useApp();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (isSignup) {
      signupUser(email, password, username || email.split('@')[0]);
    } else {
      loginUser(email, password);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-left">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Branding Header */}
        <div className="flex items-center gap-3 mb-6">
          <img 
            src={appBranding.appLogoUrl || "/src/assets/images/movie_stream_app_icon_1788152392265.jpg"} 
            alt={appBranding.appName || "Movie Stream"}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-xl object-cover border border-red-500/40 shadow-lg shadow-red-600/30 shrink-0" 
          />
          <div>
            <h3 className="text-lg font-black text-white font-display">
              {isSignup ? `Create ${appBranding.appName || 'Movie Stream'} Account` : `Welcome to ${appBranding.appName || 'Movie Stream'}`}
            </h3>
            <p className="text-xs text-zinc-400">
              Sign in to stream 4K movies & anime, save playlists, and download offline.
            </p>
          </div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  required
                  placeholder="e.g. OtakuKing99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="email" 
                required
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-xs text-white pl-9 pr-10 py-2.5 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer p-0.5"
                title={showPassword ? "Hide Password" : "Show Password"}
                aria-label={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-xl shadow-red-600/30 transition-all cursor-pointer"
          >
            {isSignup ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-zinc-800 text-center">
          <button 
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="w-full text-xs text-zinc-400 hover:text-white font-medium py-1 cursor-pointer"
          >
            {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Create One"}
          </button>
        </div>

      </div>
    </div>
  );
};
