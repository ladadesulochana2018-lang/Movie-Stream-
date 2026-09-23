import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Check, 
  Sparkles, 
  CreditCard, 
  QrCode, 
  Upload, 
  CheckCircle2, 
  Ticket, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Copy,
  ExternalLink,
  Key
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SubscriptionPlan } from '../types';

export const SubscriptionModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { plans, coupons, submitPayment, currentUser, setIsAuthModalOpen, paymentGatewayConfig } = useApp();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(plans[2] || plans[0]);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');

  const [paymentStep, setPaymentStep] = useState<'plans' | 'checkout' | 'success'>('plans');
  
  // 2 Main Payment Options: 'upi' (PhonePe/GPay/Other) vs 'razorpay'
  const [activeOptionTab, setActiveOptionTab] = useState<'upi' | 'razorpay'>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'PhonePe UPI' | 'Google Pay' | 'Paytm' | 'UPI Direct'>('PhonePe UPI');
  
  const [transactionIdInput, setTransactionIdInput] = useState('');
  const [razorpayPaymentIdInput, setRazorpayPaymentIdInput] = useState('');
  const [screenshotUrlInput, setScreenshotUrlInput] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!isOpen) return null;

  const finalPrice = Math.max(0, selectedPlan.price - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const found = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.isActive);
    if (!found) {
      setCouponError('Invalid or expired coupon code');
      return;
    }
    if (selectedPlan.price < found.minAmount) {
      setCouponError(`Minimum plan price for this coupon is ₹${found.minAmount}`);
      return;
    }

    let disc = 0;
    if (found.discountType === 'percent') {
      disc = (selectedPlan.price * found.discountValue) / 100;
    } else {
      disc = found.discountValue;
    }

    setDiscountAmount(disc);
    setAppliedCoupon(found.code);
  };

  const handleProceedToPayment = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setPaymentStep('checkout');
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(paymentGatewayConfig.upiId || 'cinestream@ybl');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleConfirmPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeOptionTab === 'upi') {
      if (!transactionIdInput.trim()) return;
      submitPayment(
        selectedPlan.id,
        selectedPlan.name,
        finalPrice,
        selectedUpiApp,
        transactionIdInput.trim(),
        screenshotUrlInput.trim() || undefined
      );
    } else {
      const rzpId = razorpayPaymentIdInput.trim() || `pay_${Date.now()}`;
      submitPayment(
        selectedPlan.id,
        selectedPlan.name,
        finalPrice,
        `Razorpay Gateway (${paymentGatewayConfig.razorpayKeyId || 'rzp_live'})`,
        rzpId,
        screenshotUrlInput.trim() || undefined
      );
    }

    setPaymentStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl text-left my-8">
        
        {/* Modal Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-red-950/40 via-zinc-900 to-amber-950/20 border-b border-zinc-800">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
            <Crown className="w-4 h-4 fill-amber-400" /> CineStream VIP Pass
          </div>
          <h2 className="text-2xl font-black text-white font-display">
            Choose Your Premium Streaming Plan
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Unlock 4K Ultra HD movies & anime, ad-free streaming, and unlimited high-speed downloads.
          </p>
        </div>

        {/* STEP 1: PLANS SELECTION */}
        {paymentStep === 'plans' && (
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            
            {/* Plans Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map(plan => {
                const isSelected = selectedPlan.id === plan.id;
                return (
                  <div 
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-gradient-to-b from-red-950/40 via-zinc-900 to-zinc-900 border-red-500 shadow-xl shadow-red-600/10 scale-102' 
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 p-1 rounded-full bg-red-600 text-white">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}

                    <div>
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">{plan.name} Plan</div>
                      <div className="flex items-baseline gap-1 my-2">
                        <span className="text-2xl font-black text-white">₹{plan.price}</span>
                        <span className="text-xs text-zinc-500">/ {plan.durationDays} Days</span>
                      </div>

                      <div className="my-3 border-t border-zinc-800" />

                      <ul className="space-y-2 text-xs text-zinc-300 mb-4">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-[10px] text-zinc-500 font-mono">
                      Max {plan.devicesCount} Device(s) • {plan.videoQuality}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code Input */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 w-full sm:w-auto">
                <Ticket className="w-4 h-4 text-amber-400" />
                <span>Apply Promo Coupon</span>
              </div>

              <form onSubmit={handleApplyCoupon} className="flex items-center gap-2 w-full sm:w-auto">
                <input 
                  type="text" 
                  placeholder="e.g. CINEMA50"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-xs text-white uppercase font-mono px-3 py-2 rounded-xl focus:outline-none focus:border-red-500 w-full sm:w-36"
                />
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors"
                >
                  Apply
                </button>
              </form>
            </div>

            {couponError && <p className="text-xs text-rose-400">{couponError}</p>}
            {appliedCoupon && (
              <p className="text-xs text-emerald-400 font-bold">
                Coupon '{appliedCoupon}' applied! Discount: ₹{discountAmount}
              </p>
            )}

            {/* Price Summary & Checkout Button */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <div>
                <span className="text-xs text-zinc-500">Total Payable:</span>
                <div className="text-xl font-black text-white">₹{finalPrice}</div>
              </div>

              <button 
                onClick={handleProceedToPayment}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm shadow-xl shadow-red-600/30 transition-all cursor-pointer"
              >
                Proceed to Pay <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 2: CHECKOUT & PAYMENT METHOD */}
        {paymentStep === 'checkout' && (
          <div className="p-6 space-y-6">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-zinc-400">Selected Plan:</div>
                <div className="text-sm font-bold text-white">{selectedPlan.name} ({selectedPlan.durationDays} Days)</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-400">Amount Due:</div>
                <div className="text-lg font-black text-amber-400">₹{finalPrice}</div>
              </div>
            </div>

            {/* 2 MAIN PAYMENT OPTIONS SELECTOR */}
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-2">Select Payment Gateway / Verification Option</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* OPTION 1 TAB */}
                <button 
                  type="button"
                  onClick={() => setActiveOptionTab('upi')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    activeOptionTab === 'upi'
                      ? 'bg-gradient-to-r from-amber-950/40 to-zinc-900 border-amber-500 text-white shadow-xl shadow-amber-500/10'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl border ${activeOptionTab === 'upi' ? 'bg-amber-500 text-black border-amber-400' : 'bg-zinc-900 text-zinc-400 border-zinc-800'}`}>
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">Option 1: PhonePe, GPay & UPI Apps</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Pay via PhonePe, Google Pay, Paytm, QR Code & UTR</div>
                  </div>
                </button>

                {/* OPTION 2 TAB */}
                <button 
                  type="button"
                  onClick={() => setActiveOptionTab('razorpay')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    activeOptionTab === 'razorpay'
                      ? 'bg-gradient-to-r from-blue-950/40 to-zinc-900 border-blue-500 text-white shadow-xl shadow-blue-500/10'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl border ${activeOptionTab === 'razorpay' ? 'bg-blue-600 text-white border-blue-400' : 'bg-zinc-900 text-zinc-400 border-zinc-800'}`}>
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">Option 2: Razorpay Gateway & ID</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Razorpay Key: {paymentGatewayConfig.razorpayKeyId || 'rzp_live'}</div>
                  </div>
                </button>

              </div>
            </div>

            {/* OPTION 1 CONTENT: PHONEPE, GOOGLE PAY & UPI APPS */}
            {activeOptionTab === 'upi' && (
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-5 text-left">
                
                {/* Specific UPI App Selector */}
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1.5">Choose Preferred App</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['PhonePe UPI', 'Google Pay', 'Paytm', 'UPI Direct'] as const).map((app) => (
                      <button 
                        key={app}
                        type="button"
                        onClick={() => setSelectedUpiApp(app)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                          selectedUpiApp === app ? 'bg-amber-500 border-amber-400 text-black' : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                        }`}
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                </div>

                {/* QR Code & Admin UPI ID Box */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="w-32 h-32 bg-white p-2 rounded-xl flex-shrink-0 flex flex-col items-center justify-center overflow-hidden border border-zinc-700 shadow-lg">
                    {paymentGatewayConfig.qrCodeUrl ? (
                      <img src={paymentGatewayConfig.qrCodeUrl} alt="UPI QR Code" className="w-full h-full object-contain" />
                    ) : (
                      <QrCode className="w-20 h-20 text-zinc-900" />
                    )}
                  </div>

                  <div className="space-y-2 text-xs text-zinc-300 w-full">
                    <div className="font-bold text-white text-xs">Pay to Official Admin UPI ID ({paymentGatewayConfig.merchantName}):</div>
                    
                    <div className="flex items-center gap-2">
                      <div className="p-2.5 rounded-xl bg-zinc-950 font-mono text-amber-400 text-xs font-black border border-zinc-800 select-all flex-1 tracking-wider">
                        {paymentGatewayConfig.upiId || 'cinestream@ybl'}
                      </div>
                      <button 
                        type="button"
                        onClick={handleCopyUpiId}
                        className="px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1 shrink-0 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedUpi ? 'Copied!' : 'Copy ID'}</span>
                      </button>
                    </div>

                    <a 
                      href={`upi://pay?pa=${paymentGatewayConfig.upiId || 'cinestream@ybl'}&pn=${encodeURIComponent(paymentGatewayConfig.merchantName)}&am=${finalPrice}&cu=INR`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 font-bold text-[11px] transition-all"
                    >
                      <ExternalLink className="w-3 h-3" /> One-Tap Pay via App (PhonePe / GPay)
                    </a>
                  </div>
                </div>

                {/* Submit Form */}
                <form onSubmit={handleConfirmPaymentSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">UPI Transaction / UTR ID (12-Digits) *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 41298492019"
                      value={transactionIdInput}
                      onChange={(e) => setTransactionIdInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs text-amber-400 font-bold p-3 rounded-xl focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">Payment Screenshot Proof URL (Optional)</label>
                    <input 
                      type="url" 
                      placeholder="https://image-host.com/my-payment-screenshot.png"
                      value={screenshotUrlInput}
                      onChange={(e) => setScreenshotUrlInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    Submit UPI Payment Verification
                  </button>
                </form>

              </div>
            )}

            {/* OPTION 2 CONTENT: RAZORPAY GATEWAY & ID */}
            {activeOptionTab === 'razorpay' && (
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 text-left">
                
                <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <Key className="w-4 h-4 text-blue-400" /> Razorpay Payment Gateway Integration
                  </div>
                  <div className="text-[11px] text-zinc-300">
                    Active Razorpay Key ID: <code className="font-mono text-blue-300 bg-black/50 px-2 py-0.5 rounded font-bold">{paymentGatewayConfig.razorpayKeyId || 'rzp_live_xxxxxxxx'}</code>
                  </div>
                </div>

                <form onSubmit={handleConfirmPaymentSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">Enter Razorpay Payment ID / Ref ID (Optional or Auto Generated)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. pay_NkWx19283471"
                      value={razorpayPaymentIdInput}
                      onChange={(e) => setRazorpayPaymentIdInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs text-blue-400 font-bold p-3 rounded-xl focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">If paying through Razorpay popup, paste your payment ID above or click below to submit instantly.</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">Payment Receipt / Screenshot URL (Optional)</label>
                    <input 
                      type="url" 
                      placeholder="https://image-host.com/razorpay-receipt.png"
                      value={screenshotUrlInput}
                      onChange={(e) => setScreenshotUrlInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs text-white p-3 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-xl shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-white" /> Pay & Verify via Razorpay Option
                  </button>
                </form>

              </div>
            )}

          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {paymentStep === 'success' && (
          <div className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-black text-white font-display">Payment Submitted Successfully!</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Your transaction is currently under manual verification by Admin. Once verified, your VIP Membership status will be updated immediately.
            </p>
            <button 
              onClick={onClose}
              className="px-8 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs"
            >
              Back to Movies
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
