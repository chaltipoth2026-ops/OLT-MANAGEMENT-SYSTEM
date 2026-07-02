import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  Database,
  Grid,
  Map,
  LogOut,
  Users,
  CreditCard,
  Cpu,
  ShieldAlert,
  Server,
  TrendingUp,
  Clock,
  Shield,
  FileText,
  Play,
  ChevronDown,
  Settings,
  CheckCircle,
  Radio,
  PlusCircle,
  Sliders,
  SlidersHorizontal,
  FolderPlus,
  Compass,
  FileSpreadsheet,
  ToggleLeft,
  Monitor,
  Smartphone,
  Wifi,
  Signal,
  Menu,
  X
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend
} from 'recharts';

// Subcomponents
import LoginScreen from './components/LoginScreen';
import NetworkTopology from './components/NetworkTopology';
import SubscriberList from './components/SubscriberList';
import BillingManager from './components/BillingManager';
import EquipmentAdmin from './components/EquipmentAdmin';
import ResellersPOP from './components/ResellersPOP';

// Data store & Types
import { getStoredData, saveStoredData } from './data/mockData';
import { Onu, Subscriber, Olt, Mikrotik, Invoice, Reseller, AreaName, SystemAlert } from './types';

// Graph data for live core bandwidth
const initialBandwidthData = [
  { time: '00:00', download: 1.2, upload: 0.5 },
  { time: '03:00', download: 0.8, upload: 0.3 },
  { time: '06:00', download: 1.5, upload: 0.6 },
  { time: '09:00', download: 2.8, upload: 1.2 },
  { time: '12:00', download: 3.4, upload: 1.5 },
  { time: '15:00', download: 3.1, upload: 1.4 },
  { time: '18:00', download: 4.8, upload: 2.1 }, // Peak hours
  { time: '21:00', download: 5.2, upload: 2.3 }, // Peak hours
  { time: '23:00', download: 2.5, upload: 1.1 },
];

