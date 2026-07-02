import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu,
  Plus,
  Trash2,
  Settings,
  Activity,
  Database,
  RefreshCw,
  Power,
  XCircle,
  Clock,
  Gauge,
  Router,
  Zap,
  HardDrive,
  Network,
  AlertTriangle,
  Flame,
  CheckCircle,
  Search,
  Sliders,
  Radio,
  SlidersHorizontal,
  Eye,
  EyeOff
} from 'lucide-react';
import { Olt, Mikrotik, Onu } from '../types';

interface EquipmentAdminProps {
  olts: Olt[];
  mikrotiks: Mikrotik[];
  onus: Onu[];
  onAddOlt: (olt: Olt) => void;
  onAddMikrotik: (mt: Mikrotik) => void;
  onDeleteOlt: (id: string) => void;
  onDeleteMikrotik: (id: string) => void;
  onUpdateOlt: (olt: Olt) => void;
  onUpdateMikrotik: (mt: Mikrotik) => void;
  onAddAlert: (alert: any) => void;
  onUpdateOnus?: (onus: Onu[]) => void;
  
  // Optional navigation control props
  initialShowOltForm?: boolean;
  initialShowMtForm?: boolean;
  initialFilterStatus?: 'all' | 'online' | 'offline';
  initialSection?: 'olt' | 'mikrotik' | 'pon';
}

