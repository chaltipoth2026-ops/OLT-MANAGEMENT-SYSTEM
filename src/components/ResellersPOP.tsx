import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Plus,
  Trash2,
  DollarSign,
  Briefcase,
  Users,
  MapPin,
  Compass,
  XCircle,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { Reseller, AreaName } from '../types';

interface ResellersPOPProps {
  resellers: Reseller[];
  areas: AreaName[];
  onAddReseller: (reseller: Reseller) => void;
  onAddArea: (area: AreaName) => void;
  onDeleteReseller: (id: string) => void;
  onDeleteArea: (id: string) => void;
  onUpdateReseller: (reseller: Reseller) => void;
  onAddAlert: (alert: any) => void;
}

export default function ResellersPOP({
  resellers,
  areas,
  onAddReseller,
  onAddArea,
  onDeleteReseller,
  onDeleteArea,
  onUpdateReseller,
  onAddAlert,
}: ResellersPOPProps) {
  const [showResellerForm, setShowResellerForm] = useState(false);
  const [showAreaForm, setShowAreaForm] = useState(false);

  // Reseller Form
  const [resName, setResName] = useState('');
  const [resArea, setResArea] = useState('Apex Reseller Area');
  const [resEmail, setResEmail] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resCredit, setResCredit] = useState<number>(1000);
  const [resBalance, setResBalance] = useState<number>(500);

  // Area Form
  const [areaName, setAreaName] = useState('');
  const [areaType, setAreaType] = useState<'customer' | 'pop' | 'reseller'>('customer');

  const handleAddResellerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName || !resEmail || !resPhone) {
      alert('Please fill out all fields.');
      return;
    }

    const newReseller: Reseller = {
      id: `res-gen-${Date.now()}`,
      name: resName,
      areaName: resArea,
      email: resEmail,
      phone: resPhone,
      balance: resBalance,
      creditLimit: resCredit,
    };

    onAddReseller(newReseller);
    setShowResellerForm(false);
    
    // Clear fields
    setResName('');
    setResEmail('');
    setResPhone('');

    onAddAlert({
      id: `alt-res-add-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'info',
      message: `Reseller Panel: Created and authorized Reseller Panel for ${newReseller.name}.`,
      resolved: false,
      type: 'billing_suspension',
    });
  };

  const handleAddAreaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaName) {
      alert('Please enter an area name.');
      return;
    }

    const newArea: AreaName = {
      id: `area-gen-${Date.now()}`,
      name: areaName,
      type: areaType,
    };

    onAddArea(newArea);
    setShowAreaForm(false);
    setAreaName('');

    onAddAlert({
      id: `alt-area-add-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'info',
      message: `System Settings: Registered new ${areaType.toUpperCase()} Area Name: "${newArea.name}".`,
      resolved: false,
      type: 'billing_suspension',
    });
  };

  const handleAddCredits = (res: Reseller, amount: number) => {
    const updated: Reseller = {
      ...res,
      balance: res.balance + amount,
    };
    onUpdateReseller(updated);
    onAddAlert({
      id: `alt-res-credit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'info',
      message: `Reseller Credits: Approved credit refill of $${amount} for reseller panel ${res.name}.`,
      resolved: false,
      type: 'billing_suspension',
    });
  };

  return (
    <div id="resellers-and-pop-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Reseller panel accounts */}
      <div className="lg:col-span-8 bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Authorized Reseller Panels</h3>
            <p className="text-xs text-slate-500 mt-0.5">Manage credit limits, account balances, and linked coverage areas for external ISP sub-operators.</p>
          </div>
          <button
            onClick={() => setShowResellerForm(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Reseller Panel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resellers.map(res => {
            const hasOverLimit = res.balance < 0;
            return (
              <div
                key={res.id}
                className={`border rounded-xl p-4 flex flex-col justify-between ${
                  hasOverLimit ? 'border-rose-200 bg-rose-50/10' : 'border-slate-100 bg-slate-50/30'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{res.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">ID: {res.id}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded">
                      {res.areaName}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                    <div>Email: <strong className="text-slate-800">{res.email}</strong></div>
                    <div>Phone: <strong className="text-slate-800">{res.phone}</strong></div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs font-mono mb-4 shadow-sm">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Credit Limit</span>
                      <strong className="text-slate-800 font-bold">${res.creditLimit}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Current Balance</span>
                      <strong className={`font-bold ${hasOverLimit ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ${res.balance}
                      </strong>
                    </div>
                  </div>

                  {hasOverLimit && (
                    <div className="p-2 bg-rose-50 border border-rose-100 rounded text-[10px] text-rose-700 flex items-center gap-1.5 mb-4">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>Credit limit exceeded! Reseller subscriber automatic suspensions warning.</span>
                    </div>
                  )}
                </div>

                {/* Operations */}
                <div className="flex gap-2 border-t border-slate-100 pt-3.5">
                  <button
                    onClick={() => handleAddCredits(res, 200)}
                    className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold py-1.5 rounded transition-colors inline-flex items-center justify-center gap-1"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Refill +$200
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Do you want to completely de-authorize Reseller Panel for ${res.name}?`)) {
                        onDeleteReseller(res.id);
                      }
                    }}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-100 transition-colors"
                    title="Revoke reseller panel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coverage Areas details panel */}
      <div className="lg:col-span-4 bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">ISP Coverage Areas</h3>
            <span className="text-[10px] text-slate-500 mt-0.5 block">POP, Reseller, and Client Splicing Areas</span>
          </div>
          <button
            onClick={() => setShowAreaForm(true)}
            className="p-1.5 bg-slate-900 text-white rounded-lg shadow hover:bg-slate-800 transition-all"
            title="Register Area Name"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Areas list */}
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {areas.map(area => (
            <div
              key={area.id}
              className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center text-xs"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="font-semibold text-slate-800 block">{area.name}</span>
                  <span className="text-[9px] text-slate-400 font-mono">UID: {area.id}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    area.type === 'pop'
                      ? 'bg-rose-100 text-rose-700'
                      : area.type === 'reseller'
                      ? 'bg-sky-100 text-sky-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {area.type}
                </span>
                <button
                  onClick={() => onDeleteArea(area.id)}
                  className="p-1 bg-white border border-slate-200 rounded text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Reseller Modal */}
      <AnimatePresence>
        {showResellerForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm">Create Reseller Panel</h3>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Configure credit threshold and initial wallet values</span>
                </div>
                <button onClick={() => setShowResellerForm(false)} className="text-slate-400 hover:text-white">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddResellerSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Reseller Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Resellers"
                    value={resName}
                    onChange={(e) => setResName(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Coverage Area Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Reseller Area"
                    value={resArea}
                    onChange={(e) => setResArea(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Contact Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="res@isp.com"
                      value={resEmail}
                      onChange={(e) => setResEmail(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Contact Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="+1 (555) 777"
                      value={resPhone}
                      onChange={(e) => setResPhone(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Starting Credits ($)</label>
                    <input
                      type="number"
                      required
                      value={resBalance}
                      onChange={(e) => setResBalance(Number(e.target.value))}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Credit Limit ($)</label>
                    <input
                      type="number"
                      required
                      value={resCredit}
                      onChange={(e) => setResCredit(Number(e.target.value))}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowResellerForm(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow transition-colors"
                  >
                    Authorize Reseller
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Area Modal */}
      <AnimatePresence>
        {showAreaForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm">Register Coverage Area</h3>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Define Pop, Reseller, or Client Areas</span>
                </div>
                <button onClick={() => setShowAreaForm(false)} className="text-slate-400 hover:text-white">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddAreaSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Area Splicing Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Uttara Sector 11"
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Area Functional Type</label>
                  <select
                    value={areaType}
                    onChange={(e) => setAreaType(e.target.value as 'customer' | 'pop' | 'reseller')}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="customer">Customer Area Name</option>
                    <option value="pop">POP Area Name</option>
                    <option value="reseller">Reseller Area Name</option>
                  </select>
                </div>

                <div className="flex gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAreaForm(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow transition-colors"
                  >
                    Register Name
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