export default function App() {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'android'>('desktop');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isp_auth_token') === 'active_noc';
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'topology' | 'subscribers' | 'billing' | 'equipment' | 'resellers'>('dashboard');

  // Interactive drop-down states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Core system databases
  const [areas, setAreas] = useState<AreaName[]>([]);
  const [mikrotiks, setMikrotiks] = useState<Mikrotik[]>([]);
  const [olts, setOlts] = useState<Olt[]>([]);
  const [onus, setOnus] = useState<Onu[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

  // Bandwidth real-time stats
  const [bandwidthData, setBandwidthData] = useState(initialBandwidthData);

  // Settings Panel State
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [snmpCommunity, setSnmpCommunity] = useState<string>('public');
  const [syslogServer, setSyslogServer] = useState<string>('10.0.0.45');
  const [backupInterval, setBackupInterval] = useState<string>('Daily');

  // Control Props states to pass deep into sub-components
  const [subscriberViewMode, setSubscriberViewMode] = useState<'subscribers' | 'permissions' | 'groups' | 'logs' | 'tunnels'>('subscribers');
  const [subscriberShowForm, setSubscriberShowForm] = useState<boolean>(false);
  const [subscriberFilterStatus, setSubscriberFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');

  const [equipmentSection, setEquipmentSection] = useState<'olt' | 'mikrotik' | 'pon'>('olt');
  const [showOltFormState, setShowOltFormState] = useState<boolean>(false);
  const [showMtFormState, setShowMtFormState] = useState<boolean>(false);
  const [equipmentFilterStatus, setEquipmentFilterStatus] = useState<'all' | 'online' | 'offline'>('all');

  // Initialize data from localstorage
  useEffect(() => {
    // Check if we need to force wipe the older cached devices as requested by the user
    const hasWiped = localStorage.getItem('isp_device_wipe_v2');
    if (!hasWiped) {
      localStorage.removeItem('isp_mikrotiks');
      localStorage.removeItem('isp_olts');
      localStorage.removeItem('isp_onus');
      localStorage.removeItem('isp_subscribers');
      localStorage.removeItem('isp_invoices');
      localStorage.removeItem('isp_alerts');
      localStorage.setItem('isp_device_wipe_v2', 'true');
    }

    const data = getStoredData();
    setAreas(data.areas);
    setMikrotiks(data.mikrotiks);
    setOlts(data.olts);
    setOnus(data.onus);
    setSubscribers(data.subscribers);
    setInvoices(data.invoices);
    setResellers(data.resellers);
    setAlerts(data.alerts);
  }, []);

  // Save changes to persistent storage when databases change
  const syncStorage = (updates: {
    areas?: AreaName[];
    mikrotiks?: Mikrotik[];
    olts?: Olt[];
    onus?: Onu[];
    subscribers?: Subscriber[];
    invoices?: Invoice[];
    resellers?: Reseller[];
    alerts?: SystemAlert[];
  }) => {
    saveStoredData(updates);
  };

  // Login handler
  const handleLogin = () => {
    localStorage.setItem('isp_auth_token', 'active_noc');
    setIsAuthenticated(true);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('isp_auth_token');
    setIsAuthenticated(false);
  };

  // Live simulation tick interval (fluctuates device load and advances uptime)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      // 1. Advance OLT & Mikrotik uptimes and fluctuate CPU loads
      setOlts(prev => {
        const next = prev.map(olt => ({
          ...olt,
          uptimeSeconds: olt.uptimeSeconds + 5,
          cpuUsage: Math.min(100, Math.max(2, olt.cpuUsage + Math.floor(Math.random() * 7 - 3))),
          memoryUsage: Math.min(100, Math.max(10, olt.memoryUsage + Math.floor(Math.random() * 3 - 1))),
        }));
        syncStorage({ olts: next });
        return next;
      });

      setMikrotiks(prev => {
        const next = prev.map(mt => ({
          ...mt,
          uptimeSeconds: mt.uptimeSeconds + 5,
          cpuUsage: Math.min(100, Math.max(5, mt.cpuUsage + Math.floor(Math.random() * 9 - 4))),
          memoryUsage: Math.min(100, Math.max(10, mt.memoryUsage + Math.floor(Math.random() * 3 - 1))),
        }));
        syncStorage({ mikrotiks: next });
        return next;
      });

      // Fluctuate core bandwidth upload/download speeds slightly
      setBandwidthData(prev => {
        return prev.map((item, index) => {
          if (index === prev.length - 1) {
            const devD = Math.random() * 0.4 - 0.2;
            const devU = Math.random() * 0.2 - 0.1;
            return {
              ...item,
              download: Math.max(0.1, Math.round((item.download + devD) * 10) / 10),
              upload: Math.max(0.1, Math.round((item.upload + devU) * 10) / 10),
            };
          }
          return item;
        });
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Operations: Subscribers
  const handleAddSubscriber = (sub: Subscriber) => {
    const updated = [...subscribers, sub];
    setSubscribers(updated);
    syncStorage({ subscribers: updated });

    // Instantly provision corresponding ONU too!
    const selectedOlt = olts.find(o => o.id === sub.oltId);
    const modelStr = selectedOlt?.model?.toLowerCase() || '';
    const isBdcom = modelStr.includes('bdcom');
    const isEpon = modelStr.includes('epon');
    const isHuawei = modelStr.includes('huawei');

    let onuBrand = 'ZTE';
    let onuModel = 'F660 V8.0';
    let serialPrefix = 'ZTEGC';

    if (isBdcom) {
      onuBrand = 'BDCOM';
      onuModel = isEpon ? 'P1501C1 EPON ONU' : 'GP1704-2G GPON ONU';
      serialPrefix = isEpon ? 'BDCME' : 'BDCMG';
    } else if (isHuawei) {
      onuBrand = 'Huawei';
      onuModel = 'HG8546M GPON/EPON';
      serialPrefix = 'HWTC';
    }

    const associatedOnu: Onu = {
      id: sub.onuId,
      serialNumber: `${serialPrefix}${Math.floor(Math.random() * 900000 + 100000)}`,
      brand: onuBrand,
      model: onuModel,
      rxPower: Math.round((-17 - Math.random() * 6) * 10) / 10,
      txPower: 2.1,
      status: 'online',
      distanceKm: Math.round((Math.random() * 4 + 1) * 100) / 100,
      laserLevel: 'normal',
      oltId: sub.oltId,
      ponPort: sub.oltPort,
    };
    const updatedOnus = [...onus, associatedOnu];
    setOnus(updatedOnus);
    syncStorage({ onus: updatedOnus });

    // Trigger alert
    handleAddAlert({
      id: `alt-provision-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'info',
      message: `System: Successfully provisioned and mapped subscriber ${sub.name} on optical SFP PON Port ${sub.oltPort}.`,
      resolved: false,
      type: 'laser_high',
    });
  };

  const handleUpdateSubscriber = (sub: Subscriber) => {
    const updated = subscribers.map(s => s.id === sub.id ? sub : s);
    setSubscribers(updated);
    syncStorage({ subscribers: updated });
  };

  const handleDeleteSubscriber = (id: string) => {
    const updated = subscribers.filter(s => s.id !== id);
    setSubscribers(updated);
    syncStorage({ subscribers: updated });
  };

  // Operations: Invoices / Billing
  const handleUpdateInvoice = (inv: Invoice) => {
    const updated = invoices.map(i => i.id === inv.id ? inv : i);
    setInvoices(updated);
    syncStorage({ invoices: updated });
  };

  // Generate automated invoicing run for non-billed cycles
  const handleGenerateInvoices = () => {
    const newInvoices: Invoice[] = subscribers.map(sub => ({
      id: `inv-${Math.floor(Math.random() * 90000 + 10000)}`,
      subscriberId: sub.id,
      subscriberName: sub.name,
      amount: sub.monthlyFee,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'unpaid',
    }));

    const updated = [...invoices, ...newInvoices];
    setInvoices(updated);
    syncStorage({ invoices: updated });
  };

  // Operations: OLTs / Router
  const handleAddOlt = (olt: Olt) => {
    const updated = [...olts, olt];
    setOlts(updated);
    syncStorage({ olts: updated });
  };

  const handleUpdateOlt = (olt: Olt) => {
    const updated = olts.map(o => o.id === olt.id ? olt : o);
    setOlts(updated);
    syncStorage({ olts: updated });
  };

  const handleDeleteOlt = (id: string) => {
    const updated = olts.filter(o => o.id !== id);
    setOlts(updated);
    syncStorage({ olts: updated });
  };

  const handleAddMikrotik = (mt: Mikrotik) => {
    const updated = [...mikrotiks, mt];
    setMikrotiks(updated);
    
    // Auto-link all existing subscribers to this newly added Mikrotik so they connect to its PPPoE tunnel sessions
    const updatedSubscribers = subscribers.map(sub => ({
      ...sub,
      mikrotikId: mt.id
    }));
    setSubscribers(updatedSubscribers);

    syncStorage({ 
      mikrotiks: updated,
      subscribers: updatedSubscribers
    });
  };

  const handleUpdateMikrotik = (mt: Mikrotik) => {
    const updated = mikrotiks.map(m => m.id === mt.id ? mt : m);
    setMikrotiks(updated);
    syncStorage({ mikrotiks: updated });
  };

  const handleDeleteMikrotik = (id: string) => {
    const updated = mikrotiks.filter(m => m.id !== id);
    setMikrotiks(updated);
    syncStorage({ mikrotiks: updated });
  };

  // Operations: Resellers & Areas
  const handleAddReseller = (res: Reseller) => {
    const updated = [...resellers, res];
    setResellers(updated);
    syncStorage({ resellers: updated });
  };

  const handleUpdateReseller = (res: Reseller) => {
    const updated = resellers.map(r => r.id === res.id ? res : r);
    setResellers(updated);
    syncStorage({ resellers: updated });
  };

  const handleDeleteReseller = (id: string) => {
    const updated = resellers.filter(r => r.id !== id);
    setResellers(updated);
    syncStorage({ resellers: updated });
  };

  const handleAddArea = (area: AreaName) => {
    const updated = [...areas, area];
    setAreas(updated);
    syncStorage({ areas: updated });
  };

  const handleDeleteArea = (id: string) => {
    const updated = areas.filter(a => a.id !== id);
    setAreas(updated);
    syncStorage({ areas: updated });
  };

  // Alerts Database Splicing
  const handleAddAlert = (alert: SystemAlert) => {
    const updated = [alert, ...alerts];
    setAlerts(updated);
    syncStorage({ alerts: updated });
  };

  const handleResolveAlert = (id: string) => {
    const updated = alerts.map(a => a.id === id ? { ...a, resolved: true } : a);
    setAlerts(updated);
    syncStorage({ alerts: updated });
  };

  // Trigger simulated Fiber Cut alert manually
  const handleTriggerSimulatedCut = () => {
    const activeCut = alerts.find(a => a.type === 'fiber_cut' && !a.resolved);
    if (activeCut) {
      alert('A Core Fiber Cut is already active on the OTR system.');
      return;
    }

    const otdrDistance = Math.round((Math.random() * 3 + 2) * 100) / 100; // between 2km and 5km
    const cutAlert: SystemAlert = {
      id: `alt-fiber-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'critical',
      message: `FIBER CUT DETECTED: Absolute signal attenuation on Core Loop. OTDR pulse analysis estimates cut at ${otdrDistance} Km.`,
      resolved: false,
      type: 'fiber_cut',
      distanceKm: otdrDistance,
    };

    handleAddAlert(cutAlert);

    // Set ONU HWTC11223344 (and other OLT2 nodes) to offline due to the cut
    setOnus(prev => {
      const next = prev.map(o => o.oltId === 'olt-2' ? { ...o, status: 'offline' as const, rxPower: -40 } : o);
      syncStorage({ onus: next });
      return next;
    });

    alert(`⚠️ Simulated Fiber Cut dispatched! OTDR pinpointed rupture at ${otdrDistance} Km. Go to network diagnostics to trace and repair.`);
  };

  // Dropdown Handlers
  const handleDropdownToggle = (menuName: string) => {
    if (openDropdown === menuName) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(menuName);
    }
  };

  // Click actions for OLT Add drop-down
  const handleCreateOltClick = () => {
    setActiveTab('equipment');
    setEquipmentSection('olt');
    setShowOltFormState(true);
    setShowMtFormState(false);
    setOpenDropdown(null);
  };

  const handleOltListClick = () => {
    setActiveTab('equipment');
    setEquipmentSection('olt');
    setShowOltFormState(false);
    setShowMtFormState(false);
    setOpenDropdown(null);
  };

  const handleOltPonClick = () => {
    setActiveTab('equipment');
    setEquipmentSection('pon');
    setShowOltFormState(false);
    setShowMtFormState(false);
    setOpenDropdown(null);
  };

  const handleOltDeleteClick = () => {
    setActiveTab('equipment');
    setEquipmentSection('olt');
    setShowOltFormState(false);
    setShowMtFormState(false);
    setOpenDropdown(null);
    alert('Please select any GPON OLT Core Node card below, then click the red trash bin to de-provision.');
  };

  // Click actions for Mikrotik Add drop-down
  const handleMikrotikListClick = () => {
    setActiveTab('equipment');
    setEquipmentSection('mikrotik');
    setShowOltFormState(false);
    setShowMtFormState(false);
    setOpenDropdown(null);
  };

  const handleMikrotikConfigureClick = () => {
    setActiveTab('equipment');
    setEquipmentSection('mikrotik');
    setShowOltFormState(false);
    setShowMtFormState(false);
    setOpenDropdown(null);
    alert('Click "Warm Boot" or "Load Stress" on any Mikrotik router below to dispatch SNMP RouterOS commands.');
  };

  const handleActiveMikrotikClick = () => {
    setActiveTab('equipment');
    setEquipmentSection('mikrotik');
    setEquipmentFilterStatus('online');
    setShowOltFormState(false);
    setShowMtFormState(false);
    setOpenDropdown(null);
  };

  const handleDeactiveMikrotikClick = () => {
    setActiveTab('equipment');
    setEquipmentSection('mikrotik');
    setEquipmentFilterStatus('offline');
    setShowOltFormState(false);
    setShowMtFormState(false);
    setOpenDropdown(null);
  };

  // Click actions for Active Connection drop-down
  const handleUserConnectionClick = () => {
    setActiveTab('subscribers');
    setSubscriberViewMode('tunnels');
    setSubscriberShowForm(false);
    setOpenDropdown(null);
  };

  const handleUserListConnectionClick = () => {
    setActiveTab('subscribers');
    setSubscriberViewMode('subscribers');
    setSubscriberFilterStatus('all');
    setSubscriberShowForm(false);
    setOpenDropdown(null);
  };

  const handleCreateUserClick = () => {
    setActiveTab('subscribers');
    setSubscriberViewMode('subscribers');
    setSubscriberShowForm(true);
    setOpenDropdown(null);
  };

  const handleDeactivateConnectionClick = () => {
    setActiveTab('subscribers');
    setSubscriberViewMode('subscribers');
    setSubscriberFilterStatus('suspended');
    setSubscriberShowForm(false);
    setOpenDropdown(null);
  };

  // Click actions for User Management drop-down
  const handleUserManagementUserClick = () => {
    setActiveTab('subscribers');
    setSubscriberViewMode('subscribers');
    setSubscriberShowForm(false);
    setOpenDropdown(null);
  };

  const handleUserManagementCreateClick = () => {
    setActiveTab('subscribers');
    setSubscriberViewMode('subscribers');
    setSubscriberShowForm(true);
    setOpenDropdown(null);
  };

  const handleUserPermissionClick = () => {
    setActiveTab('subscribers');
    setSubscriberViewMode('permissions');
    setSubscriberShowForm(false);
    setOpenDropdown(null);
  };

  const handleUserGroupClick = () => {
    setActiveTab('subscribers');
    setSubscriberViewMode('groups');
    setSubscriberShowForm(false);
    setOpenDropdown(null);
  };

  const handleUserActiveClick = () => {
    setActiveTab('subscribers');
    setSubscriberViewMode('tunnels');
    setSubscriberShowForm(false);
    setOpenDropdown(null);
  };

  const handleUserLogClick = () => {
    setActiveTab('subscribers');
    setSubscriberViewMode('logs');
    setSubscriberShowForm(false);
    setOpenDropdown(null);
  };

  // Click actions for Settings
  const handleSettingClick = () => {
    setShowSettingsModal(true);
    setOpenDropdown(null);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLogin} />;
  }

  // Dashboard calculations
  const totalSubscribers = subscribers.length;
  const activeSubscribers = subscribers.filter(s => s.billingStatus === 'active').length;
  const suspendedSubscribers = subscribers.filter(s => s.billingStatus === 'suspended').length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.resolved);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* PERSISTENT SYSTEM PREVIEW CONTROLLER */}
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800 py-2.5 px-4 sticky top-0 z-50 text-xs font-mono shadow-md select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="font-bold text-white uppercase tracking-wider">ISP Preview Terminal</span>
            <span className="text-slate-400 hidden sm:inline">| Switch desktop console & Android simulated system</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => { setDeviceMode('desktop'); setMobileMenuOpen(false); }}
              className={`px-3 py-1 rounded transition-all flex items-center gap-1.5 font-bold cursor-pointer text-[10px] uppercase ${
                deviceMode === 'desktop'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop Console
            </button>
            <button
              onClick={() => setDeviceMode('android')}
              className={`px-3 py-1 rounded transition-all flex items-center gap-1.5 font-bold cursor-pointer text-[10px] uppercase ${
                deviceMode === 'android'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Android Mobile
            </button>
          </div>
        </div>
      </div>

      {deviceMode === 'android' ? (
        /* ==================== SIMULATED ANDROID SYSTEM VIEW ==================== */
        <div className="flex-1 bg-slate-950 flex items-center justify-center py-8 px-4 select-none overflow-hidden relative min-h-[900px]">
          {/* Subtle ambient lighting glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Smartphone Physical Mockup Frame */}
          <div className="relative mx-auto border-[14px] border-slate-900 rounded-[50px] w-full max-w-[410px] h-[860px] bg-slate-50 overflow-hidden shadow-2xl flex flex-col border-b-[16px]">
            
            {/* Front Camera Notch / Island */}
            <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-slate-900 rounded-full z-50 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-slate-950 rounded-full ml-12 border border-slate-800" />
            </div>

            {/* Simulated Android Top Status Bar */}
            <div className="bg-slate-900 text-slate-300 text-[10px] px-6 pt-7 pb-2 flex justify-between items-center font-mono z-40 select-none border-b border-slate-800">
              <div className="font-bold flex items-center gap-1 text-white">
                <span>11:17</span>
                <span className="text-[7px] bg-indigo-500 px-1 rounded font-extrabold uppercase text-[7px]">5G</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-white" />
                <Signal className="w-3.5 h-3.5 text-emerald-400" />
                <div className="flex items-center gap-0.5 border border-slate-500 rounded px-1 py-0.2 text-[8px]">
                  <span>98%</span>
                  <div className="w-1.5 h-1 bg-green-500 rounded-xs" />
                </div>
              </div>
            </div>

            {/* Simulated Compact Android App Header */}
            <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center border-b border-slate-800/80 shadow-md z-30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition-colors cursor-pointer"
                  title="Menu"
                >
                  {mobileMenuOpen ? <X className="w-4 h-4 text-rose-400" /> : <Menu className="w-4 h-4" />}
                </button>
                <div>
                  <h1 className="text-xs font-black tracking-tight uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                    NOC Mobile
                  </h1>
                  <span className="text-[8px] text-slate-400 block font-mono">Terminal v4.12.0</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Active alert indicator */}
                {criticalAlerts.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded text-[8px] font-bold animate-pulse">
                    ALARM
                  </span>
                )}
                {/* Setting gear */}
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* SIMULATED SLIDE-DOWN DRAWER MENU OVERLAY */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -200 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -200 }}
                  className="absolute inset-x-0 top-[110px] bg-slate-950 text-slate-100 z-50 shadow-2xl border-b border-slate-800 p-5 font-sans overflow-y-auto max-h-[580px] scrollbar-thin flex flex-col gap-4 text-xs"
                >
                  <div className="border-b border-slate-800 pb-2.5">
                    <span className="text-[9px] text-indigo-400 font-bold tracking-widest uppercase">Select Terminal Section</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                      className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                        activeTab === 'dashboard' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <Grid className="w-4 h-4 text-indigo-400" />
                      <div>
                        <span className="font-bold text-[10px] block">Dashboard</span>
                        <span className="text-[8px] text-slate-400 block">NOC metrics overview</span>
                      </div>
                    </button>

                    <button
                      onClick={() => { setActiveTab('topology'); setMobileMenuOpen(false); }}
                      className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                        activeTab === 'topology' ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <Map className="w-4 h-4 text-indigo-400" />
                      <div>
                        <span className="font-bold text-[10px] block">Topology</span>
                        <span className="text-[8px] text-slate-400 block">OTDR optical traces</span>
                      </div>
                    </button>
                  </div>

                  {/* OLT System Headings */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">OLT Hardware Operations</span>
                    <div className="grid grid-cols-1 gap-1">
                      <button
                        onClick={() => { setActiveTab('equipment'); setEquipmentSection('olt'); setShowOltFormState(false); setMobileMenuOpen(false); }}
                        className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-left flex items-center justify-between hover:border-slate-700"
                      >
                        <span className="font-medium text-[10px]">GPON OLT Chassis List</span>
                        <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                      </button>
                      <button
                        onClick={() => { setActiveTab('equipment'); setEquipmentSection('olt'); setShowOltFormState(true); setMobileMenuOpen(false); }}
                        className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-left flex items-center justify-between hover:border-slate-700"
                      >
                        <span className="font-medium text-[10px] text-indigo-300">+ Deploy New GPON OLT</span>
                        <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                      </button>
                      <button
                        onClick={() => { setActiveTab('equipment'); setEquipmentSection('pon'); setMobileMenuOpen(false); }}
                        className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-left flex items-center justify-between hover:border-slate-700"
                      >
                        <span className="font-medium text-[10px]">OLT SFP Laser Diagnostics</span>
                        <Radio className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                    </div>
                  </div>

                  {/* Mikrotik system headings */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">MikroTik Router Core</span>
                    <div className="grid grid-cols-1 gap-1">
                      <button
                        onClick={() => { setActiveTab('equipment'); setEquipmentSection('mikrotik'); setShowMtFormState(false); setMobileMenuOpen(false); }}
                        className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-left flex items-center justify-between hover:border-slate-700"
                      >
                        <span className="font-medium text-[10px]">Core Aggregator Routers</span>
                        <Server className="w-3.5 h-3.5 text-indigo-400" />
                      </button>
                      <button
                        onClick={() => { setActiveTab('equipment'); setEquipmentSection('mikrotik'); setShowMtFormState(true); setMobileMenuOpen(false); }}
                        className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-left flex items-center justify-between hover:border-slate-700"
                      >
                        <span className="font-medium text-[10px] text-indigo-300">+ Deploy Mikrotik CCR</span>
                        <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                      </button>
                    </div>
                  </div>

                  {/* Users / Subscribers heading */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Subscriber Management</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => { setActiveTab('subscribers'); setSubscriberViewMode('subscribers'); setMobileMenuOpen(false); }}
                        className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-left hover:border-slate-700"
                      >
                        <Users className="w-3.5 h-3.5 text-indigo-400 mb-1" />
                        <span className="font-bold text-[9px] block">Users Base</span>
                      </button>
                      <button
                        onClick={() => { setActiveTab('subscribers'); setSubscriberViewMode('tunnels'); setMobileMenuOpen(false); }}
                        className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-left hover:border-slate-700"
                      >
                        <Radio className="w-3.5 h-3.5 text-emerald-400 mb-1" />
                        <span className="font-bold text-[9px] block">PPPoE Tunnels</span>
                      </button>
                      <button
                        onClick={() => { setActiveTab('subscribers'); setSubscriberViewMode('permissions'); setMobileMenuOpen(false); }}
                        className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-left hover:border-slate-700"
                      >
                        <Shield className="w-3.5 h-3.5 text-indigo-400 mb-1" />
                        <span className="font-bold text-[9px] block">Permissions</span>
                      </button>
                      <button
                        onClick={() => { setActiveTab('subscribers'); setSubscriberViewMode('groups'); setMobileMenuOpen(false); }}
                        className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-left hover:border-slate-700"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400 mb-1" />
                        <span className="font-bold text-[9px] block">Groups</span>
                      </button>
                    </div>
                  </div>

                  {/* Billing, Resellers, Settings, Logout */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">NOC Supervisor Commands</span>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <button
                        onClick={() => { setActiveTab('billing'); setMobileMenuOpen(false); }}
                        className="px-3 py-2 bg-indigo-950/40 border border-indigo-900 text-indigo-200 rounded-lg text-left flex items-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        ISP Billing
                      </button>
                      <button
                        onClick={() => { setActiveTab('resellers'); setMobileMenuOpen(false); }}
                        className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-left flex items-center gap-1.5"
                      >
                        <Shield className="w-3.5 h-3.5 text-indigo-400" />
                        Resellers
                      </button>
                      <button
                        onClick={() => { handleTriggerSimulatedCut(); setMobileMenuOpen(false); }}
                        className="px-3 py-2 bg-rose-950/30 border border-rose-900/60 text-rose-300 rounded-lg text-left flex items-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        Trigger Alert
                      </button>
                      <button
                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                        className="px-3 py-2 bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300 rounded-lg text-left flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Disconnect
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Simulated Smartphone Screen Core Scrollable Area */}
            <div className="flex-1 overflow-y-auto px-3.5 py-4 scrollbar-thin bg-slate-50 text-slate-800">
              <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && (
                  <motion.div
                    key="mobile-dashboard"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Compact Alert Panel */}
                    {criticalAlerts.length > 0 && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-1.5">
                        <span className="font-bold block text-[10px] tracking-wide uppercase text-rose-700">FIBER CUT DETECTED (OTDR)</span>
                        <p className="text-[10px] leading-relaxed text-rose-800">{criticalAlerts[0].message}</p>
                        <button
                          onClick={() => setActiveTab('topology')}
                          className="w-full text-center py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[9px] rounded uppercase"
                        >
                          Locate Map Cut
                        </button>
                      </div>
                    )}

                    {/* Bento Grid Stats - 2-column layout */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Subs Pool</span>
                        <span className="text-xl font-bold text-slate-800 mt-0.5 block">{totalSubscribers}</span>
                        <span className="text-[8px] text-slate-500 block">Active slots</span>
                      </div>
                      <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Active</span>
                        <span className="text-xl font-bold text-emerald-600 mt-0.5 block">{activeSubscribers}</span>
                        <span className="text-[8px] text-slate-500 block">Tunnels online</span>
                      </div>
                      <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Suspended</span>
                        <span className="text-xl font-bold text-rose-500 mt-0.5 block">{suspendedSubscribers}</span>
                        <span className="text-[8px] text-slate-500 block">Non-payment</span>
                      </div>
                      <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">OLTs Count</span>
                        <span className="text-xl font-bold text-indigo-600 mt-0.5 block">{olts.length}</span>
                        <span className="text-[8px] text-slate-500 block">Active Chassis</span>
                      </div>
                    </div>

                    {/* Bandwidth chart scaled for mobile */}
                    <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs space-y-3">
                      <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wide block">Real-time Bandwidth (Gbps)</span>
                      <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={bandwidthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="time" stroke="#94a3b8" fontSize={8} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={8} tickLine={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="download" stroke="#4f46e5" strokeWidth={1.5} fill="#4f46e5" fillOpacity={0.1} name="Download" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Quick Telemetry Indicators */}
                    <div className="bg-slate-900 text-white rounded-xl p-3 shadow-sm text-[10px] space-y-2 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                        <span className="font-bold text-slate-300">SNMP TELEMETRY STREAM</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[9px] text-slate-400">
                        <div>
                          <span>Aggregate Rate:</span>
                          <span className="text-indigo-400 block font-bold">{subscribers.length * 35} Mbps</span>
                        </div>
                        <div>
                          <span>OTDR Status:</span>
                          <span className="text-emerald-400 block font-bold">Trace ready</span>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                )}

                {activeTab === 'topology' && (
                  <motion.div key="mobile-topology" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <NetworkTopology
                      onus={onus}
                      olts={olts}
                      mikrotiks={mikrotiks}
                      alerts={alerts}
                      onUpdateOnu={(onu) => setOnus(prev => {
                        const next = prev.map(o => o.id === onu.id || o.serialNumber === onu.serialNumber ? onu : o);
                        syncStorage({ onus: next });
                        return next;
                      })}
                      onAddAlert={handleAddAlert}
                      onResolveAlert={handleResolveAlert}
                    />
                  </motion.div>
                )}

                {activeTab === 'subscribers' && (
                  <motion.div key="mobile-subscribers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <SubscriberList
                      subscribers={subscribers}
                      onus={onus}
                      olts={olts}
                      mikrotiks={mikrotiks}
                      onAddSubscriber={handleAddSubscriber}
                      onUpdateSubscriber={handleUpdateSubscriber}
                      onDeleteSubscriber={handleDeleteSubscriber}
                      initialViewMode={subscriberViewMode}
                      initialShowForm={subscriberShowForm}
                      initialFilterStatus={subscriberFilterStatus}
                      onCloseForm={() => setSubscriberShowForm(false)}
                    />
                  </motion.div>
                )}

                {activeTab === 'billing' && (
                  <motion.div key="mobile-billing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <BillingManager
                      invoices={invoices}
                      subscribers={subscribers}
                      onUpdateInvoice={handleUpdateInvoice}
                      onUpdateSubscriber={handleUpdateSubscriber}
                      onAddAlert={handleAddAlert}
                      onGenerateInvoices={handleGenerateInvoices}
                    />
                  </motion.div>
                )}

                {activeTab === 'equipment' && (
                  <motion.div key="mobile-equipment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <EquipmentAdmin
                      olts={olts}
                      mikrotiks={mikrotiks}
                      onus={onus}
                      onAddOlt={handleAddOlt}
                      onAddMikrotik={handleAddMikrotik}
                      onDeleteOlt={handleDeleteOlt}
                      onDeleteMikrotik={handleDeleteMikrotik}
                      onUpdateOlt={handleUpdateOlt}
                      onUpdateMikrotik={handleUpdateMikrotik}
                      onAddAlert={handleAddAlert}
                      onUpdateOnus={(next) => {
                        setOnus(next);
                        syncStorage({ onus: next });
                      }}
                      initialSection={equipmentSection}
                      initialShowOltForm={showOltFormState}
                      initialShowMtForm={showMtFormState}
                      initialFilterStatus={equipmentFilterStatus}
                    />
                  </motion.div>
                )}

                {activeTab === 'resellers' && (
                  <motion.div key="mobile-resellers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ResellersPOP
                      resellers={resellers}
                      areas={areas}
                      onAddReseller={handleAddReseller}
                      onAddArea={handleAddArea}
                      onDeleteReseller={handleDeleteReseller}
                      onDeleteArea={handleDeleteArea}
                      onUpdateReseller={handleUpdateReseller}
                      onAddAlert={handleAddAlert}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Simulated Android virtual Home pill bar */}
            <div className="bg-slate-900 border-t border-slate-800 py-3.5 flex justify-center items-center z-40 select-none">
              <div className="w-32 h-1 bg-slate-500 hover:bg-white rounded-full transition-colors cursor-pointer" onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} />
            </div>

          </div>
        </div>
      ) : (
        /* ==================== STANDARD DESKTOP VIEW ==================== */
        <>
          {/* NOC Header */}
          <header className="bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
              <Activity className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight">ISP Operator Console</h1>
                <span className="px-2 py-0.5 bg-indigo-500/15 text-indigo-300 rounded text-[10px] font-mono font-bold uppercase tracking-wider border border-indigo-500/20">
                  NOC Core
                </span>
              </div>
              <p className="text-xs text-slate-400">Integrated subscriber manager, fiber OTDR, and billing supervisor</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick manual simulation trigger */}
            <button
              onClick={handleTriggerSimulatedCut}
              className="px-3 py-1.5 bg-rose-950/40 border border-rose-800 text-rose-300 hover:bg-rose-950/60 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Manually simulate a core fiber rupture to test the system"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              Simulate Fiber Cut
            </button>

            <div className="flex items-center gap-2.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/50 text-xs font-mono">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium text-slate-300">Operator: admin</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 bg-slate-800 hover:bg-rose-900 hover:text-white text-slate-400 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Logout Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Primary Navigation Tabs & Mega-Dropdown Menu Systems */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1 py-3 overflow-x-auto scrollbar-none items-center">
              
              <button
                onClick={() => { setActiveTab('dashboard'); setOpenDropdown(null); }}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-50 text-indigo-700 font-extrabold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Grid className="w-4 h-4" />
                Dashboard Overview
              </button>

              <button
                onClick={() => { setActiveTab('topology'); setOpenDropdown(null); }}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'topology'
                    ? 'bg-indigo-50 text-indigo-700 font-extrabold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Map className="w-4 h-4" />
                Network Topology (OTDR)
              </button>

              {/* DROPDOWN 1: OLT Add */}
              <div className="relative shrink-0">
                <button
                  onClick={() => handleDropdownToggle('olt')}
                  className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                    activeTab === 'equipment' && (equipmentSection === 'olt' || equipmentSection === 'pon')
                      ? 'bg-indigo-50 text-indigo-700 font-extrabold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  OLT Add
                  <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'olt' ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {openDropdown === 'olt' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 text-xs font-semibold"
                    >
                      <button
                        onClick={handleCreateOltClick}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-indigo-500" />
                        Create OLT
                      </button>
                      <button
                        onClick={handleOltListClick}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                        OLT List
                      </button>
                      <button
                        onClick={handleOltPonClick}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Radio className="w-3.5 h-3.5 text-emerald-500" />
                        OLT PON
                      </button>
                      <button
                        onClick={handleOltDeleteClick}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer border-t"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        OLT Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* DROPDOWN 2: MikroTik Add */}
              <div className="relative shrink-0">
                <button
                  onClick={() => handleDropdownToggle('mikrotik')}
                  className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                    activeTab === 'equipment' && equipmentSection === 'mikrotik'
                      ? 'bg-indigo-50 text-indigo-700 font-extrabold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Server className="w-4 h-4" />
                  MikroTik Add
                  <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'mikrotik' ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {openDropdown === 'mikrotik' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 text-xs font-semibold"
                    >
                      <button
                        onClick={handleMikrotikListClick}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                        MikroTik List
                      </button>
                      <button
                        onClick={handleMikrotikConfigureClick}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-indigo-500" />
                        MikroTik Configure
                      </button>
                      <button
                        onClick={handleActiveMikrotikClick}
                        className="w-full text-left px-4 py-2 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center gap-1.5 cursor-pointer border-t"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        Active MikroTik
                      </button>
                      <button
                        onClick={handleDeactiveMikrotikClick}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        Deactivate MikroTik
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* DROPDOWN 3: Active Connection */}
              <div className="relative shrink-0">
                <button
                  onClick={() => handleDropdownToggle('connection')}
                  className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                    activeTab === 'subscribers' && subscriberViewMode === 'tunnels'
                      ? 'bg-indigo-50 text-indigo-700 font-extrabold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Active Connection
                  <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'connection' ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {openDropdown === 'connection' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 text-xs font-semibold"
                    >
                      <button
                        onClick={handleUserConnectionClick}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Radio className="w-3.5 h-3.5 text-emerald-500" />
                        User (PPPoE Tunnel)
                      </button>
                      <button
                        onClick={handleUserListConnectionClick}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        User List
                      </button>
                      <button
                        onClick={handleCreateUserClick}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer border-t"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-indigo-500" />
                        Create User
                      </button>
                      <button
                        onClick={handleDeactivateConnectionClick}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        Deactivate Connection
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* DROPDOWN 4: User Management */}
              <div className="relative shrink-0">
                <button
                  onClick={() => handleDropdownToggle('usermgmt')}
                  className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                    activeTab === 'subscribers' && subscriberViewMode !== 'tunnels'
                      ? 'bg-indigo-50 text-indigo-700 font-extrabold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  User Management
                  <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'usermgmt' ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {openDropdown === 'usermgmt' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 text-xs font-semibold"
                    >
                      <button
                        onClick={handleUserManagementUserClick}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        User
                      </button>
                      <button
                        onClick={handleUserManagementCreateClick}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-indigo-500" />
                        User Create
                      </button>
                      <button
                        onClick={handleUserPermissionClick}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer border-t"
                      >
                        <Shield className="w-3.5 h-3.5 text-indigo-500" />
                        User Permission
                      </button>
                      <button
                        onClick={handleUserGroupClick}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                        User Group
                      </button>
                      <button
                        onClick={handleUserActiveClick}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Radio className="w-3.5 h-3.5 text-emerald-500" />
                        User Active
                      </button>
                      <button
                        onClick={handleUserLogClick}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                        User Log
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => { setActiveTab('billing'); setOpenDropdown(null); }}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'billing'
                    ? 'bg-indigo-50 text-indigo-700 font-extrabold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                ISP Billing
              </button>

              <button
                onClick={() => { setActiveTab('resellers'); setOpenDropdown(null); }}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'resellers'
                    ? 'bg-indigo-50 text-indigo-700 font-extrabold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-4 h-4" />
                Resellers & Areas
              </button>

              {/* Setting button */}
              <button
                onClick={handleSettingClick}
                className="px-3 py-2 text-xs font-bold rounded-lg transition-all text-slate-600 hover:bg-slate-50 flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                Setting
              </button>

            </div>

            {/* Quick Bandwidth Widget in Header */}
            <div className="hidden lg:flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1 text-[11px] font-mono">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600 animate-bounce" />
              <span className="text-indigo-800 font-bold">Throughput: {bandwidthData[bandwidthData.length-1]?.download || 4.2} Gbps</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* NOC System Alerts Grid banner if any active */}
              {criticalAlerts.length > 0 && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-pulse">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-6 h-6 text-rose-600" />
                    <div>
                      <span className="font-bold block text-sm">CRITICAL FIBER OPTIC ATTENUATION FAULT</span>
                      <p className="text-xs text-rose-700 mt-0.5">
                        {criticalAlerts[0].message}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('topology')}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 self-start sm:self-center cursor-pointer"
                  >
                    Locate Cut (OTDR)
                  </button>
                </div>
              )}

              {/* Core Statistics bento blocks */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase">Subscribers Pool</span>
                    <span className="text-2xl font-bold text-slate-800 mt-1 block">{totalSubscribers}</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Active provisioned slots</span>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase">Active PPPoE/Static</span>
                    <span className="text-2xl font-bold text-slate-800 mt-1 block">{activeSubscribers}</span>
                    <span className="text-[10px] text-green-500 font-semibold mt-1 block">Tunnels online</span>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
                    <Server className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase">Suspended (Due Bill)</span>
                    <span className="text-2xl font-bold text-slate-800 mt-1 block">{suspendedSubscribers}</span>
                    <span className="text-[10px] text-slate-500 mt-1 block">Temporary routed offline</span>
                  </div>
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-full">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase">Core Bandwidth Pool</span>
                    <span className="text-2xl font-bold text-slate-800 mt-1 block">10.0 Gbps</span>
                    <span className="text-[10px] text-indigo-500 font-semibold flex items-center gap-0.5 mt-1">
                      <TrendingUp className="w-3.5 h-3.5" /> High-speed Upstream
                    </span>
                  </div>
                  <div className="p-3 bg-sky-50 text-sky-600 rounded-full">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Core Real-time Bandwidth Utilization Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Bandwidth graph card */}
                <div className="lg:col-span-8 bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Upstream Core Bandwidth Throughput</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Real-time load measurements across aggregated fiber core loop trunks.</p>
                    </div>
                    <span className="text-xs text-indigo-600 font-mono font-bold bg-indigo-50 px-2 py-0.5 rounded">
                      Live Core Feed
                    </span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={bandwidthData}>
                        <defs>
                          <linearGradient id="downloadGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: 'Gbps', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="download" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#downloadGrad)" name="Core Download (Gbps)" />
                        <Area type="monotone" dataKey="upload" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#uploadGrad)" name="Core Upload (Gbps)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Live Alerts feed & logs */}
                <div className="lg:col-span-4 bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between min-h-[350px]">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Live System Alarms Feed</h3>
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    </div>

                    <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                      {alerts.map(alt => {
                        const isCritical = alt.severity === 'critical';
                        const isWarning = alt.severity === 'warning';
                        return (
                          <div
                            key={alt.id}
                            className={`p-3 rounded-lg border text-xs flex gap-2.5 items-start ${
                              alt.resolved
                                ? 'bg-slate-50/50 border-slate-100 opacity-60'
                                : isCritical
                                ? 'bg-rose-50 border-rose-100 text-rose-800'
                                : isWarning
                                ? 'bg-amber-50 border-amber-100 text-amber-800'
                                : 'bg-slate-50 border-slate-100 text-slate-700'
                            }`}
                          >
                            <AlertTriangle
                              className={`w-4 h-4 shrink-0 mt-0.5 ${
                                alt.resolved
                                  ? 'text-slate-400'
                                  : isCritical
                                  ? 'text-rose-600 animate-bounce'
                                  : 'text-amber-600'
                              }`}
                            />
                            <div className="flex-1 space-y-1">
                              <p className="leading-relaxed font-medium">{alt.message}</p>
                              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                                <span>{alt.timestamp.split('T')[1].slice(0, 5)} (UTC)</span>
                                {!alt.resolved && (
                                  <button
                                    onClick={() => handleResolveAlert(alt.id)}
                                    className="text-indigo-600 hover:underline font-semibold cursor-pointer"
                                  >
                                    Acknowledge
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Total Alerts: {alerts.length}</span>
                    <span>Unresolved: {alerts.filter(a => !a.resolved).length}</span>
                  </div>
                </div>

              </div>

              {/* Secondary NOC Diagnostic Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Chart 1: ONU Optical RX Power Distribution */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">ONT Optical Laser Power Levels</h3>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded uppercase font-mono">
                        Active Diagnoses
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">
                      Real-time decibel-milliwatt (dBm) loop attenuation distribution across active subscribers.
                    </p>
                  </div>

                  <div className="h-64 w-full">
                    {(() => {
                      const optimalCount = onus.filter(o => o.rxPower >= -22).length;
                      const warningCount = onus.filter(o => o.rxPower < -22 && o.rxPower >= -26).length;
                      const criticalCount = onus.filter(o => o.rxPower < -26).length;

                      const opticalSignalData = [
                        { name: 'Optimal (-15 to -22 dBm)', count: optimalCount || 5, color: '#10b981' },
                        { name: 'Warning (-23 to -26 dBm)', count: warningCount || 2, color: '#f59e0b' },
                        { name: 'Critical (<-26 dBm)', count: criticalCount || 1, color: '#ef4444' },
                      ];

                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={opticalSignalData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                            <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} name="ONT Units Count">
                              {opticalSignalData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </div>
                </div>

                {/* Chart 2: Core Device CPU Load & Temperature Stats */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Device Hardware Processor Load</h3>
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded uppercase font-mono">
                        Hardware Stats
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">
                      Processor (CPU) utilization levels across primary OLT terminals and MikroTik CCR gateway routers.
                    </p>
                  </div>

                  <div className="h-64 w-full">
                    {(() => {
                      const hardwareLoadData = [
                        ...mikrotiks.map(m => ({ name: m.name.replace('Mikrotik ', 'CCR '), CPU: m.cpuLoad || 22 })),
                        ...olts.map(o => ({ name: o.name.replace('Huawei ', 'GPON '), CPU: 14 }))
                      ];

                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={hardwareLoadData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
                            <Tooltip />
                            <Legend fontSize={10} />
                            <Bar dataKey="CPU" fill="#6366f1" radius={[6, 6, 0, 0]} name="CPU Load (%)" />
                          </BarChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {activeTab === 'topology' && (
            <NetworkTopology
              onus={onus}
              olts={olts}
              mikrotiks={mikrotiks}
              alerts={alerts}
              onUpdateOnu={(onu) => setOnus(prev => {
                const next = prev.map(o => o.id === onu.id || o.serialNumber === onu.serialNumber ? onu : o);
                syncStorage({ onus: next });
                return next;
              })}
              onAddAlert={handleAddAlert}
              onResolveAlert={handleResolveAlert}
            />
          )}

          {activeTab === 'subscribers' && (
            <SubscriberList
              subscribers={subscribers}
              onus={onus}
              olts={olts}
              mikrotiks={mikrotiks}
              onAddSubscriber={handleAddSubscriber}
              onUpdateSubscriber={handleUpdateSubscriber}
              onDeleteSubscriber={handleDeleteSubscriber}
              initialViewMode={subscriberViewMode}
              initialShowForm={subscriberShowForm}
              initialFilterStatus={subscriberFilterStatus}
              onCloseForm={() => setSubscriberShowForm(false)}
            />
          )}

          {activeTab === 'billing' && (
            <BillingManager
              invoices={invoices}
              subscribers={subscribers}
              onUpdateInvoice={handleUpdateInvoice}
              onUpdateSubscriber={handleUpdateSubscriber}
              onAddAlert={handleAddAlert}
              onGenerateInvoices={handleGenerateInvoices}
            />
          )}

          {activeTab === 'equipment' && (
            <EquipmentAdmin
              olts={olts}
              mikrotiks={mikrotiks}
              onus={onus}
              onAddOlt={handleAddOlt}
              onAddMikrotik={handleAddMikrotik}
              onDeleteOlt={handleDeleteOlt}
              onDeleteMikrotik={handleDeleteMikrotik}
              onUpdateOlt={handleUpdateOlt}
              onUpdateMikrotik={handleUpdateMikrotik}
              onAddAlert={handleAddAlert}
              onUpdateOnus={(next) => {
                setOnus(next);
                syncStorage({ onus: next });
              }}
              initialSection={equipmentSection}
              initialShowOltForm={showOltFormState}
              initialShowMtForm={showMtFormState}
              initialFilterStatus={equipmentFilterStatus}
            />
          )}

          {activeTab === 'resellers' && (
            <ResellersPOP
              resellers={resellers}
              areas={areas}
              onAddReseller={handleAddReseller}
              onAddArea={handleAddArea}
              onDeleteReseller={handleDeleteReseller}
              onDeleteArea={handleDeleteArea}
              onUpdateReseller={handleUpdateReseller}
              onAddAlert={handleAddAlert}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Live Graph Drawer to satisfy "Setting: All menu clicks work and show the work & graph dashboard" */}
      <div className="bg-slate-900 text-white border-t border-slate-800 p-4 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
            <div>
              <span className="font-bold text-slate-300 block text-[11px] uppercase">Telemetry Monitor Active</span>
              <span className="text-[10px] text-slate-500">Connected to ZTE C320 SFP Chassis and Mikrotik CCR core gateways</span>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div>
              <span className="text-[10px] text-slate-500 block">TOTAL SUB BANDWIDTH:</span>
              <strong className="text-indigo-400">{subscribers.length * 35} Mbps Aggregate</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">FIBER OTDR STATE:</span>
              <strong className="text-green-400">Loop normal</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">BILLING AUTOPAY INBOUND:</span>
              <strong className="text-sky-400">Real-time Gateway Sync</strong>
            </div>
          </div>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold rounded text-[10px] transition-colors cursor-pointer"
          >
            SNMP SETTINGS
          </button>
        </div>
      </div>

      {/* Persistent Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2016 OLT MANAGEMENT. All Rights Reserved. Design & Develop By Onik</p>
          <p className="mt-1 text-slate-400">ISP CORE OPERATIONAL SYSTEM • NOC MAIN DIVISION • v4.12.0</p>
        </div>
      </footer>

        </>
      )}

      {/* SETTINGS INTERACTIVE MODAL */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden font-mono"
            >
              {/* Header */}
              <div className="bg-slate-900 p-5 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400 animate-spin" />
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-white">NOC Operational Settings</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Configure system SNMP traps, database persistence, and backup servers.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm font-bold"
                >
                  [CLOSE]
                </button>
              </div>

              {/* Form Content */}
              <div className="p-5 space-y-4 text-xs">
                
                {/* Embedded Live Graph */}
                <div className="bg-black/40 border border-slate-800/80 rounded-xl p-3 space-y-2">
                  <span className="text-[10px] font-bold text-indigo-400 block uppercase">Real-time Upstream SNMP Feed</span>
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={bandwidthData}>
                        <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" />
                        <XAxis dataKey="time" stroke="#475569" fontSize={9} />
                        <YAxis stroke="#475569" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b' }} />
                        <Area type="monotone" dataKey="download" stroke="#4f46e5" strokeWidth={1.5} fill="#4f46e5" fillOpacity={0.1} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase">SNMP Community *</label>
                    <input
                      type="text"
                      value={snmpCommunity}
                      onChange={(e) => setSnmpCommunity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 p-2 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase">Syslog Server Daemon</label>
                    <input
                      type="text"
                      value={syslogServer}
                      onChange={(e) => setSyslogServer(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 p-2 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase">Database Backup Run</label>
                    <select
                      value={backupInterval}
                      onChange={(e) => setBackupInterval(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 p-2 rounded focus:outline-none"
                    >
                      <option value="Hourly">Hourly Incremental</option>
                      <option value="Daily">Daily Snapshot (04:00 AM)</option>
                      <option value="Weekly">Weekly Compression</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase">Core Decryption Engine</label>
                    <div className="flex items-center gap-2 py-1.5 px-1">
                      <span className="p-1 bg-green-950 text-green-400 rounded border border-green-800">
                        <CheckCircle className="w-4 h-4" />
                      </span>
                      <span className="text-slate-300">AES-256 Enabled</span>
                    </div>
                  </div>
                </div>

                {/* Confirm Settings */}
                <div className="border-t border-slate-800 pt-4 flex gap-3.5 justify-end">
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded border border-slate-800 transition-colors cursor-pointer"
                  >
                    Close Settings
                  </button>
                  <button
                    onClick={() => {
                      alert('SNMP configuration traps written to core loop gateways. Daemon restarted successfully.');
                      setShowSettingsModal(false);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded transition-colors cursor-pointer"
                  >
                    Apply Parameters
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
