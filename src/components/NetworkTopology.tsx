import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  Compass,
  Cpu,
  Database,
  Eye,
  MapPin,
  Maximize2,
  Minimize2,
  Power,
  RefreshCw,
  Router,
  Search,
  Settings,
  Shield,
  Zap
} from 'lucide-react';
import { Onu, Olt, Mikrotik, SystemAlert } from '../types';

interface NetworkTopologyProps {
  onus: Onu[];
  olts: Olt[];
  mikrotiks: Mikrotik[];
  alerts: SystemAlert[];
  onUpdateOnu: (onu: Onu) => void;
  onAddAlert: (alert: SystemAlert) => void;
  onResolveAlert: (id: string) => void;
}

export default function NetworkTopology({
  onus,
  olts,
  mikrotiks,
  alerts,
  onUpdateOnu,
  onAddAlert,
  onResolveAlert,
}: NetworkTopologyProps) {
  const [activeSubTab, setActiveSubTab] = useState<'otdr' | 'pon' | 'discover'>('otdr');
  const [selectedOnu, setSelectedOnu] = useState<Onu | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [discoveredOnus, setDiscoveredOnus] = useState<any[]>([]);
  const [selectedOltForScan, setSelectedOltForScan] = useState<string>(olts[0]?.id || '');
  
  // OTDR Trace State
  const [isTracing, setIsTracing] = useState(false);
  const [traceDistance, setTraceDistance] = useState<number | null>(null);
  const [traceLogs, setTraceLogs] = useState<string[]>([]);
  const [laserPowerLevel, setLaserPowerLevel] = useState<number>(2.3); // dBm

  // Live Location Coordinate Markers (Simulation)
  const popLocations = [
    { id: 'pop-1', name: 'Main POP Central', x: 200, y: 150, ip: '10.100.0.1' },
    { id: 'pop-2', name: 'North Substation POP', x: 450, y: 100, ip: '10.100.0.5' },
    { id: 'pop-3', name: 'East Boundary POP', x: 650, y: 320, ip: '10.100.0.10' },
  ];

  const fiberCuts = alerts.filter(a => a.type === 'fiber_cut' && !a.resolved);

  // OTDR Tracing Simulation
  const handleStartOtdrTrace = () => {
    setIsTracing(true);
    setTraceLogs([]);
    setTraceDistance(null);
    
    const logs = [
      'Initializing OTDR Pulse Generator...',
      'Sending optical wavelength 1310nm pulse via PON SFP+ Port 1...',
      'Measuring backscatter coefficient (dB/km)...',
      'Pulse reflection peak at 1.2 Km: Splice loss 0.15 dB (Normal)',
      'Analyzing Rayleigh scattering signal drop...',
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setTraceLogs(prev => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        // Simulate cut discovery
        const hasCut = fiberCuts.length > 0;
        if (hasCut) {
          const cutDist = fiberCuts[0].distanceKm || 3.42;
          setTraceDistance(cutDist);
          setTraceLogs(prev => [
            ...prev,
            `⚠️ SEVERE REFLECTION DROP DETECTED at ${cutDist} Km!`,
            `Status: Complete cable rupture (Fiber Cut) detected.`,
            `Trace Event: High attenuation threshold exceeded (-45.2 dB return peak).`,
            `Recommendation: Dispatch technician team to splice point between Main POP and East Boundary.`,
          ]);
        } else {
          setTraceDistance(0);
          setTraceLogs(prev => [
            ...prev,
            '✅ Trace Complete: No high-attenuation anomalies detected.',
            'Trace Event: End of fiber detected at 10.25 Km with standard splice reflections.',
          ]);
        }
        setIsTracing(false);
      }
    }, 1200);
  };

  // Live Discovery Scan Simulation
  const handleDiscoverOnus = () => {
    setIsScanning(true);
    setScanProgress(0);
    setDiscoveredOnus([]);

    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          // Found 2 new ONUs
          setDiscoveredOnus([
            {
              serialNumber: 'ZTEGC7788990',
              brand: 'ZTE',
              model: 'F670L Dual Band',
              status: 'unconfigured',
              rxPower: -18.2,
              distanceKm: 1.54,
            },
            {
              serialNumber: 'HWTC99887766',
              brand: 'Huawei',
              model: 'EG8141A5',
              status: 'unconfigured',
              rxPower: -20.5,
              distanceKm: 3.12,
            },
          ]);
          return 100;
        }
        return p + 20;
      });
    }, 500);
  };

  // Remote config laser and speeds
  const handleRemoteConfigure = (onu: Onu, rxPowerOffset: number, speedMbps: number) => {
    const updatedOnu: Onu = {
      ...onu,
      rxPower: Math.round((onu.rxPower + rxPowerOffset) * 10) / 10,
      configuredSpeed: speedMbps,
    };
    // Recalculate status and laser level
    if (updatedOnu.rxPower < -27) {
      updatedOnu.laserLevel = 'high';
    } else if (updatedOnu.rxPower < -31) {
      updatedOnu.laserLevel = 'critical';
      updatedOnu.status = 'offline';
    } else {
      updatedOnu.laserLevel = 'normal';
      updatedOnu.status = 'online';
    }

    onUpdateOnu(updatedOnu);
    setSelectedOnu(updatedOnu);

    // Create an alert if status becomes critical or warning
    if (updatedOnu.laserLevel === 'critical' || updatedOnu.laserLevel === 'high') {
      const severity = updatedOnu.laserLevel === 'critical' ? 'critical' as const : 'warning' as const;
      onAddAlert({
        id: `alt-remote-${Date.now()}`,
        timestamp: new Date().toISOString(),
        severity,
        message: `Remote configure warning: ONU ${updatedOnu.serialNumber} Rx Power deteriorated to ${updatedOnu.rxPower} dBm.`,
        resolved: false,
        type: 'laser_high',
      });
    }
  };

  // Provision newly discovered ONU
  const handleProvisionOnu = (newOnu: any, oltId: string, port: number) => {
    const provisioned: Onu = {
      id: `onu-gen-${Date.now()}`,
      serialNumber: newOnu.serialNumber,
      brand: newOnu.brand,
      model: newOnu.model,
      rxPower: newOnu.rxPower,
      txPower: 2.1,
      status: 'online',
      distanceKm: newOnu.distanceKm,
      laserLevel: 'normal',
      oltId: oltId,
      ponPort: port,
    };
    onUpdateOnu(provisioned);
    // Remove from discovered list
    setDiscoveredOnus(prev => prev.filter(o => o.serialNumber !== newOnu.serialNumber));

    // Log alert/notification
    onAddAlert({
      id: `alt-prov-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: 'info',
      message: `Successfully provisioned new ONU ${provisioned.serialNumber} on OLT SFP+ Pon Port ${port}.`,
      resolved: false,
      type: 'onu_offline',
    });
  };

  return (
    <div id="network-monitoring-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Topology Header & Stats */}
      <div className="lg:col-span-12 bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 id="monitoring-title" className="text-xl font-semibold text-slate-800">
              Live Network Diagnostics & OTDR Topology
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Active fiber optic loops, distance diagnostics, laser power control, and automatic ONU provisioner.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSubTab('otdr')}
              id="tab-otdr"
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                activeSubTab === 'otdr'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MapPin className="inline-block w-3.5 h-3.5 mr-1.5" />
              Live OTDR Fiber Map
            </button>
            <button
              onClick={() => setActiveSubTab('pon')}
              id="tab-pon"
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                activeSubTab === 'pon'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Zap className="inline-block w-3.5 h-3.5 mr-1.5" />
              PON Port Splicing
            </button>
            <button
              onClick={() => setActiveSubTab('discover')}
              id="tab-discover"
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                activeSubTab === 'discover'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Search className="inline-block w-3.5 h-3.5 mr-1.5" />
              ONU Autodiscover
              {discoveredOnus.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-[10px] text-white rounded-full font-bold animate-pulse">
                  {discoveredOnus.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mini stats cards inside monitoring bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-400 block">Total Active ONUs</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold text-slate-800">
                {onus.filter(o => o.status === 'online').length}
              </span>
              <span className="text-xs text-green-500 font-semibold">Online</span>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-400 block">Offline ONUs</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold text-slate-800">
                {onus.filter(o => o.status === 'offline').length}
              </span>
              <span className="text-xs text-red-500 font-semibold">Alarm active</span>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-400 block">Active Fiber Cuts</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold text-slate-800">{fiberCuts.length}</span>
              {fiberCuts.length > 0 ? (
                <span className="text-xs text-red-500 font-semibold animate-pulse">OTDR Cut Alert!</span>
              ) : (
                <span className="text-xs text-green-500 font-semibold">Cables intact</span>
              )}
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-xs text-slate-400 block">Critical Optical Transmit</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold text-slate-800">
                {onus.filter(o => o.laserLevel === 'high' || o.laserLevel === 'critical').length}
              </span>
              <span className="text-xs text-amber-500 font-semibold">High Loss</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Map View or PON view */}
      <div className="lg:col-span-8">
        <AnimatePresence mode="wait">
          {activeSubTab === 'otdr' && (
            <motion.div
              key="otdr-map"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center">
                  <Compass className="w-4 h-4 text-indigo-500 mr-1.5" />
                  Live Fiber Route Map & OTDR Laser Locator
                </h3>
                <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-[11px] font-medium flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                  Geographical Feed Live
                </span>
              </div>

              {/* Geographic SVG Map Container */}
              <div className="relative w-full h-[360px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between p-4">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:30px_30px] opacity-20" />

                {/* SVG Visual elements */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {/* Fiber cable lines connecting POPs */}
                  {/* POP 1 to POP 2 */}
                  <line
                    x1="200"
                    y1="150"
                    x2="450"
                    y2="100"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    strokeDasharray="6,4"
                    className="opacity-75"
                  />
                  {/* POP 2 to POP 3 */}
                  <line
                    x1="450"
                    y1="100"
                    x2="650"
                    y2="320"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    className="opacity-75"
                  />
                  {/* POP 1 to POP 3 (Main Core Loop with cut warning) */}
                  <line
                    x1="200"
                    y1="150"
                    x2="650"
                    y2="320"
                    stroke={fiberCuts.length > 0 ? '#ef4444' : '#10b981'}
                    strokeWidth="4"
                    strokeDasharray={fiberCuts.length > 0 ? '5,5' : 'none'}
                    className={fiberCuts.length > 0 ? 'animate-[dash_1s_linear_infinite]' : 'opacity-80'}
                  />

                  {/* Laser trace light pulse animation if tracing */}
                  {isTracing && (
                    <circle r="6" fill="#f43f5e" className="animate-[pulse_1s_infinite]">
                      <animateMotion
                        dur="3s"
                        repeatCount="indefinite"
                        path="M 200 150 L 650 320"
                      />
                    </circle>
                  )}

                  {/* Render Cut Location indicator if present */}
                  {fiberCuts.length > 0 && (
                    <g transform="translate(425, 235)">
                      <circle r="22" fill="#ef4444" fillOpacity="0.25" className="animate-ping" />
                      <circle r="10" fill="#ef4444" />
                      <path d="M-4,-4 L4,4 M4,-4 L-4,4" stroke="#ffffff" strokeWidth="2.5" />
                    </g>
                  )}
                </svg>

                {/* Overlay details */}
                <div className="relative flex justify-between items-start pointer-events-auto">
                  <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-lg text-xs font-mono text-slate-300 shadow-lg">
                    <span className="text-slate-400 font-semibold block mb-1">SYSTEM MONITOR</span>
                    <div>Tx Pulse: 1310/1550 nm</div>
                    <div>Laser Output: {laserPowerLevel} dBm</div>
                    <div>OTDR Baseline: -80 dBm</div>
                  </div>

                  {fiberCuts.length > 0 ? (
                    <div className="bg-red-950/90 backdrop-blur-md border border-red-800/80 p-2.5 rounded-lg text-xs font-mono text-red-200 shadow-lg max-w-xs">
                      <div className="flex items-center gap-1.5 text-red-400 font-bold mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
                        CRITICAL FAULT DETECTED
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Fiber link cut on Main Loop. OTDR estimates rupture distance at{' '}
                        <strong className="text-white font-bold underline">
                          {fiberCuts[0].distanceKm} Km
                        </strong>{' '}
                        from Main POP.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-emerald-950/90 backdrop-blur-md border border-emerald-800/80 p-2.5 rounded-lg text-xs font-mono text-emerald-200 shadow-lg">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <Shield className="w-4 h-4" />
                        ALL SYSTEMS STABLE
                      </div>
                      <span className="text-[10px] text-slate-400">Laser light levels within nominal tolerance</span>
                    </div>
                  )}
                </div>

                {/* SVG Pins for POPs (Geographic Locations) */}
                <div className="absolute inset-0 pointer-events-none">
                  {popLocations.map(pop => (
                    <div
                      key={pop.id}
                      className="absolute pointer-events-auto cursor-pointer"
                      style={{ left: `${pop.x}px`, top: `${pop.y}px` }}
                    >
                      <div className="group relative -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div className="p-2 bg-indigo-950 border border-indigo-400 text-indigo-300 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                          <Router className="w-4 h-4" />
                        </div>
                        <div className="mt-1 bg-slate-900 px-2 py-0.5 rounded text-[10px] font-mono text-slate-200 border border-slate-700 whitespace-nowrap shadow-md">
                          {pop.name}
                        </div>
                        {/* Tooltip */}
                        <div className="absolute bottom-12 scale-0 group-hover:scale-100 transition-all duration-150 origin-bottom bg-slate-900 border border-slate-700 text-[11px] p-2 rounded-lg text-slate-200 shadow-xl w-44 z-50 pointer-events-none">
                          <p className="font-bold text-indigo-400">{pop.name}</p>
                          <p className="mt-1 text-slate-400">IP: {pop.ip}</p>
                          <p className="text-slate-400">SFP+ Transceiver: Active</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Cut Location Floating Tag */}
                  {fiberCuts.length > 0 && (
                    <div className="absolute left-[425px] top-[260px] -translate-x-1/2 pointer-events-auto">
                      <div className="bg-red-500 text-white font-mono text-[10px] font-bold px-2 py-1 rounded shadow-md border border-red-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Rupture: {fiberCuts[0].distanceKm} Km
                      </div>
                    </div>
                  )}
                </div>

                {/* Control Panel inside Map */}
                <div className="relative flex justify-between items-end pointer-events-auto">
                  <div className="flex gap-2">
                    <button
                      onClick={handleStartOtdrTrace}
                      disabled={isTracing}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs py-2 px-3.5 rounded-lg shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Activity className={`w-3.5 h-3.5 ${isTracing ? 'animate-spin' : ''}`} />
                      {isTracing ? 'OTDR Scanning...' : 'Run OTDR Laser Trace'}
                    </button>
                    {fiberCuts.length > 0 && (
                      <button
                        onClick={() => onResolveAlert(fiberCuts[0].id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2 px-3.5 rounded-lg shadow-md transition-all flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Splice Cable (Clear Cut)
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Refractive Index (IOR): 1.4682
                  </span>
                </div>
              </div>

              {/* OTDR Output Log Console */}
              <div className="mt-4 bg-slate-950 border border-slate-900 rounded-lg p-3.5 font-mono text-xs text-slate-300">
                <div className="flex justify-between items-center mb-2 border-b border-slate-900 pb-1.5">
                  <span className="text-indigo-400 font-semibold flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    OTDR Real-time Pulse Console Output
                  </span>
                  <span className="text-[10px] text-slate-500">Wavelength: Dual 1310/1550nm</span>
                </div>
                <div className="h-28 overflow-y-auto space-y-1 text-slate-400 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                  {traceLogs.length === 0 ? (
                    <span className="text-slate-600 italic">Console idle. Click "Run OTDR Laser Trace" to measure optical reflection levels.</span>
                  ) : (
                    traceLogs.map((log, index) => {
                      const logStr = log || '';
                      const isAlert = logStr.includes('⚠️') || logStr.includes('Rupture') || logStr.includes('Cut') || logStr.includes('Recommendation');
                      const isSuccess = logStr.includes('✅') || logStr.includes('Complete');
                      return (
                        <div
                          key={index}
                          className={`${
                            isAlert ? 'text-rose-400 font-medium' : isSuccess ? 'text-emerald-400' : 'text-slate-300'
                          }`}
                        >
                          &gt; {log}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'pon' && (
            <motion.div
              key="pon-system"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center">
                  <Zap className="w-4 h-4 text-amber-500 mr-1.5" />
                  OLT SFP+ Splicing (PON Port to Port Splicing Diagram)
                </h3>
                <span className="text-xs text-slate-500">Select an OLT device to configure ports</span>
              </div>

              {/* Select OLT */}
              <div className="flex gap-2 mb-4">
                {olts.map(olt => (
                  <button
                    key={olt.id}
                    onClick={() => setSelectedOltForScan(olt.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      selectedOltForScan === olt.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {olt.name} ({olt.ponPortsCount} PON Ports)
                  </button>
                ))}
              </div>

              {/* PON Splitting Diagram */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-slate-700 uppercase">Core SFP+ Optical Distribution (ODF)</span>
                  <span className="text-[11px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                    Splicing ratio: 1:64 Splitter Enabled
                  </span>
                </div>

                <div className="relative min-h-[300px] flex flex-col md:flex-row justify-between items-center gap-6">
                  {/* Left: OLT Box */}
                  <div className="w-full md:w-1/4 bg-slate-900 text-white rounded-lg p-4 border border-slate-800 shadow-md">
                    <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold mb-3">
                      <Cpu className="w-3.5 h-3.5" />
                      OLT CORE MODULE
                    </div>
                    <span className="text-sm font-bold block truncate">
                      {olts.find(o => o.id === selectedOltForScan)?.name || 'OLT GPON'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                      IP: {olts.find(o => o.id === selectedOltForScan)?.ipAddress}
                    </span>

                    <div className="grid grid-cols-4 gap-1.5 mt-4">
                      {Array.from({ length: olts.find(o => o.id === selectedOltForScan)?.ponPortsCount || 8 }).map((_, i) => {
                        const portNum = i + 1;
                        const onusOnPort = onus.filter(o => o.oltId === selectedOltForScan && o.ponPort === portNum);
                        const hasOffline = onusOnPort.some(o => o.status === 'offline');
                        return (
                          <div
                            key={portNum}
                            className={`p-1.5 text-center rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                              onusOnPort.length === 0
                                ? 'bg-slate-800/50 border-slate-800 text-slate-600'
                                : hasOffline
                                ? 'bg-rose-950/80 text-rose-400 border-rose-800'
                                : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            }`}
                            title={`PON Port ${portNum}: ${onusOnPort.length} ONU(s) connected`}
                          >
                            P{portNum}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Middle: Optical Splitter Box */}
                  <div className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-lg shadow-sm w-36">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-xs">
                      1:8
                    </div>
                    <span className="text-xs font-bold text-slate-800 mt-2">Splitter Unit</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Primary Attenuation: 3.5dB</span>
                    <div className="w-full flex justify-between px-2 mt-3 text-[10px] font-mono text-slate-500 border-t pt-1.5">
                      <span>In: Port 1</span>
                      <span>Out: 5/8 Spliced</span>
                    </div>
                  </div>

                  {/* Right: Splice Targets (ONUs) */}
                  <div className="w-full md:w-5/12 space-y-2.5">
                    <span className="text-xs font-semibold text-slate-600 block">Spliced Optical Targets (ONU Terminal Nodes)</span>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {onus
                        .filter(o => o.oltId === selectedOltForScan)
                        .map(onu => (
                          <div
                            key={onu.id}
                            onClick={() => setSelectedOnu(onu)}
                            className={`p-2.5 rounded-lg border transition-all cursor-pointer flex justify-between items-center ${
                              selectedOnu?.id === onu.id
                                ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                                : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  onu.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                                }`}
                              />
                              <div>
                                <span className="text-xs font-mono font-bold text-slate-800 block">
                                  {onu.serialNumber}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  PON Port {onu.ponPort} • {onu.brand} {onu.model}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`text-[10px] font-mono font-bold block ${
                                  onu.rxPower < -27 ? 'text-amber-600' : 'text-slate-600'
                                }`}
                              >
                                {onu.rxPower} dBm
                              </span>
                              <span className="text-[9px] text-slate-400">
                                {onu.distanceKm} Km
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'discover' && (
            <motion.div
              key="discover-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center">
                  <Search className="w-4 h-4 text-emerald-500 mr-1.5" />
                  SFP+ GPON Auto-Discovery System (Zero-Touch Provisioning)
                </h3>
                <span className="text-xs text-slate-500">Scan PON channels for unconfigured ONU transceivers</span>
              </div>

              {isScanning ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                  <span className="text-sm font-medium text-slate-700">Scanning PON interfaces...</span>
                  <div className="w-64 bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-400 mt-2">{scanProgress}% completed</span>
                </div>
              ) : discoveredOnus.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center p-6">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800">No Unconfigured ONUs Pending</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    All connected optical nodes are fully spliced, configured, and bound to active subscribers.
                  </p>
                  <button
                    onClick={handleDiscoverOnus}
                    className="mt-4 px-4 py-2 bg-slate-900 text-white font-medium text-xs rounded-lg shadow hover:bg-slate-800 transition-all"
                  >
                    Initiate PON SFP+ Autodiscover Scan
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>
                      <strong>Found {discoveredOnus.length} Unconfigured Optical Network Units!</strong> Set PON port and click Provision to authorize internet connectivity.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {discoveredOnus.map((newOnu, index) => {
                      const [selectedPort, setSelectedPort] = useState<number>(1);
                      const [selectedOlt, setSelectedOlt] = useState<string>(olts[0]?.id || '');
                      return (
                        <div key={index} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <span className="text-xs font-bold text-indigo-600 font-mono block">
                                {newOnu.serialNumber}
                              </span>
                              <span className="text-xs font-medium text-slate-800 mt-0.5 block">
                                {newOnu.brand} {newOnu.model}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-semibold uppercase">
                              New Node
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 mb-4">
                            <div>Rx Power: <strong className="text-slate-800">{newOnu.rxPower} dBm</strong></div>
                            <div>Distance: <strong className="text-slate-800">{newOnu.distanceKm} Km</strong></div>
                          </div>

                          <div className="space-y-2 border-t pt-3">
                            <label className="text-[11px] font-bold text-slate-600 block">Select OLT Device</label>
                            <select
                              value={selectedOlt}
                              onChange={(e) => setSelectedOlt(e.target.value)}
                              className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500"
                            >
                              {olts.map(o => (
                                <option key={o.id} value={o.id}>{o.name}</option>
                              ))}
                            </select>

                            <label className="text-[11px] font-bold text-slate-600 block">PON Port Allocation</label>
                            <select
                              value={selectedPort}
                              onChange={(e) => setSelectedPort(Number(e.target.value))}
                              className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500"
                            >
                              {Array.from({ length: olts.find(o => o.id === selectedOlt)?.ponPortsCount || 8 }).map((_, i) => (
                                <option key={i + 1} value={i + 1}>PON SFP+ Channel {i + 1}</option>
                              ))}
                            </select>

                            <button
                              onClick={() => handleProvisionOnu(newOnu, selectedOlt, selectedPort)}
                              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2 rounded-lg shadow-sm transition-all"
                            >
                              Authorize & Splicing Provision
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Side: Remote Configure & Live Laser Diagnostics */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center">
              <Settings className="w-4 h-4 text-indigo-500 mr-1.5" />
              ONU Remote Configure (OLT CLI)
            </h3>
            {selectedOnu && (
              <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">
                Active Terminal
              </span>
            )}
          </div>

          {selectedOnu ? (
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-lg p-3.5 text-white font-mono text-xs">
                <div className="text-[10px] text-slate-400">ONU REMOTE TERMINAL CONTROLLER</div>
                <div className="text-indigo-400 font-bold mt-1.5">{selectedOnu.serialNumber}</div>
                <div className="text-[11px] text-slate-300 mt-1">Brand/Model: {selectedOnu.brand} {selectedOnu.model}</div>
                <div className="mt-2.5 pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                  <div>IP status: Spliced</div>
                  <div>Laser power: {selectedOnu.txPower} dBm</div>
                  <div>Distance: {selectedOnu.distanceKm} Km</div>
                  <div>Laser alert: <span className={selectedOnu.laserLevel !== 'normal' ? 'text-red-400 font-bold' : 'text-green-400'}>{selectedOnu.laserLevel.toUpperCase()}</span></div>
                </div>
              </div>

              {/* Adjust laser and speed sliders */}
              <div className="space-y-4 border-t pt-4">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                    <span>Optical Transmit Power</span>
                    <span className="text-indigo-600 font-mono text-[11px]">{selectedOnu.rxPower} dBm</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRemoteConfigure(selectedOnu, 1.5, selectedOnu.configuredSpeed || 50)}
                      className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold py-1.5 rounded transition-colors"
                      title="Increase optical level (improve signal)"
                    >
                      Boost Laser (+1.5dB)
                    </button>
                    <button
                      onClick={() => handleRemoteConfigure(selectedOnu, -2.5, selectedOnu.configuredSpeed || 50)}
                      className="flex-1 bg-rose-5 text-rose-700 text-[11px] font-semibold py-1.5 rounded hover:bg-rose-100 transition-colors"
                      title="Attenuate optical level"
                    >
                      Attenuate (-2.5dB)
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block leading-normal">
                    Improving transmit power will recalibrate laser transceivers inside the OLT ports directly.
                  </span>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                    <span>ONU Configured SFP+ Speed</span>
                    <span className="text-indigo-600 font-mono text-[11px]">
                      {selectedOnu.configuredSpeed || 50} Mbps
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[10, 30, 50, 100].map(speed => (
                      <button
                        key={speed}
                        onClick={() => handleRemoteConfigure(selectedOnu, 0, speed)}
                        className={`py-1 text-[11px] font-bold rounded font-mono ${
                          (selectedOnu.configuredSpeed || 50) === speed
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {speed}M
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                  <div className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <Power className="w-3.5 h-3.5 text-rose-500" />
                    PON Port Isolation Trigger
                  </div>
                  <p className="text-[10px] text-slate-500 mb-2">
                    Disconnect subscriber from GPON fiber completely. Useful for emergency isolations.
                  </p>
                  <button
                    onClick={() => {
                      const updated: Onu = {
                        ...selectedOnu,
                        status: selectedOnu.status === 'online' ? 'offline' : 'online',
                      };
                      onUpdateOnu(updated);
                      setSelectedOnu(updated);
                      onAddAlert({
                        id: `alt-state-${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        severity: updated.status === 'offline' ? 'critical' : 'info',
                        message: `GPON Port Isolation: ONU ${updated.serialNumber} set to ${updated.status.toUpperCase()} manually.`,
                        resolved: false,
                        type: 'onu_offline',
                      });
                    }}
                    className={`w-full py-1.5 rounded font-bold text-[11px] text-white shadow-sm ${
                      selectedOnu.status === 'online' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {selectedOnu.status === 'online' ? 'Disable ONU SFP Transceiver' : 'Enable ONU SFP Transceiver'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-lg">
              <Settings className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs">No active ONU terminal selected.</p>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] mx-auto">
                Select an ONU from the PON Splicing tab or subscribers grid to configure remotely.
              </p>
            </div>
          )}
        </div>

        {/* Live Device Hardware Status */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
            <Cpu className="w-4 h-4 text-emerald-500 mr-1.5" />
            Device Health (CPU & Memory)
          </h3>

          <div className="space-y-4">
            {/* OLTs summary list */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">OLT Core Modules</span>
              {olts.map(olt => (
                <div key={olt.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <div className="flex justify-between items-center mb-2 font-semibold text-slate-700">
                    <span>{olt.name}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      IP: {olt.ipAddress}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                        <span>CPU Usage</span>
                        <span>{olt.cpuUsage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${olt.cpuUsage}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                        <span>Memory Load</span>
                        <span>{olt.memoryUsage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-sky-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${olt.memoryUsage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mikrotiks list */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Mikrotik CCR Core Routers</span>
              {mikrotiks.map(mt => (
                <div key={mt.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <div className="flex justify-between items-center mb-2 font-semibold text-slate-700">
                    <span>{mt.name}</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                      IP: {mt.ipAddress}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                        <span>CPU Load</span>
                        <span>{mt.cpuUsage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${mt.cpuUsage}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                        <span>Memory Load</span>
                        <span>{mt.memoryUsage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-sky-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${mt.memoryUsage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
