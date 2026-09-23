import React, { useState } from 'react';
import { Ticket, Plus, Trash2, Check, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Coupon } from '../../types';

export const AdminCoupons: React.FC = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('OFF50');
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent');
  const [discountValue, setDiscountValue] = useState(50);
  const [minAmount, setMinAmount] = useState(199);
  const [maxUses, setMaxUses] = useState(500);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newC: Coupon = {
      id: `c_${Date.now()}`,
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minAmount: Number(minAmount),
      maxUses: Number(maxUses),
      usedCount: 0,
      expiryDate,
      isActive: true
    };
    addCoupon(newC);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white font-display">Coupon Management</h2>
          <p className="text-xs text-zinc-400">Create percentage or flat discount promo codes for users.</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Promo Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map(c => (
          <div key={c.id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="font-mono text-base font-black text-amber-400 tracking-wider">{c.code}</span>
              <button onClick={() => deleteCoupon(c.id)} className="text-rose-400 hover:text-rose-300">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm font-bold text-white">
              {c.discountType === 'percent' ? `${c.discountValue}% Off` : `₹${c.discountValue} Flat Discount`}
            </div>
            <div className="text-[11px] text-zinc-400">Min Spend: ₹{c.minAmount} • Uses: {c.usedCount}/{c.maxUses}</div>
            <div className="text-[10px] text-zinc-500">Expires: {c.expiryDate}</div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-black text-white font-display">Create Coupon Code</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-zinc-300 block mb-1">Coupon Code *</label>
                <input type="text" required value={code} onChange={(e) => setCode(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white font-mono uppercase p-2.5 rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Discount Type</label>
                  <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl">
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Value *</label>
                  <input type="number" required value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Min Spend (₹)</label>
                  <input type="number" value={minAmount} onChange={(e) => setMinAmount(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl" />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Max Uses</label>
                  <input type="number" value={maxUses} onChange={(e) => setMaxUses(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl" />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1">Expiry Date</label>
                <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl" />
              </div>

              <button type="submit" className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm">
                Save Coupon Code
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