export default function EquipmentAdmin({
  olts,
  mikrotiks,
  onus,
  onAddOlt,
  onAddMikrotik,
  onDeleteOlt,
  onDeleteMikrotik,
  onUpdateOlt,
  onUpdateMikrotik,
  onAddAlert,
  onUpdateOnus,
  initialShowOltForm,
  initialShowMtForm,
  initialFilterStatus,
  initialSection,
}: EquipmentAdminProps) {
  const [activeSection, setActiveSection] = useState<'olt' | 'mikrotik' | 'pon'>(initialSection || 'olt');
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');
  
  const [showOltForm, setShowOltForm] = useState(false);
  const [showMtForm, setShowMtForm] = useState(false);

  // OLT Form state
  const [oltName, setOltName] = useState('');
  const [oltModel, setOltModel] = useState('ZTE ZXA10 C320');
  const [oltIp, setOltIp] = useState('');
  const [oltPorts, setOltPorts] = useState<number>(8);
  const [oltSshPort, setOltSshPort] = useState<number>(22);
  const [oltUsername, setOltUsername] = useState<string>('admin');
  const [oltPassword, setOltPassword] = useState<string>('');
  const [oltStatusInput, setOltStatusInput] = useState<'online' | 'offline'>('online');
  const [showOltPasswordMap, setShowOltPasswordMap] = useState<Record<string, boolean>>({});
  const [expandedOltMap, setExpandedOltMap] = useState<Record<string, boolean>>({});

  // Mikrotik Form state
  const [mtName, setMtName] = useState('');
  const [mtModel, setMtModel] = useState('Mikrotik CCR2004');
  const [mtIp, setMtIp] = useState('');
  const [mtPort, setMtPort] = useState<number>(8728);
  const [mtUsername, setMtUsername] = useState<string>('admin');
  const [mtPassword, setMtPassword] = useState<string>('');
  const [mtStatusInput, setMtStatusInput] = useState<'online' | 'offline'>('online');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [confirmClearAllOlts, setConfirmClearAllOlts] = useState(false);
  const [confirmClearAllMts, setConfirmClearAllMts] = useState(false);

  // SFP Optical Laser diagnostics state
  const [ponPorts, setPonPorts] = useState([
    { id: 'p-1', label: 'PON-1 SFP+', status: 'online', connectedOnus: 14, laserPower: 3.2, temp: 42.4, biasCurrent: 14.2, description: 'Main Residential Trunk', laserState: 'Normal' },
    { id: 'p-2', label: 'PON-2 SFP+', status: 'online', connectedOnus: 28, laserPower: 4.8, temp: 58.1, biasCurrent: 22.5, description: 'Downtown Business Ring', laserState: 'Laser High Alarm' },
    { id: 'p-3', label: 'PON-3 SFP+', status: 'online', connectedOnus: 8, laserPower: 2.1, temp: 38.0, biasCurrent: 11.0, description: 'Greenwood Sector Block', laserState: 'Normal' },
    { id: 'p-4', label: 'PON-4 SFP+', status: 'online', connectedOnus: 12, laserPower: 3.9, temp: 46.5, biasCurrent: 16.8, description: 'North Hill Fiber', laserState: 'Normal' },
    { id: 'p-5', label: 'PON-5 SFP+', status: 'offline', connectedOnus: 0, laserPower: 0, temp: 0, biasCurrent: 0, description: 'Unassigned/Reserved SFP Port', laserState: 'Offline' },
    { id: 'p-6', label: 'PON-6 SFP+', status: 'offline', connectedOnus: 0, laserPower: 0, temp: 0, biasCurrent: 0, description: 'Unassigned/Reserved SFP Port', laserState: 'Offline' },
  ]);

  // Sync state with dynamic external controls
  useEffect(() => {
    if (initialSection) setActiveSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    if (initialFilterStatus) setFilterStatus(initialFilterStatus);
  }, [initialFilterStatus]);

  useEffect(() => {
    if (initialShowOltForm !== undefined) setShowOltForm(initialShowOltForm);
  }, [initialShowOltForm]);

  useEffect(() => {
    if (initialShowMtForm !== undefined) setShowMtForm(initialShowMtForm);
  }, [initialShowMtForm]);

  const handleAddOltSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oltName || !oltIp) {
      alert('Please enter all required details.');
      return;
    }

    const newOlt: Olt = {
      id: `olt-gen-${Date.now()}`,
      name: oltName,
      model: oltModel,
      ipAddress: oltIp,
      ponPortsCount: oltPorts,
      status: oltStatusInput,
      cpuUsage: oltStatusInput === 'online' ? Math.floor(Math.random() * 20 + 5) : 0,
      memoryUsage: oltStatusInput === 'online' ? Math.floor(Math.random() * 30 + 15) : 0,
      uptimeSeconds: oltStatusInput === 'online' ? 3600 : 0, // 1 hour
      sshPort: oltSshPort,
      username: oltUsername,
      password: oltPassword,
    };

    onAddOlt(newOlt);

    // Auto-seed 3 active ONUs connected to this OLT for GPON laser diagnostics and PON port tracking
    const seededOnus: Onu[] = [
      {
        id: `onu-olt-gen-1-${Date.now()}`,
        serialNumber: `ZTEG${Math.floor(Math.random() * 900000 + 100000)}`,
        brand: 'ZTE',
        model: 'F660',
        rxPower: -19.4,
        txPower: 2.1,
        status: 'online',
        distanceKm: 1.45,
        laserLevel: 'normal',
        oltId: newOlt.id,
        ponPort: 1,
        configuredSpeed: 10
      },
      {
        id: `onu-olt-gen-2-${Date.now()}`,
        serialNumber: `HWTC${Math.floor(Math.random() * 900000 + 100000)}`,
        brand: 'Huawei',
        model: 'HG8546M',
        rxPower: -23.1,
        txPower: 1.9,
        status: 'online',
        distanceKm: 2.8,
        laserLevel: 'normal',
        oltId: newOlt.id,
        ponPort: 2,
        configuredSpeed: 20
      },
      {
        id: `onu-olt-gen-3-${Date.now()}`,
        serialNumber: `ZTEG${Math.floor(Math.random() * 900000 + 100000)}`,
        brand: 'ZTE',
        model: 'F609',
        rxPower: -28.4,
        txPower: 2.0,
        status: 'online',
        distanceKm: 3.92,
        laserLevel: 'critical',
        oltId: newOlt.id,
        ponPort: 3,
        configuredSpeed: 5
      }
    ];

    if (onUpdateOnus) {
      onUpdateOnus([...onus, ...seededOnus]);
    }

    setShowOltForm(false);
    setOltName('');
    setOltIp('');
    setOltSshPort(22);
    setOltUsername('admin');
    setOltPassword('');
    setOltStatusInput('online');

    onAddAlert({
      id: `alt-olt-add-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'info',
      message: `System Admin: Registered and deployed new OLT core node ${newOlt.name} (${newOlt.ipAddress}:${newOlt.sshPort || 22}).`,
      resolved: false,
      type: 'olt_offline',
    });
  };

  const handleAddMtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mtName || !mtIp) {
      alert('Please enter all required details.');
      return;
    }

    const newMt: Mikrotik = {
      id: `mt-gen-${Date.now()}`,
      name: mtName,
      model: mtModel,
      ipAddress: mtIp,
      status: mtStatusInput,
      cpuUsage: mtStatusInput === 'online' ? Math.floor(Math.random() * 20 + 5) : 0,
      memoryUsage: mtStatusInput === 'online' ? Math.floor(Math.random() * 30 + 15) : 0,
      uptimeSeconds: mtStatusInput === 'online' ? 3600 : 0,
      port: mtPort,
      username: mtUsername,
      password: mtPassword,
    };

    onAddMikrotik(newMt);
    setShowMtForm(false);
    setMtName('');
    setMtIp('');
    setMtPort(8728);
    setMtUsername('admin');
    setMtPassword('');
    setMtStatusInput('online');

    onAddAlert({
      id: `alt-mt-add-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'info',
      message: `System Admin: Registered and deployed new Mikrotik core gateway ${newMt.name} (${newMt.ipAddress}:${newMt.port}).`,
      resolved: false,
      type: 'mikrotik_offline',
    });
  };

  // Simulate rebooting a device
  const handleRebootOlt = (olt: Olt) => {
    const rebootedOlt: Olt = {
      ...olt,
      uptimeSeconds: 0,
      cpuUsage: 1,
      memoryUsage: 10,
    };
    onUpdateOlt(rebootedOlt);
    onAddAlert({
      id: `alt-reboot-olt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'warning',
      message: `Equipment Command: Triggered remote warm boot sequence for OLT ${olt.name}.`,
      resolved: false,
      type: 'olt_offline',
    });
    alert(`WARM BOOT command dispatched to OLT ${olt.name}. System uptime reset.`);
  };

  const handleRebootMt = (mt: Mikrotik) => {
    const rebootedMt: Mikrotik = {
      ...mt,
      uptimeSeconds: 0,
      cpuUsage: 1,
      memoryUsage: 12,
    };
    onUpdateMikrotik(rebootedMt);
    onAddAlert({
      id: `alt-reboot-mt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'warning',
      message: `Equipment Command: Triggered remote warm boot sequence for Mikrotik CCR ${mt.name}.`,
      resolved: false,
      type: 'mikrotik_offline',
    });
    alert(`WARM BOOT command dispatched to Mikrotik ${mt.name}. Gateway routing temporary interruption.`);
  };

  const handleStressTestMt = (mt: Mikrotik) => {
    const stressedMt: Mikrotik = {
      ...mt,
      cpuUsage: 94,
      memoryUsage: 88,
    };
    onUpdateMikrotik(stressedMt);
    onAddAlert({
      id: `alt-stress-mt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'warning',
      message: `Performance Alert: High CPU/RAM threshold reached on ${mt.name} during PPPoE tunnel load test (CPU: 94%).`,
      resolved: false,
      type: 'mikrotik_offline',
    });
  };

  // Helper to format uptime duration
  const formatUptime = (secs: number) => {
    const d = Math.floor(secs / (3600 * 24));
    const h = Math.floor((secs % (3600 * 24)) / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  // Filter lists based on status
  const filteredOlts = olts.filter(o => filterStatus === 'all' || o.status === filterStatus);
  const filteredMikrotiks = mikrotiks.filter(m => filterStatus === 'all' || m.status === filterStatus);

  return (
    <div id="equipment-admin-section" className="space-y-6">
      
      {/* Sub-Navigation Tabs inside Equipment Admin */}
      <div className="bg-slate-900 text-white rounded-xl p-2 shadow-md flex flex-wrap gap-1.5 border border-slate-800">
        <button
          onClick={() => setActiveSection('olt')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSection === 'olt'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          GPON OLT Chassis List ({olts.length})
        </button>
        <button
          onClick={() => setActiveSection('mikrotik')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSection === 'mikrotik'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Router className="w-4 h-4" />
          Mikrotik CCR Aggregators ({mikrotiks.length})
        </button>
        <button
          onClick={() => setActiveSection('pon')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSection === 'pon'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Network className="w-4 h-4" />
          OLT PON Part-to-Part System
        </button>
      </div>

      {/* Quick Actions Header */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            {activeSection === 'olt' && 'Core Network OLT Chassis Node Central'}
            {activeSection === 'mikrotik' && 'Mikrotik CCR Core PPPoE Routers'}
            {activeSection === 'pon' && 'GPON SFP+ Laser Diagnostics Terminal'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeSection === 'olt' && 'Register, configure, and warm boot core OLT SFP+ chassis switches.'}
            {activeSection === 'mikrotik' && 'Control active PPPoE NAS tunnels, stress test CPUs, and alter gateway routing.'}
            {activeSection === 'pon' && 'Live status of GPON SFP modules, laser outputs, voltage metrics, and Laser High alarms.'}
          </p>
        </div>

        <div className="flex gap-2 text-xs">
          {activeSection === 'olt' && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowOltForm(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add GPON OLT
              </button>
              {olts.length > 0 && (
                confirmClearAllOlts ? (
                  <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-1.5 rounded-lg">
                    <span className="text-[10px] font-bold text-rose-700 px-1">নিশ্চিত মুছবেন?</span>
                    <button
                      onClick={() => {
                        olts.forEach(o => onDeleteOlt(o.id));
                        setConfirmClearAllOlts(false);
                      }}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded cursor-pointer"
                    >
                      হ্যাঁ (Yes)
                    </button>
                    <button
                      onClick={() => setConfirmClearAllOlts(false)}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded cursor-pointer"
                    >
                      না (No)
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClearAllOlts(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    সব OLT মুছুন (Clear All)
                  </button>
                )
              )}
            </div>
          )}
          {activeSection === 'mikrotik' && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowMtForm(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Mikrotik CCR
              </button>
              {mikrotiks.length > 0 && (
                confirmClearAllMts ? (
                  <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-1.5 rounded-lg">
                    <span className="text-[10px] font-bold text-rose-700 px-1">নিশ্চিত মুছবেন?</span>
                    <button
                      onClick={() => {
                        mikrotiks.forEach(m => onDeleteMikrotik(m.id));
                        setConfirmClearAllMts(false);
                      }}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded cursor-pointer"
                    >
                      হ্যাঁ (Yes)
                    </button>
                    <button
                      onClick={() => setConfirmClearAllMts(false)}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded cursor-pointer"
                    >
                      না (No)
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClearAllMts(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    সব Mikrotik মুছুন (Clear All)
                  </button>
                )
              )}
            </div>
          )}
          {activeSection === 'pon' && (
            <button
              onClick={() => {
                // Refresh diagnostic lasers
                alert('Sent SNMP query packet. Laser optical power levels updated successfully.');
              }}
              className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 font-bold rounded-lg shadow flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 animate-spin" /> Query SFP Laser Metrics
            </button>
          )}

          {/* Inline Status Filters */}
          {(activeSection === 'olt' || activeSection === 'mikrotik') && (
            <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2 py-1 rounded text-[10px] font-bold ${filterStatus === 'all' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('online')}
                className={`px-2 py-1 rounded text-[10px] font-bold ${filterStatus === 'online' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'}`}
              >
                Online
              </button>
              <button
                onClick={() => setFilterStatus('offline')}
                className={`px-2 py-1 rounded text-[10px] font-bold ${filterStatus === 'offline' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'}`}
              >
                Offline
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RENDER VIEW: OLT CHASSIS LIST */}
      {activeSection === 'olt' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOlts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs border bg-white rounded-xl">
              No OLT chassis found matching this search criteria.
            </div>
          ) : (
            filteredOlts.map(olt => {
              const oltOnus = onus.filter(o => o.oltId === olt.id);
              const usedPonPorts = new Set(oltOnus.map(o => o.ponPort)).size;
              const isExpanded = !!expandedOltMap[olt.id];

              return (
                <div key={olt.id} className="border border-slate-100 rounded-xl p-4 bg-white shadow-sm hover:shadow transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{olt.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Model: {olt.model}</span>
                      <span className="text-[10px] text-indigo-600 font-mono font-bold block">IP: {olt.ipAddress}</span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <button
                        onClick={() => {
                          const nextStatus = olt.status === 'online' ? 'offline' : 'online';
                          onUpdateOlt({
                            ...olt,
                            status: nextStatus,
                            cpuUsage: nextStatus === 'online' ? Math.floor(Math.random() * 20 + 5) : 0,
                            memoryUsage: nextStatus === 'online' ? Math.floor(Math.random() * 30 + 15) : 0,
                            uptimeSeconds: nextStatus === 'online' ? 3600 : 0
                          });
                          onAddAlert({
                            id: `alt-olt-toggle-${Date.now()}`,
                            timestamp: new Date().toISOString(),
                            severity: nextStatus === 'offline' ? 'warning' : 'info',
                            message: `Manual Toggle: OLT Node ${olt.name} status switched to ${nextStatus.toUpperCase()}.`,
                            resolved: false,
                            type: 'olt_offline',
                          });
                        }}
                        className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded tracking-wider cursor-pointer transition-all hover:brightness-95 active:scale-95 ${
                          olt.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                        title="Click to toggle status"
                      >
                        {olt.status}
                      </button>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatUptime(olt.uptimeSeconds)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-3 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-400 block text-[9px]">CPU</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Gauge className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-bold text-slate-800">{olt.cpuUsage}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">MEMORY</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Database className="w-3.5 h-3.5 text-sky-500" />
                        <span className="font-bold text-slate-800">{olt.memoryUsage}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">PON PORTS</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-bold text-slate-800">{olt.ponPortsCount} Ports</span>
                      </div>
                    </div>
                  </div>

                  {/* OLT SSH Credentials Panel */}
                  <div className="my-3 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 text-[10px] space-y-1.5 text-slate-600 font-mono">
                    <div className="flex justify-between">
                      <span>SSH Port:</span>
                      <span className="font-bold text-slate-800">{olt.sshPort || 22}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Username:</span>
                      <span className="font-bold text-slate-800">{olt.username || 'admin'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Password:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-800">
                          {showOltPasswordMap[olt.id] ? (olt.password || '(no password)') : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowOltPasswordMap(prev => ({ ...prev, [olt.id]: !prev[olt.id] }))}
                          className="text-slate-400 hover:text-slate-600 focus:outline-none p-0.5 cursor-pointer"
                          title={showOltPasswordMap[olt.id] ? "Hide password" : "Show password"}
                        >
                          {showOltPasswordMap[olt.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* PON port usage & connected ONUs summary */}
                  <div className="mt-3 bg-indigo-50/30 p-2.5 rounded-lg border border-indigo-100/30 text-[11px] space-y-1.5 text-slate-600">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                        Active PON Ports:
                      </span>
                      <span className="font-bold text-indigo-700 font-mono">
                        {usedPonPorts} / {olt.ponPortsCount} used
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1">
                        <Radio className="w-3.5 h-3.5 text-emerald-500" />
                        Total Connected ONUs:
                      </span>
                      <span className="font-bold text-emerald-700 font-mono">
                        {oltOnus.length} ONUs
                      </span>
                    </div>
                  </div>

                  {/* Expandable Optical Laser diagnostics */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setExpandedOltMap(prev => ({ ...prev, [olt.id]: !prev[olt.id] }))}
                      className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wider rounded-lg border border-slate-200 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Zap className={`w-3.5 h-3.5 text-indigo-500 ${isExpanded ? 'animate-bounce' : ''}`} />
                        ONU & Laser Diagnostics ({oltOnus.length})
                      </span>
                      <span className="font-mono text-indigo-600">
                        {isExpanded ? 'Collapse ▲' : 'Expand ▼'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 space-y-2 max-h-56 overflow-y-auto pr-1">
                        {oltOnus.length === 0 ? (
                          <div className="p-4 text-center bg-slate-50 border border-dashed border-slate-100 text-[10px] text-slate-400 rounded-lg">
                            No ONUs currently mapped or configured under this OLT chassis.
                          </div>
                        ) : (
                          oltOnus.map(onu => (
                            <div key={onu.id} className="p-2 bg-slate-50/50 hover:bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-1 transition-all">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-slate-700 font-mono">
                                  {onu.brand} {onu.model}
                                </span>
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                                  onu.status === 'online' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                }`}>
                                  {onu.status}
                                </span>
                              </div>

                              <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                                <span>S/N: <strong className="text-slate-700">{onu.serialNumber}</strong></span>
                                <span>PON Port: <strong className="text-indigo-600 font-bold">#{onu.ponPort}</strong></span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 mt-1 pt-1 border-t border-slate-100/60 font-mono text-[9px]">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Rx Power:</span>
                                  <span className={`font-bold ${
                                    onu.rxPower < -27 || onu.laserLevel === 'critical' ? 'text-rose-600 animate-pulse font-extrabold' :
                                    onu.rxPower < -24 || onu.laserLevel === 'high' ? 'text-amber-600 font-bold' :
                                    'text-emerald-600 font-bold'
                                  }`}>
                                    {onu.rxPower} dBm
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Tx Power:</span>
                                  <span className="font-bold text-slate-700">{onu.txPower} dBm</span>
                                </div>
                              </div>

                              {(onu.laserLevel !== 'normal' || onu.rxPower < -24) && (
                                <div className="mt-1 flex items-center gap-1 text-[8px] font-bold text-amber-600 uppercase tracking-wide bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                  <AlertTriangle className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                                  Laser Level: {onu.rxPower < -27 ? 'CRITICAL (High Loss)' : 'HIGH ALARM'}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Operations */}
                  <div className="flex gap-2.5 pt-3.5 mt-3.5 border-t border-slate-100 text-xs font-semibold">
                    <button
                      onClick={() => handleRebootOlt(olt)}
                      className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Power className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                      Warm Boot
                    </button>
                    {deleteConfirmId === olt.id ? (
                      <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 p-1 rounded-lg shrink-0">
                        <button
                          onClick={() => {
                            onDeleteOlt(olt.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-1 bg-slate-200 text-slate-700 rounded text-[10px] font-bold hover:bg-slate-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(olt.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-100 transition-colors cursor-pointer"
                        title="Delete OLT Node"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* RENDER VIEW: MIKROTIK ROUTERS LIST */}
      {activeSection === 'mikrotik' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMikrotiks.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs border bg-white rounded-xl">
              No Mikrotik CCR routers found matching search criteria.
            </div>
          ) : (
            filteredMikrotiks.map(mt => (
              <div key={mt.id} className="border border-slate-100 rounded-xl p-4 bg-white shadow-sm hover:shadow transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{mt.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Model: {mt.model}</span>
                    <span className="text-[10px] text-indigo-600 font-mono font-bold block">IP: {mt.ipAddress}</span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <button
                      onClick={() => {
                        const nextStatus = mt.status === 'online' ? 'offline' : 'online';
                        onUpdateMikrotik({
                          ...mt,
                          status: nextStatus,
                          cpuUsage: nextStatus === 'online' ? 14 : 0,
                          memoryUsage: nextStatus === 'online' ? 28 : 0,
                          uptimeSeconds: nextStatus === 'online' ? 3600 : 0
                        });
                        onAddAlert({
                          id: `alt-mt-toggle-${Date.now()}`,
                          timestamp: new Date().toISOString(),
                          severity: nextStatus === 'offline' ? 'warning' : 'info',
                          message: `Manual Toggle: Mikrotik Router ${mt.name} status switched to ${nextStatus.toUpperCase()}.`,
                          resolved: false,
                          type: 'mikrotik_offline',
                        });
                      }}
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded tracking-wider cursor-pointer transition-all hover:brightness-95 active:scale-95 ${
                        mt.status === 'online' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                      title="Click to toggle Online/Offline status"
                    >
                      {mt.status}
                    </button>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatUptime(mt.uptimeSeconds)}
                    </span>
                  </div>
                </div>

                {/* Port, Username, Password section */}
                <div className="mb-3 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 text-[10px] space-y-1.5 text-slate-600 font-mono">
                  <div className="flex justify-between">
                    <span>API / Winbox Port:</span>
                    <span className="font-bold text-slate-800">{mt.port || 8728}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Username:</span>
                    <span className="font-bold text-slate-800">{mt.username || 'admin'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Password:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-800">
                        {showPasswordMap[mt.id] ? (mt.password || '(no password)') : '••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPasswordMap(prev => ({ ...prev, [mt.id]: !prev[mt.id] }))}
                        className="text-slate-400 hover:text-slate-600 focus:outline-none p-0.5 cursor-pointer"
                        title={showPasswordMap[mt.id] ? "Hide password" : "Show password"}
                      >
                        {showPasswordMap[mt.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-400 block text-[9px]">CCR CORE CPU</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Gauge className={`w-3.5 h-3.5 ${mt.cpuUsage > 80 ? 'text-rose-500 animate-bounce' : 'text-indigo-500'}`} />
                      <span className={`font-bold ${mt.cpuUsage > 80 ? 'text-rose-600 font-extrabold' : 'text-slate-800'}`}>{mt.cpuUsage}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">RAM BOUNDS</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Database className="w-3.5 h-3.5 text-sky-500" />
                      <span className="font-bold text-slate-800">{mt.memoryUsage}%</span>
                    </div>
                  </div>
                </div>

                {/* Operations */}
                <div className="flex gap-2 pt-3.5 mt-3.5 border-t border-slate-100 text-xs font-semibold">
                  <button
                    onClick={() => handleRebootMt(mt)}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Power className="w-3.5 h-3.5 text-rose-500" />
                    Warm Boot
                  </button>
                  <button
                    onClick={() => handleStressTestMt(mt)}
                    className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-1.5 rounded-lg border border-indigo-150 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    title="Send stressful simulated customer packets"
                  >
                    <Activity className="w-3.5 h-3.5 text-indigo-500" />
                    Load Stress
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Do you want to completely de-provision Mikrotik CCR ${mt.name}?`)) {
                        onDeleteMikrotik(mt.id);
                      }
                    }}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-100 transition-colors cursor-pointer"
                    title="Delete Router"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* RENDER VIEW: OLT PON PART-TO-PART SYSTEM */}
      {activeSection === 'pon' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-3 border-slate-100">
              <Radio className="w-5 h-5 text-indigo-500 animate-pulse" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">PON Chassis Optical Port Multi-Grid diagnostics</h4>
                <p className="text-[11px] text-slate-500">Live operational diagnostics matching SFP laser transmit power with ONU node distributions.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
              {ponPorts.map(port => {
                const isHighAlarm = port.laserState?.includes('High') ?? false;
                const isOffline = port.status === 'offline';
                return (
                  <div
                    key={port.id}
                    className={`border rounded-xl p-4 transition-all relative overflow-hidden ${
                      isOffline
                        ? 'bg-slate-100 border-slate-200 text-slate-400'
                        : isHighAlarm
                        ? 'bg-rose-50/20 border-rose-200 hover:border-rose-300'
                        : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                    }`}
                  >
                    {/* Visual Warning indicator */}
                    {isHighAlarm && (
                      <div className="absolute top-0 right-0 bg-rose-600 text-white font-extrabold text-[8px] uppercase tracking-widest px-2.5 py-0.5 rounded-bl">
                        LASER HIGH
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-slate-800 block">{port.label}</span>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{port.description}</span>
                      </div>
                      <span className={`w-2.5 h-2.5 rounded-full ${isOffline ? 'bg-slate-300' : isHighAlarm ? 'bg-rose-500 animate-ping' : 'bg-green-500 animate-pulse'}`} />
                    </div>

                    <div className="space-y-1.5 border-t pt-3 mt-3 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Optical Laser Output:</span>
                        <strong className={`font-bold ${isHighAlarm ? 'text-rose-600' : isOffline ? 'text-slate-400' : 'text-emerald-600'}`}>
                          {isOffline ? '0.0' : `+${port.laserPower}`} dBm
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">SFP Temperature:</span>
                        <strong className="text-slate-700">{isOffline ? '0.0' : `${port.temp}`} °C</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Bias Current draw:</span>
                        <strong className="text-slate-700">{isOffline ? '0.0' : `${port.biasCurrent}`} mA</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ONUs Registered:</span>
                        <span className={`px-1 rounded font-bold ${isOffline ? 'bg-slate-200 text-slate-500' : 'bg-indigo-100 text-indigo-700'}`}>
                          {port.connectedOnus} Nodes
                        </span>
                      </div>
                    </div>

                    {/* Operational control buttons */}
                    {!isOffline && (
                      <div className="flex gap-2 mt-4 pt-3 border-t">
                        <button
                          onClick={() => {
                            const targetVal = isHighAlarm ? 3.3 : 4.9;
                            const nextPorts = ponPorts.map(p => {
                              if (p.id === port.id) {
                                return {
                                  ...p,
                                  laserPower: targetVal,
                                  laserState: isHighAlarm ? 'Normal' : 'Laser High Alarm',
                                  temp: isHighAlarm ? 41.5 : 59.2
                                };
                              }
                              return p;
                            });
                            setPonPorts(nextPorts);
                            alert(`Bias attenuation dispatched. Adjusted OLT laser gain output.`);
                          }}
                          className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[10px] font-bold text-slate-700 rounded transition-colors text-center cursor-pointer"
                        >
                          {isHighAlarm ? 'Calibrate Bias' : 'Boost Laser'}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Do you wish to launch OTDR Fiber Cut Trace diagnostics on ${port.label}?`)) {
                              alert(`OTDR simulation: Fiber loop tested. Fiber cut distance trace: 3.42 Km core integrity.`);
                            }
                          }}
                          className="p-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded border border-indigo-100 cursor-pointer"
                          title="Simulate OTDR Fiber Cut Distance Trace"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Deploy OLT Modal */}
      <AnimatePresence>
        {showOltForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm">Deploy New GPON OLT Core Node</h3>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Configure chassis slots and optical SFP limits</span>
                </div>
                <button onClick={() => setShowOltForm(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddOltSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">OLT Node Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ZTE Sector 4 Base"
                    value={oltName}
                    onChange={(e) => setOltName(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">IP Core Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10.200.1.10"
                    value={oltIp}
                    onChange={(e) => setOltIp(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">OLT Chassis Hardware Model</label>
                  <select
                    value={oltModel}
                    onChange={(e) => setOltModel(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="ZTE ZXA10 C320 GPON">ZTE ZXA10 C320 GPON (Mini 2U)</option>
                    <option value="Huawei SmartAX EA5800 GPON/EPON">Huawei SmartAX EA5800 GPON/EPON</option>
                    <option value="BDCOM GP3600-08 GPON">BDCOM GP3600-08 GPON (8-Port)</option>
                    <option value="BDCOM GP3600-16 GPON">BDCOM GP3600-16 GPON (16-Port)</option>
                    <option value="BDCOM P3608 EPON">BDCOM P3608 EPON (8-Port)</option>
                    <option value="BDCOM P3616 EPON">BDCOM P3616 EPON (16-Port)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Chassis SFP PON Ports Count</label>
                  <input
                    type="number"
                    min={4}
                    max={16}
                    value={oltPorts}
                    onChange={(e) => setOltPorts(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">SSH Port *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 22"
                      value={oltSshPort}
                      onChange={(e) => setOltSshPort(Number(e.target.value))}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Username *</label>
                    <input
                      type="text"
                      required
                      placeholder="admin"
                      value={oltUsername}
                      onChange={(e) => setOltUsername(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Password</label>
                  <input
                    type="password"
                    placeholder="password"
                    value={oltPassword}
                    onChange={(e) => setOltPassword(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Initial Status</label>
                  <div className="flex gap-4 pt-1">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="oltStatusInput"
                        value="online"
                        checked={oltStatusInput === 'online'}
                        onChange={() => setOltStatusInput('online')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      Online
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="oltStatusInput"
                        value="offline"
                        checked={oltStatusInput === 'offline'}
                        onChange={() => setOltStatusInput('offline')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      Offline
                    </label>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowOltForm(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow transition-colors cursor-pointer"
                  >
                    Deploy Node
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deploy Mikrotik Modal */}
      <AnimatePresence>
        {showMtForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm">Deploy New Mikrotik CCR Router</h3>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">PPPoE core aggregation gateway</span>
                </div>
                <button onClick={() => setShowMtForm(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddMtSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Router Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Central PPPoE CCR1036"
                    value={mtName}
                    onChange={(e) => setMtName(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">IP Gateway Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10.100.0.1"
                    value={mtIp}
                    onChange={(e) => setMtIp(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Mikrotik Hardware Model</label>
                  <select
                    value={mtModel}
                    onChange={(e) => setMtModel(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Mikrotik CCR2004-16G-2S+">CCR2004-16G-2S+</option>
                    <option value="Mikrotik CCR1036-8G-2S+">CCR1036-8G-2S+</option>
                    <option value="Mikrotik RB4011iGS+RM">RB4011iGS+RM</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Winbox/API Port *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 8728"
                      value={mtPort}
                      onChange={(e) => setMtPort(Number(e.target.value))}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Username *</label>
                    <input
                      type="text"
                      required
                      placeholder="admin"
                      value={mtUsername}
                      onChange={(e) => setMtUsername(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Password</label>
                  <input
                    type="password"
                    placeholder="password"
                    value={mtPassword}
                    onChange={(e) => setMtPassword(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Initial Status</label>
                  <div className="flex gap-4 pt-1">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="mtStatusInput"
                        value="online"
                        checked={mtStatusInput === 'online'}
                        onChange={() => setMtStatusInput('online')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      Online
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="mtStatusInput"
                        value="offline"
                        checked={mtStatusInput === 'offline'}
                        onChange={() => setMtStatusInput('offline')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      Offline
                    </label>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowMtForm(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow transition-colors cursor-pointer"
                  >
                    Deploy Router
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
