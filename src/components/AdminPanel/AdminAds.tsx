import React, { useState } from 'react';
import { 
  Sparkles, 
  Save, 
  CheckCircle2, 
  ExternalLink, 
  Link as LinkIcon, 
  Code, 
  Tv, 
  Maximize2, 
  Gift, 
  Award, 
  Layout, 
  Smartphone, 
  ShieldCheck, 
  Info, 
  Eye,
  Check,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdFormatItem } from '../../types';

export const AdminAds: React.FC = () => {
  const { adsConfig, updateAdsConfig } = useApp();

  const [adMobId, setAdMobId] = useState(adsConfig.adMobId || '');
  const [enabled, setEnabled] = useState(adsConfig.enabled);
  const [frequencyMinutes, setFrequencyMinutes] = useState(adsConfig.frequencyMinutes || 2);
  const [skipDelaySeconds, setSkipDelaySeconds] = useState(adsConfig.skipDelaySeconds || 5);

  // AdMob Formats State
  const [bannerAd, setBannerAd] = useState<AdFormatItem>(adsConfig.bannerAd || {
    enabled: true,
    adUnitId: 'ca-app-pub-3940256099942544/6300978111',
    targetUrl: 'https://admob.google.com',
    scriptCode: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3940256099942544" data-ad-slot="6300978111" data-ad-format="auto"></ins>'
  });

  const [interstitialAd, setInterstitialAd] = useState<AdFormatItem>(adsConfig.interstitialAd || {
    enabled: true,
    adUnitId: 'ca-app-pub-3940256099942544/1033173712',
    targetUrl: 'https://admob.google.com',
    scriptCode: ''
  });

  const [rewardedInterstitialAd, setRewardedInterstitialAd] = useState<AdFormatItem>(adsConfig.rewardedInterstitialAd || {
    enabled: true,
    adUnitId: 'ca-app-pub-3940256099942544/5354046379',
    targetUrl: 'https://admob.google.com',
    rewardValue: 30
  });

  const [rewardedAd, setRewardedAd] = useState<AdFormatItem>(adsConfig.rewardedAd || {
    enabled: true,
    adUnitId: 'ca-app-pub-3940256099942544/5224354917',
    targetUrl: 'https://admob.google.com',
    rewardValue: 60
  });

  const [nativeAdvancedAd, setNativeAdvancedAd] = useState<AdFormatItem>(adsConfig.nativeAdvancedAd || {
    enabled: true,
    adUnitId: 'ca-app-pub-3940256099942544/2247696110',
    targetUrl: 'https://admob.google.com',
    scriptCode: ''
  });

  const [appOpenAd, setAppOpenAd] = useState<AdFormatItem>(adsConfig.appOpenAd || {
    enabled: true,
    adUnitId: 'ca-app-pub-3940256099942544/3419835294',
    targetUrl: 'https://admob.google.com',
    rewardValue: 3
  });

  const [saved, setSaved] = useState(false);
  const [activePreview, setActivePreview] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdsConfig({
      adMobId,
      adUnitId: interstitialAd.adUnitId,
      adScript: bannerAd.scriptCode || '',
      enabled,
      frequencyMinutes: Number(frequencyMinutes),
      skipDelaySeconds: Number(skipDelaySeconds),
      bannerAd,
      interstitialAd,
      rewardedInterstitialAd,
      rewardedAd,
      nativeAdvancedAd,
      appOpenAd
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 text-left max-w-6xl animate-in fade-in pb-12">
      
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950/50 via-zinc-900 to-zinc-900 border border-red-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-500">
              <Tv className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-2xl font-black text-white font-display tracking-wide">
                Google AdMob Links & Ad Unit Setup
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Configure and add custom Ad Unit IDs, Direct Links, and Scripts for all 6 Google AdMob Formats.
              </p>
            </div>
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>All AdMob Links Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">

        {/* Global Master Settings */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> AdMob Global Master Controls
              </h3>
              <p className="text-xs text-zinc-400">Master switch & general frequency settings for non-VIP free users.</p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer bg-zinc-950 px-4 py-2.5 rounded-2xl border border-zinc-800 hover:border-red-500/50 transition-colors">
              <span className="text-xs font-bold text-white">Enable All Monetization Ads</span>
              <input 
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-5 h-5 accent-red-600 cursor-pointer rounded"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-zinc-300 block mb-1">Google AdMob Publisher App ID</label>
              <input 
                type="text" 
                value={adMobId}
                onChange={(e) => setAdMobId(e.target.value)}
                placeholder="ca-app-pub-3940256099942544~3347511713"
                className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-2xl font-mono focus:border-red-500 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-300 block mb-1">Interstitial Frequency</label>
              <select 
                value={frequencyMinutes}
                onChange={(e) => setFrequencyMinutes(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-2xl font-bold focus:border-red-500 outline-none"
              >
                <option value={1}>Every 1 Minute (Aggressive)</option>
                <option value={2}>Every 2 Minutes (Recommended)</option>
                <option value={5}>Every 5 Minutes</option>
                <option value={10}>Every 10 Minutes</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-zinc-300 block mb-1">Skip Ad Delay (Seconds)</label>
              <input 
                type="number" 
                value={skipDelaySeconds}
                onChange={(e) => setSkipDelaySeconds(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-2xl font-bold focus:border-red-500 outline-none"
                min={0}
                max={30}
              />
            </div>
          </div>
        </div>

        {/* Section Heading for AdMob Formats */}
        <div>
          <h3 className="text-lg font-black text-white font-display flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" /> Google AdMob Ad Formats Links
          </h3>
          <p className="text-xs text-zinc-400">
            Set unique Ad Unit IDs, Direct Links, and Embed scripts for each AdMob format below.
          </p>
        </div>

        {/* Grid of 6 Google AdMob Formats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 1. Banner Ad */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 hover:border-amber-500/30 transition-all flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Tv className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base font-display">Banner</h4>
                    <p className="text-[11px] text-zinc-400 leading-tight">
                      Rectangular ads that occupy a portion of an app's layout; can be refreshed automatically.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={bannerAd.enabled}
                    onChange={(e) => setBannerAd({ ...bannerAd, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">AdMob Banner Ad Unit ID</label>
                  <input 
                    type="text" 
                    value={bannerAd.adUnitId}
                    onChange={(e) => setBannerAd({ ...bannerAd, adUnitId: e.target.value })}
                    placeholder="ca-app-pub-3940256099942544/6300978111"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl font-mono text-xs focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1 flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5 text-amber-400" /> Direct Target / Click Link
                  </label>
                  <input 
                    type="url" 
                    value={bannerAd.targetUrl}
                    onChange={(e) => setBannerAd({ ...bannerAd, targetUrl: e.target.value })}
                    placeholder="https://example.com/banner-landing"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl text-xs focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1 flex items-center gap-1">
                    <Code className="w-3.5 h-3.5 text-zinc-400" /> Embed Script / Ad Tag (Optional)
                  </label>
                  <textarea 
                    rows={2}
                    value={bannerAd.scriptCode || ''}
                    onChange={(e) => setBannerAd({ ...bannerAd, scriptCode: e.target.value })}
                    placeholder="<ins class='adsbygoogle' ...></ins>"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl font-mono text-[11px] focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setActivePreview('banner')}
              className="w-full py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" /> Preview Banner Ad
            </button>
          </div>

          {/* 2. Interstitial Ad */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 hover:border-sky-500/30 transition-all flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                    <Maximize2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base font-display">Interstitial</h4>
                    <p className="text-[11px] text-zinc-400 leading-tight">
                      Full-page ad format that appears at natural breaks and transitions, such as level completion.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={interstitialAd.enabled}
                    onChange={(e) => setInterstitialAd({ ...interstitialAd, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">AdMob Interstitial Ad Unit ID</label>
                  <input 
                    type="text" 
                    value={interstitialAd.adUnitId}
                    onChange={(e) => setInterstitialAd({ ...interstitialAd, adUnitId: e.target.value })}
                    placeholder="ca-app-pub-3940256099942544/1033173712"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl font-mono text-xs focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1 flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5 text-sky-400" /> Direct Interstitial Link / Redirect URL
                  </label>
                  <input 
                    type="url" 
                    value={interstitialAd.targetUrl}
                    onChange={(e) => setInterstitialAd({ ...interstitialAd, targetUrl: e.target.value })}
                    placeholder="https://example.com/interstitial-offer"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl text-xs focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1 flex items-center gap-1">
                    <Code className="w-3.5 h-3.5 text-zinc-400" /> Video Embed / Script (Optional)
                  </label>
                  <input 
                    type="text" 
                    value={interstitialAd.scriptCode || ''}
                    onChange={(e) => setInterstitialAd({ ...interstitialAd, scriptCode: e.target.value })}
                    placeholder="https://commondatastorage.googleapis.com/.../ad.mp4"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl text-[11px] focus:border-sky-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setActivePreview('interstitial')}
              className="w-full py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-sky-400" /> Preview Interstitial Ad
            </button>
          </div>

          {/* 3. Rewarded Interstitial (BETA) */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 hover:border-emerald-500/30 transition-all flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 relative">
                    <Award className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-emerald-500 text-black text-[8px] font-black rounded-full uppercase">BETA</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-white text-base font-display">Rewarded Interstitial</h4>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider">BETA</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-tight">
                      Full-page ad format that rewards users for viewing ads during natural breaks or transitions.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={rewardedInterstitialAd.enabled}
                    onChange={(e) => setRewardedInterstitialAd({ ...rewardedInterstitialAd, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">AdMob Rewarded Interstitial Unit ID</label>
                  <input 
                    type="text" 
                    value={rewardedInterstitialAd.adUnitId}
                    onChange={(e) => setRewardedInterstitialAd({ ...rewardedInterstitialAd, adUnitId: e.target.value })}
                    placeholder="ca-app-pub-3940256099942544/5354046379"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl font-mono text-xs focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1 flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5 text-emerald-400" /> Target Promo Link / Web Page
                  </label>
                  <input 
                    type="url" 
                    value={rewardedInterstitialAd.targetUrl}
                    onChange={(e) => setRewardedInterstitialAd({ ...rewardedInterstitialAd, targetUrl: e.target.value })}
                    placeholder="https://example.com/rewarded-interstitial-page"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl text-xs focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Reward Duration (Minutes Free VIP Access)</label>
                  <input 
                    type="number" 
                    value={rewardedInterstitialAd.rewardValue || 30}
                    onChange={(e) => setRewardedInterstitialAd({ ...rewardedInterstitialAd, rewardValue: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl text-xs font-bold focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setActivePreview('rewardedInterstitial')}
              className="w-full py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" /> Preview Rewarded Interstitial Ad
            </button>
          </div>

          {/* 4. Rewarded Ad */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 hover:border-purple-500/30 transition-all flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base font-display">Rewarded Video</h4>
                    <p className="text-[11px] text-zinc-400 leading-tight">
                      Full-page ad format that rewards users who choose to view an ad. Users must opt in to view.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={rewardedAd.enabled}
                    onChange={(e) => setRewardedAd({ ...rewardedAd, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">AdMob Rewarded Video Unit ID</label>
                  <input 
                    type="text" 
                    value={rewardedAd.adUnitId}
                    onChange={(e) => setRewardedAd({ ...rewardedAd, adUnitId: e.target.value })}
                    placeholder="ca-app-pub-3940256099942544/5224354917"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl font-mono text-xs focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1 flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5 text-purple-400" /> Target Video Ad Link / Web Offer
                  </label>
                  <input 
                    type="url" 
                    value={rewardedAd.targetUrl}
                    onChange={(e) => setRewardedAd({ ...rewardedAd, targetUrl: e.target.value })}
                    placeholder="https://example.com/rewarded-video-offer"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl text-xs focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1">User Opt-in Reward (Minutes Free HD Access)</label>
                  <input 
                    type="number" 
                    value={rewardedAd.rewardValue || 60}
                    onChange={(e) => setRewardedAd({ ...rewardedAd, rewardValue: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl text-xs font-bold focus:border-purple-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setActivePreview('rewarded')}
              className="w-full py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-purple-400" /> Preview Rewarded Video Ad
            </button>
          </div>

          {/* 5. Native Advanced */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 hover:border-orange-500/30 transition-all flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                    <Layout className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base font-display">Native Advanced</h4>
                    <p className="text-[11px] text-zinc-400 leading-tight">
                      Customizable ad format that matches the look and feel of your app; appears inline with app content.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={nativeAdvancedAd.enabled}
                    onChange={(e) => setNativeAdvancedAd({ ...nativeAdvancedAd, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">AdMob Native Advanced Ad Unit ID</label>
                  <input 
                    type="text" 
                    value={nativeAdvancedAd.adUnitId}
                    onChange={(e) => setNativeAdvancedAd({ ...nativeAdvancedAd, adUnitId: e.target.value })}
                    placeholder="ca-app-pub-3940256099942544/2247696110"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl font-mono text-xs focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1 flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5 text-orange-400" /> Native Ad Target Link
                  </label>
                  <input 
                    type="url" 
                    value={nativeAdvancedAd.targetUrl}
                    onChange={(e) => setNativeAdvancedAd({ ...nativeAdvancedAd, targetUrl: e.target.value })}
                    placeholder="https://example.com/native-ad-link"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl text-xs focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1 flex items-center gap-1">
                    <Code className="w-3.5 h-3.5 text-zinc-400" /> Native Template Code (Optional)
                  </label>
                  <input 
                    type="text" 
                    value={nativeAdvancedAd.scriptCode || ''}
                    onChange={(e) => setNativeAdvancedAd({ ...nativeAdvancedAd, scriptCode: e.target.value })}
                    placeholder="Custom HTML template or JSON layout script"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl text-[11px] focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setActivePreview('native')}
              className="w-full py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-orange-400" /> Preview Native Advanced Ad
            </button>
          </div>

          {/* 6. App Open */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 hover:border-rose-500/30 transition-all flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-base font-display">App Open</h4>
                    <p className="text-[11px] text-zinc-400 leading-tight">
                      Ad format that appears when users open or switch back to your app. Ad overlays loading screen.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={appOpenAd.enabled}
                    onChange={(e) => setAppOpenAd({ ...appOpenAd, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">AdMob App Open Ad Unit ID</label>
                  <input 
                    type="text" 
                    value={appOpenAd.adUnitId}
                    onChange={(e) => setAppOpenAd({ ...appOpenAd, adUnitId: e.target.value })}
                    placeholder="ca-app-pub-3940256099942544/3419835294"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl font-mono text-xs focus:border-rose-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1 flex items-center gap-1">
                    <LinkIcon className="w-3.5 h-3.5 text-rose-400" /> App Open Target Link / Splash Promo URL
                  </label>
                  <input 
                    type="url" 
                    value={appOpenAd.targetUrl}
                    onChange={(e) => setAppOpenAd({ ...appOpenAd, targetUrl: e.target.value })}
                    placeholder="https://example.com/app-open-promo"
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl text-xs focus:border-rose-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Splash Display Timer (Seconds)</label>
                  <input 
                    type="number" 
                    value={appOpenAd.rewardValue || 3}
                    onChange={(e) => setAppOpenAd({ ...appOpenAd, rewardValue: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl text-xs font-bold focus:border-rose-500 outline-none"
                    min={1}
                    max={10}
                  />
                </div>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setActivePreview('appOpen')}
              className="w-full py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-rose-400" /> Preview App Open Ad
            </button>
          </div>

        </div>

        {/* Floating / Sticky Save Bar */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Save All AdMob Configuration & Links</p>
              <p className="text-[11px] text-zinc-400">All 6 AdMob formats will immediately take effect for free users.</p>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" /> Save All AdMob Links
          </button>
        </div>

      </form>

      {/* Ad Test & Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative text-left">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-red-600/20 text-red-500">
                  <Tv className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">
                  AdMob {activePreview} Format Test Preview
                </h3>
              </div>
              <button 
                onClick={() => setActivePreview(null)}
                className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold"
              >
                Close
              </button>
            </div>

            {/* Preview Box */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Format: <strong className="text-white uppercase">{activePreview}</strong></span>
                <span className="text-emerald-400 font-bold">STATUS: ACTIVE</span>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-red-500/10 to-purple-500/10 border border-zinc-800 text-center space-y-2">
                <p className="text-xs font-bold text-white">Google AdMob Test Unit</p>
                <p className="text-[10px] font-mono text-amber-400 break-all">
                  Unit ID: {
                    activePreview === 'banner' ? bannerAd.adUnitId :
                    activePreview === 'interstitial' ? interstitialAd.adUnitId :
                    activePreview === 'rewardedInterstitial' ? rewardedInterstitialAd.adUnitId :
                    activePreview === 'rewarded' ? rewardedAd.adUnitId :
                    activePreview === 'native' ? nativeAdvancedAd.adUnitId : appOpenAd.adUnitId
                  }
                </p>
                
                <a 
                  href={
                    activePreview === 'banner' ? bannerAd.targetUrl :
                    activePreview === 'interstitial' ? interstitialAd.targetUrl :
                    activePreview === 'rewardedInterstitial' ? rewardedInterstitialAd.targetUrl :
                    activePreview === 'rewarded' ? rewardedAd.targetUrl :
                    activePreview === 'native' ? nativeAdvancedAd.targetUrl : appOpenAd.targetUrl
                  } 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-500 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Test Target Link
                </a>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 text-center">
              This preview confirms your AdMob Unit ID and destination landing link are correctly saved in App State.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
