import React, { useState } from 'react';
import { Crown, Plus, Edit3, Trash2, Check, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SubscriptionPlan } from '../../types';

export const AdminSubscriptions: React.FC = () => {
  const { plans, updatePlan, addPlan, deletePlan } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('Gold');
  const [price, setPrice] = useState(499);
  const [durationDays, setDurationDays] = useState(90);
  const [videoQuality, setVideoQuality] = useState('4K Ultra HD');
  const [downloadLimit, setDownloadLimit] = useState(15);
  const [devicesCount, setDevicesCount] = useState(3);
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [featuresText, setFeaturesText] = useState('4K Ultra HD, No Ads, 15 Downloads/day');

  const handleOpenModal = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingId(plan.id);
      setName(plan.name);
      setPrice(plan.price);
      setDurationDays(plan.durationDays);
      setVideoQuality(plan.videoQuality);
      setDownloadLimit(plan.downloadLimit);
      setDevicesCount(plan.devicesCount);
      setAdsEnabled(plan.adsEnabled);
      setFeaturesText(plan.features.join('\n'));
    } else {
      setEditingId(null);
      setName('Custom VIP');
      setPrice(299);
      setDurationDays(45);
      setVideoQuality('1080p Full HD');
      setDownloadLimit(10);
      setDevicesCount(2);
      setAdsEnabled(false);
      setFeaturesText('Ad-Free Streaming\n10 Downloads per day\nDual Device Support');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const features = featuresText.split('\n').map(f => f.trim()).filter(Boolean);

    const payload: SubscriptionPlan = {
      id: editingId || `p_${Date.now()}`,
      name,
      price: Number(price),
      durationDays: Number(durationDays),
      videoQuality,
      downloadLimit: Number(downloadLimit),
      devicesCount: Number(devicesCount),
      adsEnabled,
      premiumMoviesAccess: true,
      animeAccess: true,
      features
    };

    if (editingId) {
      updatePlan(payload);
    } else {
      addPlan(payload);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white font-display">Membership Plans & Pricing</h2>
          <p className="text-xs text-zinc-400">Customize Bronze, Silver, Gold, Platinum, Diamond or create custom duration plans.</p>
        </div>

        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Custom Plan
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(plan => (
          <div key={plan.id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 uppercase tracking-widest">{plan.name}</span>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold text-[10px]">{plan.durationDays} Days</span>
              </div>
              <div className="text-2xl font-black text-white my-2">₹{plan.price}</div>
              <ul className="space-y-1.5 text-xs text-zinc-300 my-3">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <span className="text-[10px] text-zinc-500">{plan.videoQuality}</span>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal(plan)} className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deletePlan(plan.id)} className="p-1.5 rounded-lg bg-rose-950/30 text-rose-400 hover:bg-rose-600 hover:text-white">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-black text-white font-display">
                {editingId ? 'Edit Plan' : 'Add Membership Plan'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Plan Name *</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Price (₹) *</label>
                  <input type="number" required value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl" />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Duration (Days) *</label>
                  <input type="number" required value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl" />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">Video Quality</label>
                <input type="text" value={videoQuality} onChange={(e) => setVideoQuality(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl" />
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">Features (one per line)</label>
                <textarea rows={3} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl" />
              </div>

              <button type="submit" className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm">
                Save Subscription Plan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
