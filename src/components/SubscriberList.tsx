import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Settings,
  Phone,
  Cpu,
  Router,
  MapPin,
  Trash2,
  Edit3,
  Globe,
  Key,
  Shield,
  Zap,
  UserCheck,
  History,
  Folder,
  Wifi,
  Lock,
  Unlock,
  Terminal,
  Activity,
  Plus,
  Users,
  Database,
  Download
} from 'lucide-react';
import { Subscriber, Onu, Olt, Mikrotik } from '../types';

interface SubscriberListProps {
  subscribers: Subscriber[];
  onus: Onu[];
  olts: Olt[];
  mikrotiks: Mikrotik[];
  onAddSubscriber: (sub: Subscriber) => void;
  onUpdateSubscriber: (sub: Subscriber) => void;
  onDeleteSubscriber: (id: string) => void;
  initialShowForm?: boolean;
  initialFilterType?: 'all' | 'pppoe' | 'static';
  initialFilterStatus?: 'all' | 'active' | 'suspended';
  initialViewMode?: 'subscribers' | 'permissions' | 'groups' | 'logs' | 'tunnels';
  onCloseForm?: () => void;
}

export default function SubscriberList({
  subscribers,
  onus,
  olts,
  mikrotiks,
  onAddSubscriber,
  onUpdateSubscriber,
  onDeleteSubscriber,
  initialShowForm,
  initialFilterType,
  initialFilterStatus,
  initialViewMode,
  onCloseForm,
}: SubscriberListProps) {
  const [viewMode, setViewMode] = useState<'subscribers' | 'permissions' | 'groups' | 'logs' | 'tunnels'>(initialViewMode || 'subscribers');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pppoe' | 'static'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');
  
  // Create / Edit Form state
  const [showForm, setShowForm] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscriber | null>(null);

  // Advanced Mock Datasets (Persistent in LocalStorage)
  const [operators, setOperators] = useState(() => {
    const saved = localStorage.getItem('isp_operators');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { username: 'admin', role: 'Super Admin', status: 'active', lastLogin: '10 mins ago', permissions: ['olt_write', 'router_write', 'billing_write', 'users_write'] },
      { username: 'oper_west', role: 'NOC Operator', status: 'active', lastLogin: '2 hours ago', permissions: ['olt_read', 'router_read', 'users_write'] },
      { username: 'oper_east', role: 'NOC Operator', status: 'inactive', lastLogin: '1 day ago', permissions: ['olt_read', 'router_read', 'users_read'] },
      { username: 'billing_clerk', role: 'Billing Supervisor', status: 'active', lastLogin: '45 mins ago', permissions: ['billing_write', 'users_read'] },
    ];
  });

  const [userGroups, setUserGroups] = useState([
    { id: 'g-1', name: 'Downtown High-Speed Pool', subscriberCount: 4, averageSpeed: 80, ipPrefix: '172.16.1.0/24', router: 'Mikrotik CCR2004' },
    { id: 'g-2', name: 'Residential FTTH Basic', subscriberCount: 2, averageSpeed: 30, ipPrefix: '172.16.2.0/24', router: 'Mikrotik CCR1036' },
    { id: 'g-3', name: 'Reseller Apex Block', subscriberCount: 3, averageSpeed: 100, ipPrefix: '10.50.0.0/16', router: 'Mikrotik CCR2004' },
  ]);

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('isp_audit_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { id: 'l-e1', timestamp: '2026-07-02 11:21:05', operator: 'oper_east', action: 'ACL VIOLATION', detail: 'Attempted to delete root administrator account: PRIVILEGE_REQUIRED (Access Denied)', isError: true },
      { id: 'l-e2', timestamp: '2026-07-02 11:19:42', operator: 'unidentified', action: 'LOGIN FAIL', detail: 'Failed passkey validation attempt for user "admin" from IP 192.168.4.15', isError: true },
      { id: 'l-e3', timestamp: '2026-07-02 11:15:30', operator: 'billing_clerk', action: 'CONFIG FAIL', detail: 'Attempted to modify OLT PON port 2 settings: WRITE_NOT_AUTHORIZED (Access Denied)', isError: true },
      { id: 'l-e4', timestamp: '2026-07-02 11:12:11', operator: 'oper_west', action: 'IP CONFLICT', detail: 'Assigned conflicting IP 172.16.1.15 to Subscriber "Jane Doe". Reverted by gateway NAS', isError: true },
      { id: 'l-1', timestamp: '2026-07-02 10:48:15', operator: 'admin', action: 'NOC DECRYPT', detail: 'Successfully authenticated operator admin from IP 10.22.41.9', isError: false },
      { id: 'l-2', timestamp: '2026-07-02 10:49:02', operator: 'admin', action: 'OLT DISPATCH', detail: 'Configured Huawei EPON OLT 2 port 4 signal level thresholds', isError: false },
      { id: 'l-3', timestamp: '2026-07-02 10:50:33', operator: 'admin', action: 'USER CREATE', detail: 'Provisioned new subscriber: Robert Jenkins (ONU id: onu-1)', isError: false },
      { id: 'l-4', timestamp: '2026-07-02 10:51:12', operator: 'oper_west', action: 'TUNNEL START', detail: 'PPPoE Tunnel initialized for robert_jenkins, remote IP: 172.16.1.15', isError: false },
      { id: 'l-5', timestamp: '2026-07-02 10:52:01', operator: 'admin', action: 'FIBER TEST', detail: 'OTDR core loop trace analysis initialized', isError: false },
    ];
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('isp_operators', JSON.stringify(operators));
  }, [operators]);

  useEffect(() => {
    localStorage.setItem('isp_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const [pppoeHistory, setPppoeHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('isp_pppoe_history_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { id: 'psh-1', timestamp: '2026-07-02 11:45:12', userId: 'robert_jenkins', subscriberName: 'Robert Jenkins', duration: '14h 22m 05s', terminationCause: 'Manual Terminate (Kick)' },
      { id: 'psh-2', timestamp: '2026-07-02 10:30:45', userId: 'emily_watson', subscriberName: 'Emily Watson', duration: '03h 15m 22s', terminationCause: 'User request' },
      { id: 'psh-3', timestamp: '2026-07-02 09:12:11', userId: 'david_ocean', subscriberName: 'David Miller', duration: '24h 00m 00s', terminationCause: 'Billing Suspension' },
      { id: 'psh-4', timestamp: '2026-07-02 08:05:30', userId: 'sarah_connor', subscriberName: 'Sarah Connor', duration: '01h 45m 18s', terminationCause: 'Idle Timeout' },
      { id: 'psh-5', timestamp: '2026-07-01 23:50:11', userId: 'pppoe_9021', subscriberName: 'Jane Doe', duration: '12h 08m 44s', terminationCause: 'Carrier Loss' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('isp_pppoe_history_v2', JSON.stringify(pppoeHistory));
  }, [pppoeHistory]);

  // Log filter states
  const [logOperatorFilter, setLogOperatorFilter] = useState<string>('all');
  const [logTypeFilter, setLogTypeFilter] = useState<'all' | 'errors' | 'success'>('all');

  // Operators additional states
  const [operatorStatusFilter, setOperatorStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showOperatorFormModal, setShowOperatorFormModal] = useState(false);
  const [editingOperator, setEditingOperator] = useState<any | null>(null);

  // Operator modal fields
  const [opUsername, setOpUsername] = useState('');
  const [opRole, setOpRole] = useState('NOC Operator');
  const [opStatus, setOpStatus] = useState<'active' | 'inactive'>('active');
  const [opPermissions, setOpPermissions] = useState<string[]>(['olt_read', 'router_read', 'users_read']);

  const [newGroupForm, setNewGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupPrefix, setNewGroupPrefix] = useState('172.16.3.0/24');
  const [newGroupSpeed, setNewGroupSpeed] = useState(50);

  // Sync props to state dynamically
  useEffect(() => {
    if (initialViewMode) setViewMode(initialViewMode);
  }, [initialViewMode]);

  useEffect(() => {
    if (initialShowForm) {
      handleOpenCreate();
    } else {
      setShowForm(false);
    }
  }, [initialShowForm]);

  useEffect(() => {
    if (initialFilterType) setFilterType(initialFilterType);
  }, [initialFilterType]);

  useEffect(() => {
    if (initialFilterStatus) setFilterStatus(initialFilterStatus);
  }, [initialFilterStatus]);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [areaName, setAreaName] = useState('Downtown Sector-A');
  const [popAreaName, setPopAreaName] = useState('Main POP Central');
  const [resellerName, setResellerName] = useState('');
  const [connectionType, setConnectionType] = useState<'pppoe' | 'static'>('pppoe');
  const [pppoeUsername, setPppoeUsername] = useState('');
  const [pppoePassword, setPppoePassword] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [packageSpeed, setPackageSpeed] = useState<number>(30);
  const [monthlyFee, setMonthlyFee] = useState<number>(25);
  const [billingCycleDay, setBillingCycleDay] = useState<number>(1);
  const [oltId, setOltId] = useState('');
  const [oltPort, setOltPort] = useState<number>(1);
  const [mikrotikId, setMikrotikId] = useState('');

  // Open form for Create
  const handleOpenCreate = () => {
    setEditingSub(null);
    setName('');
    setPhone('');
    setAreaName('Downtown Sector-A');
    setPopAreaName('Main POP Central');
    setResellerName('');
    setConnectionType('pppoe');
    setPppoeUsername(`pppoe_${Math.floor(Math.random() * 9000 + 1000)}`);
    setPppoePassword('p@ss' + Math.floor(Math.random() * 900 + 100));
    setIpAddress(`172.16.${Math.floor(Math.random() * 254 + 1)}.${Math.floor(Math.random() * 254 + 1)}`);
    setPackageSpeed(30);
    setMonthlyFee(25);
    setBillingCycleDay(5);
    setOltId(olts[0]?.id || '');
    setOltPort(1);
    setMikrotikId(mikrotiks[0]?.id || '');
    setShowForm(true);
  };

  // Open form for Edit
  const handleOpenEdit = (sub: Subscriber) => {
    setEditingSub(sub);
    setName(sub.name);
    setPhone(sub.phone);
    setAreaName(sub.areaName);
    setPopAreaName(sub.popAreaName);
    setResellerName(sub.resellerName || '');
    setConnectionType(sub.connectionType);
    setPppoeUsername(sub.pppoeUsername || '');
    setPppoePassword(sub.pppoePassword || '');
    setIpAddress(sub.ipAddress);
    setPackageSpeed(sub.packageSpeed);
    setMonthlyFee(sub.monthlyFee);
    setBillingCycleDay(sub.billingCycleDay);
    setOltId(sub.oltId);
    setOltPort(sub.oltPort);
    setMikrotikId(sub.mikrotikId);
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !ipAddress) {
      alert('Please fill out all required fields.');
      return;
    }

    const subData: Subscriber = {
      id: editingSub ? editingSub.id : `sub-gen-${Date.now()}`,
      name,
      phone,
      areaName,
      popAreaName,
      resellerName,
      onuId: editingSub ? editingSub.onuId : `onu-gen-${Date.now()}`, // Linked ONU
      ipAddress,
      connectionType,
      pppoeUsername: connectionType === 'pppoe' ? pppoeUsername : undefined,
      pppoePassword: connectionType === 'pppoe' ? pppoePassword : undefined,
      billingStatus: editingSub ? editingSub.billingStatus : 'active',
      packageSpeed,
      monthlyFee,
      billingCycleDay,
      oltId,
      oltPort,
      mikrotikId,
    };

    if (editingSub) {
      onUpdateSubscriber(subData);
    } else {
      onAddSubscriber(subData);
    }
    setShowForm(false);
    if (onCloseForm) onCloseForm();
  };

  const handleToggleStatus = (sub: Subscriber) => {
    const updated: Subscriber = {
      ...sub,
      billingStatus: sub.billingStatus === 'active' ? 'suspended' : 'active',
    };
    onUpdateSubscriber(updated);
  };

  // Filter & Search subscribers
  const filteredSubscribers = subscribers.filter(sub => {
    const name = sub.name || '';
    const phone = sub.phone || '';
    const ipAddress = sub.ipAddress || '';
    const pppoeUsername = sub.pppoeUsername || '';

    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      ipAddress.includes(searchTerm) ||
      pppoeUsername.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || sub.connectionType === filterType;
    const matchesStatus = filterStatus === 'all' || sub.billingStatus === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div id="subscriber-management-section" className="space-y-6">
      
      {/* Sub-Navigation for User Management Modes */}
      <div className="bg-slate-900 text-white rounded-xl p-2 shadow-md flex flex-wrap gap-1.5 border border-slate-800">
        <button
          onClick={() => setViewMode('subscribers')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            viewMode === 'subscribers'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Subscribers Pool ({subscribers.length})
        </button>
        <button
          onClick={() => setViewMode('permissions')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            viewMode === 'permissions'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          User Permissions & ACL
        </button>
        <button
          onClick={() => setViewMode('groups')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            viewMode === 'groups'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Folder className="w-4 h-4" />
          User Groups & Pools
        </button>
        <button
          onClick={() => setViewMode('tunnels')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            viewMode === 'tunnels'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Wifi className="w-4 h-4" />
          Active PPPoE Tunnels
        </button>
        <button
          onClick={() => setViewMode('logs')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            viewMode === 'logs'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          NOC Audit Log
        </button>
      </div>

      {/* RENDER VIEW: SUBSCRIBERS */}
      {viewMode === 'subscribers' && (
        <div className="space-y-6">
          {/* Search and Action Bar */}
          <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search by name, phone, IP or PPPoE user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
              <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1 bg-slate-50">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    filterType === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setFilterType('pppoe')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    filterType === 'pppoe' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  PPPoE
                </button>
                <button
                  onClick={() => setFilterType('static')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    filterType === 'static' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Static IP
                </button>
              </div>

              <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1 bg-slate-50">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    filterStatus === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Status
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    filterStatus === 'active' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterStatus('suspended')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    filterStatus === 'suspended' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Suspended
                </button>
              </div>

              <button
                onClick={handleOpenCreate}
                id="btn-add-subscriber"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Add Subscriber
              </button>
            </div>
          </div>

          {/* Main Grid View of Subscribers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubscribers.map(sub => {
              const matchedOnu = onus.find(o => o.id === sub.onuId || o.serialNumber === sub.onuId);
              const matchedOlt = olts.find(o => o.id === sub.oltId);
              const matchedRouter = mikrotiks.find(m => m.id === sub.mikrotikId);
              const isSuspended = sub.billingStatus === 'suspended';

              return (
                <motion.div
                  key={sub.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white rounded-xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                    isSuspended ? 'border-rose-200 bg-rose-50/10' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm leading-tight">{sub.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">ID: {sub.id}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          onClick={() => handleToggleStatus(sub)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-sm ${
                            isSuspended
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                          title="Click to toggle account access"
                        >
                          {sub.billingStatus}
                        </span>
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {sub.packageSpeed} Mbps
                        </span>
                      </div>
                    </div>

                    {/* Sub Contact Details */}
                    <div className="space-y-1.5 border-t border-slate-100 pt-3 pb-3 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sub.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate" title={`POP: ${sub.popAreaName}`}>
                          {sub.areaName} ({sub.popAreaName})
                        </span>
                      </div>
                      {sub.resellerName && (
                        <div className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-indigo-600 font-medium">Reseller: {sub.resellerName}</span>
                        </div>
                      )}
                    </div>

                    {/* Network & Routing Bindings */}
                    <div className="space-y-2 bg-slate-50 rounded-lg p-3 text-[11px] font-mono text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Connection Mode:</span>
                        <span className="font-bold text-slate-800 uppercase">{sub.connectionType}</span>
                      </div>
                      {sub.connectionType === 'pppoe' ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Globe className="w-3 h-3" /> User:
                            </span>
                            <span className="font-bold text-indigo-600">{sub.pppoeUsername}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Key className="w-3 h-3" /> Pass:
                            </span>
                            <span>••••••••</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Static IPv4:</span>
                          <span className="font-bold text-slate-800">{sub.ipAddress}</span>
                        </div>
                      )}

                      {/* Hardware Diagnostics */}
                      <div className="border-t border-slate-200/60 mt-2 pt-2 space-y-1 text-[10px]">
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1">
                            <Cpu className="w-3 h-3 text-slate-400" /> OLT Node:
                          </span>
                          <span className="truncate max-w-[120px] text-right" title={matchedOlt?.name}>
                            {matchedOlt?.name || 'ZTE C320'} (Port {sub.oltPort})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1">
                            <Router className="w-3 h-3 text-slate-400" /> Gateway NAS:
                          </span>
                          <span className="truncate max-w-[120px] text-right" title={matchedRouter?.name}>
                            {matchedRouter?.name || 'Mikrotik'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>ONU Status:</span>
                          <span className="flex items-center gap-1 font-bold">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                matchedOnu?.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            />
                            {matchedOnu?.status === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        {matchedOnu && (
                          <div className="flex justify-between">
                            <span>ONU Rx Power:</span>
                            <span
                              className={`font-bold ${
                                matchedOnu.rxPower < -27 ? 'text-amber-600' : 'text-slate-700'
                              }`}
                            >
                              {matchedOnu.rxPower} dBm
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 border-t border-slate-100 mt-4 pt-3.5">
                    <button
                      onClick={() => handleOpenEdit(sub)}
                      className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold py-2 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Account
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to completely de-provision ${sub.name}?`)) {
                          onDeleteSubscriber(sub.id);
                        }
                      }}
                      className="px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-100 transition-colors flex items-center justify-center cursor-pointer"
                      title="De-provision Subscriber"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* RENDER VIEW: USER PERMISSIONS */}
      {viewMode === 'permissions' && (
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-6">
          
          {/* Operator Stats Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
            <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Total Core Operators</span>
              <span className="text-xl font-bold text-slate-800 mt-0.5 block">{operators.length} Registered</span>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100">
              <span className="text-[10px] text-green-500 font-bold block uppercase font-mono">Active Sessions</span>
              <span className="text-xl font-bold text-green-700 mt-0.5 block">{operators.filter(o => o.status === 'active').length} Active</span>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100">
              <span className="text-[10px] text-amber-500 font-bold block uppercase font-mono">Inactive Keys</span>
              <span className="text-xl font-bold text-slate-500 mt-0.5 block">{operators.filter(o => o.status !== 'active').length} Suspended</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Operator System Permissions</h3>
              <p className="text-xs text-slate-500 mt-0.5">Manage credentials, login restrictions, and system levels for active operators.</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Status Filter Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-1 text-xs">
                <button
                  onClick={() => setOperatorStatusFilter('all')}
                  className={`px-2.5 py-1 rounded font-bold ${operatorStatusFilter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  All ({operators.length})
                </button>
                <button
                  onClick={() => setOperatorStatusFilter('active')}
                  className={`px-2.5 py-1 rounded font-bold ${operatorStatusFilter === 'active' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-green-900'}`}
                >
                  Active ({operators.filter(o => o.status === 'active').length})
                </button>
                <button
                  onClick={() => setOperatorStatusFilter('inactive')}
                  className={`px-2.5 py-1 rounded font-bold ${operatorStatusFilter === 'inactive' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-rose-900'}`}
                >
                  Inactive ({operators.filter(o => o.status !== 'active').length})
                </button>
              </div>

              <button
                onClick={() => {
                  setEditingOperator(null);
                  setOpUsername('');
                  setOpRole('NOC Operator');
                  setOpStatus('active');
                  setOpPermissions(['olt_read', 'router_read', 'users_read']);
                  setShowOperatorFormModal(true);
                }}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Operator
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600 font-mono">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Operator Name</th>
                  <th className="p-3">Core Role</th>
                  <th className="p-3">Status Switch</th>
                  <th className="p-3">Last Access</th>
                  <th className="p-3">Authorization Tokens</th>
                  <th className="p-3">Error Tracing</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {operators
                  .filter(op => {
                    if (operatorStatusFilter === 'all') return true;
                    return op.status === operatorStatusFilter;
                  })
                  .map(op => (
                    <tr key={op.username} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-800 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div>
                          <span className="block font-bold">{op.username}</span>
                          <span className="text-[9px] text-slate-400 font-normal">System ID: op-{(op.username || '').slice(0, 3)}-{op.username.length}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-bold">{op.role}</span>
                      </td>
                      <td className="p-3">
                        <span 
                          onClick={() => {
                            // Easily toggle operator state
                            const updatedOps = operators.map(o => {
                              if (o.username === op.username) {
                                const nextStatus = o.status === 'active' ? 'inactive' : 'active';
                                return { ...o, status: nextStatus };
                              }
                              return o;
                            });
                            setOperators(updatedOps);
                            setAuditLogs([{
                              id: `l-${Date.now()}`,
                              timestamp: new Date().toISOString().replace('T',' ').slice(0,19),
                              operator: 'admin',
                              action: 'STATUS TOGGLE',
                              detail: `Changed status of operator "${op.username}" to ${op.status === 'active' ? 'inactive' : 'active'}`,
                              isError: false
                            }, ...auditLogs]);
                          }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer select-none border transition-all ${
                            op.status === 'active' 
                              ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                              : 'bg-rose-50 border-rose-150 text-rose-500 hover:bg-rose-100'
                          }`}
                          title="Click to toggle active session state"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${op.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-rose-400'}`} />
                          {op.status === 'active' ? 'Active Core' : 'Inactive / Suspended'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{op.lastLogin}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {['olt_write', 'router_write', 'billing_write', 'users_write'].map(p => {
                            const has = op.permissions.includes(p);
                            return (
                              <span
                                key={p}
                                onClick={() => {
                                  // Toggle permission
                                  const updatedOps = operators.map(o => {
                                    if (o.username === op.username) {
                                      const nextPerms = o.permissions.includes(p)
                                        ? o.permissions.filter(perm => perm !== p)
                                        : [...o.permissions, p];
                                      return { ...o, permissions: nextPerms };
                                    }
                                    return o;
                                  });
                                  setOperators(updatedOps);
                                  setAuditLogs([{
                                    id: `l-${Date.now()}`,
                                    timestamp: new Date().toISOString().replace('T',' ').slice(0,19),
                                    operator: 'admin',
                                    action: 'ACL UPDATE',
                                    detail: `Toggled permission ${p} for operator ${op.username}`,
                                    isError: false
                                  }, ...auditLogs]);
                                }}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold border cursor-pointer select-none transition-all flex items-center gap-0.5 ${
                                  has
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                    : 'bg-slate-50 border-slate-100 text-slate-300'
                                }`}
                                title="Click to toggle privilege"
                              >
                                {has ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                                {p.replace('_',' ')}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1 items-start">
                          <button
                            onClick={() => {
                              // Filter logs specifically to show errors / mistakes for this operator
                              setLogOperatorFilter(op.username);
                              setLogTypeFilter('errors');
                              setViewMode('logs');
                            }}
                            className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 px-2 py-0.5 rounded transition-all cursor-pointer inline-flex items-center gap-0.5"
                            title="See what mistakes this user made"
                          >
                            ⚠️ mistakes ({auditLogs.filter(l => l.operator === op.username && l.isError).length})
                          </button>
                          <button
                            onClick={() => {
                              // Filter logs for all actions for this operator
                              setLogOperatorFilter(op.username);
                              setLogTypeFilter('all');
                              setViewMode('logs');
                            }}
                            className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 hover:underline transition-all cursor-pointer"
                          >
                            All activity ({auditLogs.filter(l => l.operator === op.username).length})
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => {
                              setEditingOperator(op);
                              setOpUsername(op.username);
                              setOpRole(op.role);
                              setOpStatus(op.status);
                              setOpPermissions(op.permissions);
                              setShowOperatorFormModal(true);
                            }}
                            className="text-indigo-600 hover:underline font-bold cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (op.username === 'admin') {
                                alert('For system integrity, you cannot delete the default root admin account.');
                                return;
                              }
                              if (confirm(`Are you sure you want to completely remove operator "${op.username}" and invalidate their session keys?`)) {
                                setOperators(operators.filter(o => o.username !== op.username));
                                setAuditLogs([{
                                  id: `l-${Date.now()}`,
                                  timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
                                  operator: 'admin',
                                  action: 'OPERATOR PURGED',
                                  detail: `Successfully deleted operator ${op.username} from system and flushed access tokens.`,
                                  isError: false
                                }, ...auditLogs]);
                              }
                            }}
                            className="text-rose-600 hover:underline font-bold cursor-pointer"
                            title="Delete Operator Account"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER VIEW: USER GROUPS */}
      {viewMode === 'groups' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Subscriber Geographical Groups & IP Pools</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage static / dynamic route partitions, gateways, and subnets.</p>
              </div>
              <button
                onClick={() => setNewGroupForm(!newGroupForm)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Virtual IP Group
              </button>
            </div>

            {newGroupForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs"
              >
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Group Title</label>
                  <input
                    type="text"
                    placeholder="e.g. South Sector Fiber"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Allocated IPv4 Block</label>
                  <input
                    type="text"
                    placeholder="e.g. 172.16.5.0/24"
                    value={newGroupPrefix}
                    onChange={(e) => setNewGroupPrefix(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Bandwidth Limit (Mbps)</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={newGroupSpeed}
                    onChange={(e) => setNewGroupSpeed(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                <button
                  onClick={() => {
                    if (!newGroupName) {
                      alert('Please specify a group title.');
                      return;
                    }
                    setUserGroups([...userGroups, {
                      id: `g-${Date.now()}`,
                      name: newGroupName,
                      subscriberCount: 0,
                      averageSpeed: newGroupSpeed,
                      ipPrefix: newGroupPrefix,
                      router: 'Mikrotik CCR2004'
                    }]);
                    setNewGroupName('');
                    setNewGroupForm(false);
                  }}
                  className="p-2 bg-indigo-600 text-white font-bold rounded-lg text-center cursor-pointer hover:bg-indigo-700"
                >
                  Confirm Registration
                </button>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {userGroups.map(g => (
                <div key={g.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-3.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono tracking-wider">Virtual NAS Pool</span>
                      <h4 className="font-bold text-slate-800 text-xs mt-0.5">{g.name}</h4>
                    </div>
                    <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Folder className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-200/50 pt-3">
                    <div className="flex justify-between">
                      <span>Gateway IP Domain:</span>
                      <strong className="font-mono text-slate-800">{g.ipPrefix}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Target Bandwidth Peak:</span>
                      <strong className="font-mono text-indigo-600">{g.averageSpeed} Mbps</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Mapped Active Users:</span>
                      <span className="px-1.5 bg-indigo-100 text-indigo-800 rounded font-bold">{g.subscriberCount} Nodes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Associated Concentrator:</span>
                      <span className="text-slate-500">{g.router}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Do you wish to purge IP group ${g.name}?`)) {
                        setUserGroups(userGroups.filter(x => x.id !== g.id));
                      }
                    }}
                    className="w-full py-1.5 text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg border border-rose-100 transition-colors mt-2 cursor-pointer"
                  >
                    De-allocate Address Block
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW: ACTIVE TUNNELS */}
      {viewMode === 'tunnels' && (
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Active RouterOS PPPoE Sessions</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live tunnel sessions authenticated on Mikrotik CCR network access servers (NAS).</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              Live Feed Connected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscribers.filter(s => s.billingStatus === 'active').map(sub => {
              const matchedOnu = onus.find(o => o.id === sub.onuId || o.serialNumber === sub.onuId);
              // Mock active speeds
              const tx = Math.round((Math.random() * (sub.packageSpeed * 0.8) + 1.2) * 10) / 10;
              const rx = Math.round((Math.random() * (sub.packageSpeed * 0.1) + 0.5) * 10) / 10;
              return (
                <div key={sub.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-3 font-mono">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <h4 className="text-slate-200 font-bold text-xs">{sub.name}</h4>
                        <span className="text-[10px] text-slate-500">User: {sub.pppoeUsername || sub.id}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900">
                      PPPoE Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 text-[11px] text-slate-400">
                    <div>
                      <span className="text-[9px] text-slate-600 block">TUNNEL IP:</span>
                      <strong className="text-slate-300">{sub.ipAddress}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-600 block">MAC ADDR:</span>
                      <strong className="text-slate-300">D4:CA:6D:E1:{sub.id.slice(-2)}:4A</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-600 block">SESSION DURATION:</span>
                      <strong className="text-slate-300">06h 42m {Math.floor(Math.random() * 59)}s</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-600 block">LINK OPTICAL LEVEL:</span>
                      <strong className={`font-bold ${matchedOnu && matchedOnu.rxPower < -27 ? 'text-amber-500' : 'text-emerald-400'}`}>
                        {matchedOnu ? `${matchedOnu.rxPower} dBm` : '-19.4 dBm'}
                      </strong>
                    </div>
                  </div>

                  {/* Real-time speed charts */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>DOWN: <strong className="text-indigo-400">{tx} Mbps</strong> ({sub.packageSpeed}M Cap)</span>
                      <span>UP: <strong className="text-sky-400">{rx} Mbps</strong></span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(tx / sub.packageSpeed) * 100}%` }} />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Kick session for ${sub.name}? RouterOS will tear down the PPPoE connection state.`)) {
                        alert(`Dispatched POD packet to Mikrotik NAS. Tunnel cleared. Session re-authenticating...`);
                        const currentDur = `06h 42m ${Math.floor(Math.random() * 59)}s`;
                        setPppoeHistory(prev => [
                          {
                            id: `psh-${Date.now()}`,
                            timestamp: new Date().toISOString().replace('T',' ').slice(0,19),
                            userId: sub.pppoeUsername || sub.id,
                            subscriberName: sub.name,
                            duration: currentDur,
                            terminationCause: 'Manual Terminate (Kick)'
                          },
                          ...prev
                        ]);
                        setAuditLogs([{
                          id: `l-${Date.now()}`,
                          timestamp: new Date().toISOString().replace('T',' ').slice(0,19),
                          operator: 'admin',
                          action: 'TUNNEL KICK',
                          detail: `Cleared PPPoE active session for user ${sub.pppoeUsername || sub.name}`
                        }, ...auditLogs]);
                      }
                    }}
                    className="w-full py-2 bg-rose-950/40 border border-rose-800 text-rose-300 hover:bg-rose-950/60 font-bold rounded-lg text-center transition-colors text-[10px] cursor-pointer"
                  >
                    Terminate Core PPPoE Session
                  </button>
                </div>
              );
            })}
          </div>

          {/* PPPoE Session History Logs Section */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-500" />
                  PPPoE Session History Logs
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Historical log of terminated or dropped PPPoE client tunnels on this Node Controller.</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => {
                    if (pppoeHistory.length === 0) {
                      alert("No session history logs available to export.");
                      return;
                    }
                    const headers = ["Timestamp", "User ID / PPPoE Username", "Subscriber Name", "Tunnel Duration", "Session Termination Cause"];
                    const rows = pppoeHistory.map(item => [
                      item.timestamp || '',
                      item.userId || '',
                      item.subscriberName || '',
                      item.duration || '',
                      item.terminationCause || ''
                    ]);
                    const csvContent = [
                      headers.join(','),
                      ...rows.map(row => row.map(value => {
                        const escaped = String(value).replace(/"/g, '""');
                        return `"${escaped}"`;
                      }).join(','))
                    ].join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.setAttribute("href", url);
                    link.setAttribute("download", `pppoe_session_history_${new Date().toISOString().slice(0,10)}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    alert(`Successfully exported ${pppoeHistory.length} PPPoE logs as a downloadable CSV!`);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export History (CSV)
                </button>
                <button
                  onClick={() => {
                    const causes = ["User request", "Billing Suspension", "Idle Timeout", "Carrier Loss", "Manual Terminate (Kick)", "Mikrotik NAS reboot"];
                    const randomCause = causes[Math.floor(Math.random() * causes.length)];
                    const randomSub = subscribers[Math.floor(Math.random() * subscribers.length)] || { name: "Robert Jenkins", id: "sub-1", pppoeUsername: "robert_jenkins" };
                    const hrs = String(Math.floor(Math.random() * 24)).padStart(2, '0');
                    const mins = String(Math.floor(Math.random() * 60)).padStart(2, '0');
                    const secs = String(Math.floor(Math.random() * 60)).padStart(2, '0');
                    const randomDuration = `${hrs}h ${mins}m ${secs}s`;
                    const newLog = {
                      id: `psh-sim-${Date.now()}`,
                      timestamp: new Date().toISOString().replace('T',' ').slice(0,19),
                      userId: randomSub.pppoeUsername || randomSub.id,
                      subscriberName: randomSub.name,
                      duration: randomDuration,
                      terminationCause: randomCause
                    };
                    setPppoeHistory(prev => [newLog, ...prev]);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Simulate Event
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to clear all PPPoE session history logs?")) {
                      setPppoeHistory([]);
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 font-bold border border-slate-200 hover:border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Logs
                </button>
              </div>
            </div>

            {pppoeHistory.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                No session history logs recorded yet. Active sessions terminated by administrative action will appear here.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500 uppercase tracking-wider">
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Subscriber Name</th>
                      <th className="p-3">User ID / Username</th>
                      <th className="p-3">Tunnel Duration</th>
                      <th className="p-3">Termination Cause</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pppoeHistory.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 text-slate-500 font-mono">{item.timestamp}</td>
                        <td className="p-3 font-medium text-slate-800">{item.subscriberName}</td>
                        <td className="p-3 font-mono text-indigo-600 font-bold">{item.userId}</td>
                        <td className="p-3 text-slate-600 font-mono">{item.duration}</td>
                        <td className="p-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            item.terminationCause === 'Manual Terminate (Kick)' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                            item.terminationCause === 'Billing Suspension' ? 'bg-red-50 text-red-700 border-red-100' :
                            item.terminationCause === 'Carrier Loss' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            item.terminationCause === 'Idle Timeout' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                            item.terminationCause === 'User request' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                            'bg-indigo-50 text-indigo-700 border-indigo-100'
                          }`}>
                            {item.terminationCause}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENDER VIEW: AUDIT LOGS */}
      {viewMode === 'logs' && (() => {
        const filteredLogs = auditLogs.filter(log => {
          const matchesOperator = logOperatorFilter === 'all' || log.operator === logOperatorFilter;
          const matchesType = logTypeFilter === 'all' || 
            (logTypeFilter === 'errors' && log.isError) ||
            (logTypeFilter === 'success' && !log.isError);
          return matchesOperator && matchesType;
        });

        const totalMistakesCount = auditLogs.filter(l => l.isError).length;

        return (
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 shadow-2xl space-y-4 font-mono">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-5 h-5 text-indigo-400 animate-pulse" />
                <div>
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider">GPON NOC Core Command Audit Telemetry</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Continuous chronological log of operator activity on this GPON node controller.</p>
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => {
                    alert('Exported ' + filteredLogs.length + ' audit log entries into CSV formatted NOC attachment.');
                  }}
                  className="px-2.5 py-1 bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  EXPORT LOGS
                </button>
                <button
                  onClick={() => {
                    setAuditLogs([]);
                  }}
                  className="px-2.5 py-1 bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  CLEAR TERMINAL
                </button>
              </div>
            </div>

            {/* ERROR / MISTAKE SUMMARY BAR ("কে ভুল করলো ওই ইউজার এর লগ দেখা") */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-rose-400 font-bold block uppercase tracking-wider">🚨 NOC Mistakes Counter (ভুলসমূহ)</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-rose-500">{totalMistakesCount}</span>
                  <span className="text-[10px] text-slate-400">Security / Config violations detected</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">👤 Selected operator filter (ইউজার নির্বাচন)</span>
                <select
                  value={logOperatorFilter}
                  onChange={(e) => setLogOperatorFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-850 text-slate-200 text-[11px] rounded px-2.5 py-1.5 focus:outline-none w-full font-bold cursor-pointer"
                >
                  <option value="all">All Operators / Systems (সবাই)</option>
                  <option value="admin">Admin (রুট অ্যাডমিন)</option>
                  <option value="oper_west">Oper_West (পশ্চিম জোন)</option>
                  <option value="oper_east">Oper_East (পূর্ব জোন)</option>
                  <option value="billing_clerk">Billing_Clerk (বিলিং ক্লার্ক)</option>
                  <option value="unidentified">Unidentified (অজানা অনুপ্রবেশকারী)</option>
                </select>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">🔍 Filter by Action Type (কাজের ধরণ)</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setLogTypeFilter('all')}
                    className={`flex-1 py-1 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                      logTypeFilter === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    All Logs
                  </button>
                  <button
                    onClick={() => setLogTypeFilter('errors')}
                    className={`flex-1 py-1 text-[10px] font-bold rounded transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                      logTypeFilter === 'errors'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-rose-400 hover:bg-slate-700'
                    }`}
                    title="Filter only errors, violations and incorrect user input"
                  >
                    Mistakes ⚠️
                  </button>
                  <button
                    onClick={() => setLogTypeFilter('success')}
                    className={`flex-1 py-1 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                      logTypeFilter === 'success'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    Success
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Helper Banner */}
            <div className="bg-slate-900/30 p-2.5 rounded border border-slate-800/80 text-[10px] text-slate-400 flex justify-between items-center">
              <span>💡 Tip: Click on any Operator label inside the table below to filter logs to that operator instantly!</span>
              {logOperatorFilter !== 'all' && (
                <button
                  onClick={() => setLogOperatorFilter('all')}
                  className="text-indigo-400 hover:underline font-bold"
                >
                  Clear Operator Filter
                </button>
              )}
            </div>

            {/* Terminal Box */}
            <div className="bg-black/80 rounded-xl border border-slate-900 p-4 text-[11px] text-slate-300 space-y-2 h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-16 text-slate-600 italic">
                  No log entries matched your filter. Terminal is listening...
                </div>
              ) : (
                filteredLogs.map(log => (
                  <div
                    key={log.id}
                    className={`flex gap-2.5 items-start leading-relaxed select-text py-1 px-1.5 rounded transition-all ${
                      log.isError 
                        ? 'bg-rose-950/20 hover:bg-rose-950/30 border border-rose-950/30' 
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
                    
                    <span className={`px-1.5 py-0.1 rounded text-[9px] font-bold shrink-0 uppercase tracking-wider select-none ${
                      log.isError 
                        ? 'bg-rose-950 border border-rose-800 text-rose-300'
                        : (log.action || '').includes('KICK') || (log.action || '').includes('DELETE')
                        ? 'bg-amber-950 border border-amber-900 text-amber-300'
                        : (log.action || '').includes('CREATE') || (log.action || '').includes('ADD')
                        ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                        : 'bg-indigo-950 border border-indigo-900 text-indigo-300'
                    }`}>
                      {log.action}
                    </span>
                    
                    <span 
                      onClick={() => setLogOperatorFilter(log.operator)}
                      className="text-slate-400 font-bold shrink-0 cursor-pointer hover:text-white hover:underline transition-colors"
                      title="Filter logs by this operator"
                    >
                      ({log.operator}):
                    </span>
                    
                    <span className={`text-slate-300 ${log.isError ? 'text-rose-200' : ''}`}>
                      {log.detail}
                    </span>
                    
                    {log.isError && (
                      <span className="ml-auto text-[9px] text-rose-400 bg-rose-950/50 px-1 py-0.2 rounded border border-rose-900 font-bold select-none">
                        MISTAKE / ERROR
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })()}

      {/* Create / Edit Subscriber Dialog */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-xl border border-slate-100 shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              {/* Form Header */}
              <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-base">
                    {editingSub ? `Configure Subscriber: ${editingSub.name}` : 'Provision New Subscriber'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Set up SFP optical routes, IP assignment, PPPoE accounts, and billing structures.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    if (onCloseForm) onCloseForm();
                  }}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Details */}
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700 block">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700 block">Phone *</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700 block">Sector / Area Block</label>
                    <input
                      type="text"
                      required
                      value={areaName}
                      onChange={(e) => setAreaName(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700 block">Active POP Area</label>
                    <input
                      type="text"
                      required
                      value={popAreaName}
                      onChange={(e) => setPopAreaName(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700 block">Reseller Mapped (Optional)</label>
                    <input
                      type="text"
                      value={resellerName}
                      onChange={(e) => setResellerName(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      placeholder="Leave blank for direct subscriber"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700 block">NAS Connection Type</label>
                    <select
                      value={connectionType}
                      onChange={(e) => setConnectionType(e.target.value as 'pppoe' | 'static')}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="pppoe">PPPoE Tunnel (Dynamic/Static pool)</option>
                      <option value="static">Static IP Address allocation</option>
                    </select>
                  </div>

                  {connectionType === 'pppoe' ? (
                    <>
                      <div className="space-y-1 text-xs">
                        <label className="font-bold text-slate-700 block">PPPoE Authenticating User *</label>
                        <input
                          type="text"
                          required
                          value={pppoeUsername}
                          onChange={(e) => setPppoeUsername(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1 text-xs">
                        <label className="font-bold text-slate-700 block">PPPoE Passkey *</label>
                        <input
                          type="text"
                          required
                          value={pppoePassword}
                          onChange={(e) => setPppoePassword(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1 text-xs md:col-span-2">
                      <label className="font-bold text-slate-700 block">Allocated IPv4 Address *</label>
                      <input
                        type="text"
                        required
                        value={ipAddress}
                        onChange={(e) => setIpAddress(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                        placeholder="e.g. 172.16.1.15"
                      />
                    </div>
                  )}

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700 block">Access Package (Mbps)</label>
                    <input
                      type="number"
                      required
                      value={packageSpeed}
                      onChange={(e) => setPackageSpeed(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700 block">Tariff Monthly Fee ($)</label>
                    <input
                      type="number"
                      required
                      value={monthlyFee}
                      onChange={(e) => setMonthlyFee(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700 block">Billing Cycle Invoice Day</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={28}
                      value={billingCycleDay}
                      onChange={(e) => setBillingCycleDay(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700 block">Destination Core GPON OLT</label>
                    <select
                      value={oltId}
                      onChange={(e) => setOltId(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      {olts.map(o => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700 block">GPON PON Port</label>
                    <select
                      value={oltPort}
                      onChange={(e) => setOltPort(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                        <option key={p} value={p}>Port {p}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700 block">Mikrotik CCR Gateway</label>
                    <select
                      value={mikrotikId}
                      onChange={(e) => setMikrotikId(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      {mikrotiks.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      if (onCloseForm) onCloseForm();
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-md transition-colors cursor-pointer"
                  >
                    {editingSub ? 'Save Modifications' : 'Provision Subscriber'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showOperatorFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden text-left"
            >
              <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-base">
                    {editingOperator ? `Edit Operator: ${editingOperator.username}` : 'Create New Operator Account'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure operator level, ACL privileges, and status.
                  </p>
                </div>
                <button
                  onClick={() => setShowOperatorFormModal(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!opUsername.trim()) return;

                const uname = opUsername.trim().toLowerCase();

                if (editingOperator) {
                  // editing
                  setOperators(operators.map((o: any) => o.username === editingOperator.username ? {
                    ...o,
                    username: uname,
                    role: opRole,
                    status: opStatus,
                    permissions: opPermissions
                  } : o));
                  setAuditLogs([{
                    id: `l-${Date.now()}`,
                    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
                    operator: 'admin',
                    action: 'OPERATOR CONFIG',
                    detail: `Modified operator details & ACL for ${uname}`,
                    isError: false
                  }, ...auditLogs]);
                } else {
                  // creating
                  if (operators.some((o: any) => o.username === uname)) {
                    alert('Operator username already exists!');
                    return;
                  }
                  setOperators([...operators, {
                    username: uname,
                    role: opRole,
                    status: opStatus,
                    lastLogin: 'Never',
                    permissions: opPermissions
                  }]);
                  setAuditLogs([{
                    id: `l-${Date.now()}`,
                    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
                    operator: 'admin',
                    action: 'OPERATOR CREATE',
                    detail: `Successfully created operator "${uname}" with role "${opRole}"`,
                    isError: false
                  }, ...auditLogs]);
                }

                setShowOperatorFormModal(false);
              }} className="p-6 space-y-4">
                
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Operator Username *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingOperator}
                    value={opUsername}
                    onChange={(e) => setOpUsername(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50 font-mono"
                    placeholder="e.g. oper_north"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Core Role</label>
                  <select
                    value={opRole}
                    onChange={(e) => setOpRole(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="NOC Operator">NOC Operator</option>
                    <option value="Billing Supervisor">Billing Supervisor</option>
                  </select>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 block">Operator Session Status</label>
                  <select
                    value={opStatus}
                    onChange={(e) => setOpStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="active">Active (Access Allowed)</option>
                    <option value="inactive">Inactive (Suspended Keys)</option>
                  </select>
                </div>

                <div className="space-y-2 text-xs">
                  <label className="font-bold text-slate-700 block">ACL Authorization Tokens</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {['olt_read', 'olt_write', 'router_read', 'router_write', 'billing_read', 'billing_write', 'users_read', 'users_write'].map(perm => {
                      const has = opPermissions.includes(perm);
                      return (
                        <label key={perm} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-white transition-all select-none">
                          <input
                            type="checkbox"
                            checked={has}
                            onChange={() => {
                              if (has) {
                                setOpPermissions(opPermissions.filter(p => p !== perm));
                              } else {
                                setOpPermissions([...opPermissions, perm]);
                              }
                            }}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="font-mono text-[10px] text-slate-700">{perm.replace('_', ' ')}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t mt-6">
                  <button
                    type="button"
                    onClick={() => setShowOperatorFormModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-md transition-colors cursor-pointer"
                  >
                    {editingOperator ? 'Save Core Configuration' : 'Provision Operator'}
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
