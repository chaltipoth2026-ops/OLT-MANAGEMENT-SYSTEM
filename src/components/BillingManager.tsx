import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  Settings,
  X,
  Play,
  Lock,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Invoice, Subscriber } from '../types';

interface BillingManagerProps {
  invoices: Invoice[];
  subscribers: Subscriber[];
  onUpdateInvoice: (invoice: Invoice) => void;
  onUpdateSubscriber: (sub: Subscriber) => void;
  onAddAlert: (alert: any) => void;
  onGenerateInvoices: () => void;
}

export default function BillingManager({
  invoices,
  subscribers,
  onUpdateInvoice,
  onUpdateSubscriber,
  onAddAlert,
  onGenerateInvoices,
}: BillingManagerProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bkash' | 'paypal'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Automated Invoicing Config
  const [autoInvoicing, setAutoInvoicing] = useState(true);
  const [autoSuspend, setAutoSuspend] = useState(true);

  // Stats
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.amount, 0);
  const outstandingInvoices = invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue');
  const totalOutstanding = outstandingInvoices.reduce((sum, i) => sum + i.amount, 0);

  // Trigger simulated Billing Invoicing Run
  const handleRunBillingInvoicing = () => {
    onGenerateInvoices();
    onAddAlert({
      id: `alt-bill-run-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'info',
      message: 'Automated Billing Run initiated: Generated invoices for active subscriber billing cycle.',
      resolved: false,
      type: 'billing_suspension',
    });
    alert('Billing Cron Executed! Generated new invoices for current cycle subscribers.');
  };

  // Submit Simulated Payment
  const handlePayInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    setIsProcessingPayment(true);

    // Simulate standard payment gateway latency
    setTimeout(() => {
      // Find corresponding subscriber
      const sub = subscribers.find(s => s.id === selectedInvoice.subscriberId);
      
      const updatedInvoice: Invoice = {
        ...selectedInvoice,
        status: 'paid',
        paidDate: new Date().toISOString().split('T')[0],
      };

      onUpdateInvoice(updatedInvoice);

      // Real-time automatic suspension lifting if previously suspended!
      if (sub && sub.billingStatus === 'suspended') {
        const updatedSub: Subscriber = {
          ...sub,
          billingStatus: 'active',
        };
        onUpdateSubscriber(updatedSub);

        // Raise notification about automatic reactivation!
        onAddAlert({
          id: `alt-reactivate-${Date.now()}`,
          timestamp: new Date().toISOString(),
          severity: 'info',
          message: `Payment Gateway: Instant automatic reactivation for subscriber ${sub.name} (Invoice ${selectedInvoice.id} paid). OLT/Mikrotik routes enabled.`,
          resolved: false,
          type: 'billing_suspension',
        });
      }

      setIsProcessingPayment(false);
      setSelectedInvoice(null);
      
      // Clear payment credentials
      setCardNumber('');
      setCardHolder('');
      setCardExpiry('');
      setCardCvv('');
    }, 2000);
  };

  return (
    <div id="billing-management-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Financial overview bento grid */}
      <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase">Revenue Collected</span>
            <span className="text-2xl font-bold text-slate-800 mt-1 block">${totalRevenue}</span>
            <span className="text-[10px] text-green-500 font-medium flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> Month-to-date
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase">Outstanding Unpaid</span>
            <span className="text-2xl font-bold text-slate-800 mt-1 block">${totalOutstanding}</span>
            <span className="text-[10px] text-amber-500 font-medium mt-1 block">
              {outstandingInvoices.length} invoices pending
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase">Automatic Suspension</span>
            <span className="text-xs font-bold text-slate-800 mt-2 block">
              {autoSuspend ? 'ENABLED (Real-time)' : 'DISABLED'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Suspends PPPoE accounts instantly
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
            <Settings className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase">Automated Invoicing</span>
            <span className="text-xs font-bold text-slate-800 mt-2 block">
              {autoInvoicing ? 'ACTIVE (Daily Cron)' : 'MANUAL'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Billed on subscription day
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Invoices list and transaction log */}
      <div className="lg:col-span-8 bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
        <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Subscriber Invoices & Transactions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Manage customer billing accounts, verify payment history, and execute gateway reconciliations.</p>
          </div>
          <button
            onClick={handleRunBillingInvoicing}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Run Billing Cron
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Subscriber</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map(inv => {
                const isPaid = inv.status === 'paid';
                const isOverdue = inv.status === 'overdue';
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">#{inv.id}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{inv.subscriberName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">UID: {inv.subscriberId}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">${inv.amount}.00</td>
                    <td className="py-3.5 px-4 text-slate-500">{inv.issueDate}</td>
                    <td className="py-3.5 px-4 text-slate-500">{inv.dueDate}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : isOverdue
                            ? 'bg-red-100 text-red-800 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!isPaid ? (
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium text-[11px] rounded transition-all inline-flex items-center gap-1 shadow-sm"
                        >
                          <CreditCard className="w-3 h-3" />
                          Pay Gateway
                        </button>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400 font-mono">
                          Paid: {inv.paidDate}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Billing Suspension Logic Control Side card */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
            <Settings className="w-4 h-4 text-indigo-500 mr-1.5" />
            Billing & Suspension Rules
          </h3>

          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-700">Real-time Suspension Hook</span>
                <input
                  type="checkbox"
                  checked={autoSuspend}
                  onChange={(e) => setAutoSuspend(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                If checked, any invoice passing its due date will instantly trigger Mikrotik PPPoE disable commands and isolate the ONU SFP port.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-700">Automated Invoicing Cron</span>
                <input
                  type="checkbox"
                  checked={autoInvoicing}
                  onChange={(e) => setAutoInvoicing(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Automatically triggers billing run calculations daily to produce invoices matching each customer's specific registration day.
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="p-3.5 bg-indigo-50 text-indigo-800 rounded-lg text-xs leading-normal space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Real-time Suspension Lifter
                </div>
                <p className="text-[11px] text-slate-600">
                  When payments are processed via the simulator gateway, the system runs an automatic micro-script that communicates with the OLT/Mikrotik and reinstates bandwidth in under 2 seconds!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway Simulator Modal (Credit Card, bKash, PayPal selection) */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-slate-950 p-5 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-600 rounded-lg">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block uppercase">ISP Core Gateway</span>
                    <h3 className="font-bold text-sm">Secure Payment Gateway</h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 bg-slate-50 border-b border-slate-150 text-xs">
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Paying Invoice:</span>
                  <span className="font-mono font-bold text-slate-800">#{selectedInvoice.id}</span>
                </div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Subscriber name:</span>
                  <span className="font-semibold text-slate-800">{selectedInvoice.subscriberName}</span>
                </div>
                <div className="flex justify-between text-slate-700 font-bold border-t border-slate-200 mt-2 pt-2 text-sm">
                  <span>Total Due Amount:</span>
                  <span className="text-indigo-600">${selectedInvoice.amount}.00</span>
                </div>
              </div>

              {/* Secure payment method tab selection */}
              <form onSubmit={handlePayInvoiceSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-3 border rounded-lg text-xs font-bold transition-all text-center ${
                      paymentMethod === 'card'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Credit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`py-2 px-3 border rounded-lg text-xs font-bold transition-all text-center ${
                      paymentMethod === 'bkash'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Mobile Wallet
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`py-2 px-3 border rounded-lg text-xs font-bold transition-all text-center ${
                      paymentMethod === 'paypal'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    PayPal
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block">Credit Card Number</label>
                      <input
                        type="text"
                        required
                        placeholder="4000 1234 5678 9010"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Expiry Date</label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">CVV/CVC</label>
                        <input
                          type="password"
                          required
                          placeholder="•••"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'bkash' && (
                  <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg text-xs space-y-2.5">
                    <span className="font-bold text-pink-700 block">Simulate MFS Wallet Authentication</span>
                    <input
                      type="text"
                      placeholder="e.g. 01712345678"
                      className="w-full text-xs p-2.5 border border-pink-200 rounded-lg focus:ring-1 focus:ring-pink-500 focus:outline-none font-mono"
                    />
                    <p className="text-[10px] text-pink-600 leading-normal">
                      A secured OTP code will be simulated on your wallet provider endpoint to process instant subscriber reactivation.
                    </p>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg text-xs space-y-2.5">
                    <span className="font-bold text-sky-700 block">PayPal Sandbox Login</span>
                    <input
                      type="email"
                      placeholder="e.g. sand@paypal.com"
                      className="w-full text-xs p-2.5 border border-sky-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none font-mono"
                    />
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono justify-center pt-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>256-BIT SSL ENCRYPTED GATEWAY CHANNEL</span>
                </div>

                <div className="flex gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(null)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Authorizing...
                      </>
                    ) : (
                      <>
                        Confirm Pay
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
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
