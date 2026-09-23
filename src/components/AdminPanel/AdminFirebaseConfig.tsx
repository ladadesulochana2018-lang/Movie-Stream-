import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, Save, Copy, RefreshCw, Key } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getSavedFirebaseConfig, saveFirebaseConfig, testConnection } from '../../services/firebaseConfig';

export const AdminFirebaseConfig: React.FC = () => {
  const currentConfig = getSavedFirebaseConfig();

  const [rawConfigInput, setRawConfigInput] = useState(
    JSON.stringify(currentConfig || {
      apiKey: "AIzaSyB_SampleApiKey_CineStream2026",
      authDomain: "cinestream-ott.firebaseapp.com",
      projectId: "cinestream-ott",
      storageBucket: "cinestream-ott.appspot.com",
      messagingSenderId: "987654321012",
      appId: "1:987654321012:web:abc123def456"
    }, null, 2)
  );

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let parsed = JSON.parse(rawConfigInput);
      if (parsed.firebaseConfig) {
        parsed = parsed.firebaseConfig;
      }
      saveFirebaseConfig(parsed);
      setSaveStatus('Firebase Configuration saved successfully! App reloaded.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setSaveStatus('Invalid JSON syntax. Please check your Firebase Config object format.');
    }
  };

  return (
    <div className="space-y-6 text-left max-w-3xl">
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold">
          <Database className="w-4 h-4" /> Firebase Credentials Setting
        </div>
        <h2 className="text-xl font-black text-white font-display">Paste Firebase Config (No Code Editing Required)</h2>
        <p className="text-xs text-zinc-400">
          Paste your standard Firebase project credentials object below. This config will be saved dynamically to local storage and initialized immediately across Firebase Auth, Firestore, and FCM.
        </p>
      </div>

      <form onSubmit={handleSaveConfig} className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 text-xs">
        <div>
          <label className="font-bold text-zinc-300 block mb-1">Firebase Config Object / JSON *</label>
          <textarea 
            rows={10}
            required
            value={rawConfigInput}
            onChange={(e) => setRawConfigInput(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-amber-400 font-mono text-xs p-4 rounded-2xl focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="submit"
            className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-xl shadow-red-600/30 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Firebase Credentials
          </button>
        </div>

        {saveStatus && (
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-amber-400 font-bold">
            {saveStatus}
          </div>
        )}
      </form>
    </div>
  );
};
