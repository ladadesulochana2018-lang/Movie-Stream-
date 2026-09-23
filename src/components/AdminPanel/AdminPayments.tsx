import React, { useState } from 'react';
import { CreditCard, CheckCircle2, XCircle, RotateCcw, ExternalLink, Image, Settings, QrCode, ShieldCheck, Save, Upload, Key, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminPayments: React.FC = () => {
  const { payments, updatePaymentStatus, paymentGatewayConfig, updatePaymentGatewayConfig } = useApp();
  const [activeTab, setActiveTab] = useState<'verification' | 'gateways'>('verification');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  // Gateway form state
  const [directUpiEnabled, setDirectUpiEnabled] = useState(paymentGatewayConfig.directUpiEnabled);
  const [upiId, setUpiId] = useState(paymentGatewayConfig.upiId);
  const [merchantName, setMerchantName] = useState(paymentGatewayConfig.merchantName);
  const [qrCodeUrl, setQrCodeUrl] = useState(paymentGatewayConfig.qrCodeUrl);

  const [razorpayEnabled, setRazorpayEnabled] = useState(paymentGatewayConfig.razorpayEnabled);
  const [razorpayKeyId, setRazorpayKeyId] = useState(paymentGatewayConfig.razorpayKeyId);
  const [razorpaySecret, setRazorpaySecret] = useState(paymentGatewayConfig.razorpaySecret || '');

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setQrCodeUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentGatewayConfig({
      directUpiEnabled,
      upiId: upiId.trim(),
      merchantName: merchantName.trim(),
      qrCodeUrl: qrCodeUrl.trim(),
      razorpayEnabled,
      razorpayKeyId: razorpayKeyId.trim(),
      razorpaySecret: razorpaySecret.trim()
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header & Main Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white font-display">Payment Verification & Gateway Setup</h2>
          <p className="text-xs text-zinc-400">Configure PhonePe/GPay UPI options, Razorpay Key ID, and verify user payment proofs.</p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
          <button 
            onClick={() => setActiveTab('verification')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'verification' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>User Transactions ({payments.length})</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('gateways')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'gateways' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>Payment Options Setup</span>
          </button>
        </div>
      </div>

      {/* TAB 1: VERIFICATION & USER TRANSACTIONS TABLE */}
      {activeTab === 'verification' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] font-bold border-b border-zinc-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Plan & Amount</th>
                  <th className="p-4">Option & UTR / Ref ID</th>
                  <th className="p-4">Screenshot</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500 text-xs">No payment transactions recorded yet.</td>
                  </tr>
                ) : (
                  payments.map(p => (
                    <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{p.userEmail}</div>
                        <div className="text-[10px] text-zinc-500">{new Date(p.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-amber-400">{p.planName}</div>
                        <div className="text-xs font-black text-white">₹{p.amount}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {p.paymentMethod.includes('Razorpay') ? (
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-mono font-bold">Razorpay ID</span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold">UPI Pay</span>
                          )}
                          <span>{p.paymentMethod}</span>
                        </div>
                        <div className="font-mono text-[10px] text-zinc-400 mt-0.5">{p.transactionId}</div>
                      </td>
                      <td className="p-4">
                        {p.screenshotUrl ? (
                          <button 
                            onClick={() => setSelectedScreenshot(p.screenshotUrl || null)}
                            className="px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            <Image className="w-3 h-3 text-sky-400" /> View Proof
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-600">Direct ID</span>
                        )}
                      </td>
                      <td className="p-4">
                        {p.status === 'approved' && <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">Approved VIP</span>}
                        {p.status === 'pending' && <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px] animate-pulse">Pending Review</span>}
                        {p.status === 'rejected' && <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px]">Rejected</span>}
                        {p.status === 'refunded' && <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-[10px]">Refunded</span>}
                      </td>
                      <td className="p-4 text-right">
                        {p.status === 'pending' ? (
                          <div className="flex justify-end gap-1.5">
                            <button 
                              onClick={() => updatePaymentStatus(p.id, 'approved')}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Approve
                            </button>
                            <button 
                              onClick={() => updatePaymentStatus(p.id, 'rejected')}
                              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3 h-3" /> Reject
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => updatePaymentStatus(p.id, 'refunded')}
                            className="px-2 py-1 rounded bg-zinc-800 text-zinc-400 hover:text-white text-[10px] cursor-pointer"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT GATEWAY OPTIONS SETUP */}
      {activeTab === 'gateways' && (
        <form onSubmit={handleSaveConfig} className="space-y-6">

          {saveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400" /> Payment Gateway credentials saved successfully!
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* OPTION 1: PhonePe, Google Pay & Direct UPI Apps */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl text-left">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white font-display">Option 1: PhonePe, Google Pay & UPI Apps</h3>
                    <p className="text-[11px] text-zinc-400">Direct user app payments via QR Code & Admin UPI ID</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={directUpiEnabled} 
                    onChange={(e) => setDirectUpiEnabled(e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-zinc-200 block mb-1">Admin PhonePe / Google Pay / UPI ID *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. 9876543210@paytm or cinestream@ybl" 
                    value={upiId} 
                    onChange={(e) => setUpiId(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-800 text-amber-400 font-mono font-bold p-3 rounded-xl focus:border-amber-500 focus:outline-none" 
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">Users will see this UPI ID to pay via PhonePe, GPay, Paytm, or BHIM.</p>
                </div>

                <div>
                  <label className="font-bold text-zinc-200 block mb-1">Receiver / Merchant Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. CineStream OTT VIP" 
                    value={merchantName} 
                    onChange={(e) => setMerchantName(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-xl focus:border-amber-500 focus:outline-none font-medium" 
                  />
                </div>

                {/* QR Code Upload / URL */}
                <div>
                  <label className="font-bold text-zinc-200 block mb-1">Payment QR Code Image</label>
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <div className="relative w-28 h-28 rounded-2xl bg-white p-2 border border-zinc-700 shrink-0 flex items-center justify-center overflow-hidden">
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="UPI QR" className="w-full h-full object-contain" />
                      ) : (
                        <QrCode className="w-12 h-12 text-zinc-800" />
                      )}
                    </div>

                    <div className="space-y-2 w-full min-w-0">
                      <div className="relative border border-dashed border-zinc-700 hover:border-amber-500 rounded-xl p-2.5 text-center bg-zinc-950 transition-colors group cursor-pointer">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleQrUpload} 
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" 
                        />
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400">
                          <Upload className="w-4 h-4" /> Upload QR Image File
                        </div>
                      </div>

                      <input 
                        type="url" 
                        placeholder="Or enter QR Code Image URL..." 
                        value={qrCodeUrl} 
                        onChange={(e) => setQrCodeUrl(e.target.value)} 
                        className="w-full bg-zinc-950 border border-zinc-800 text-white p-2.5 rounded-xl text-[11px] focus:border-amber-500 focus:outline-none" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* OPTION 2: Razorpay Key ID & Gateway Option */}
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl text-left">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white font-display">Option 2: Razorpay Payment ID & Gateway</h3>
                    <p className="text-[11px] text-zinc-400">Integrate Razorpay Key ID for direct gateway & instant ref validation</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={razorpayEnabled} 
                    onChange={(e) => setRazorpayEnabled(e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-zinc-200 block mb-1">Razorpay Key ID *</label>
                  <input 
                    type="text" 
                    required={razorpayEnabled} 
                    placeholder="e.g. rzp_live_xxxxxxxxxxxx or rzp_test_xxxxxxx" 
                    value={razorpayKeyId} 
                    onChange={(e) => setRazorpayKeyId(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-800 text-blue-400 font-mono font-bold p-3 rounded-xl focus:border-blue-500 focus:outline-none" 
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">Enter your Razorpay Dashboard Key ID to enable Razorpay checkout option.</p>
                </div>

                <div>
                  <label className="font-bold text-zinc-200 block mb-1">Razorpay Secret Key (Optional / Private)</label>
                  <input 
                    type="password" 
                    placeholder="e.g. secret_key_xxxxxxxx" 
                    value={razorpaySecret} 
                    onChange={(e) => setRazorpaySecret(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-800 text-white font-mono p-3 rounded-xl focus:border-blue-500 focus:outline-none" 
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-blue-200">
                    <ShieldCheck className="w-4 h-4 text-blue-400" /> Razorpay Integration Active
                  </div>
                  <div>Users can pay instantly using cards, netbanking, or submit their Razorpay Payment ID (<code className="font-mono text-white">pay_xxxxxxxx</code>) for verification.</div>
                </div>
              </div>
            </div>

          </div>

          <button 
            type="submit" 
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" /> Save Payment Gateway Settings
          </button>

        </form>
      )}

      {/* Screenshot Preview Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 max-w-lg w-full text-center space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-white">
              <span>Payment Proof Screenshot</span>
              <button onClick={() => setSelectedScreenshot(null)} className="text-zinc-500 hover:text-white cursor-pointer">Close</button>
            </div>
            <img src={selectedScreenshot} alt="Proof" className="w-full max-h-96 object-contain rounded-xl bg-black" />
          </div>
        </div>
      )}
    </div>
  );
};

