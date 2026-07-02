export interface Onu {
  id: string;
  serialNumber: string;
  brand: string;
  model: string;
  rxPower: number; // dBm, e.g. -19.5 (normal is -15 to -25, worse than -27 is high laser/critical)
  txPower: number; // dBm, e.g. 2.1
  status: 'online' | 'offline';
  distanceKm: number;
  laserLevel: 'normal' | 'high' | 'critical';
  oltId: string;
  ponPort: number;
  configuredSpeed?: number;
}

export interface Subscriber {
  id: string;
  name: string;
  phone: string;
  areaName: string; // Customer Area Name
  popAreaName: string; // POP Area Name
  resellerName: string; // Reseller Name if reseller-bound (or empty)
  onuId: string; // Linked ONU
  ipAddress: string;
  connectionType: 'pppoe' | 'static';
  pppoeUsername?: string;
  pppoePassword?: string;
  billingStatus: 'active' | 'suspended';
  packageSpeed: number; // Mbps
  monthlyFee: number;
  billingCycleDay: number;
  oltId: string;
  oltPort: number;
  mikrotikId: string;
}

export interface Olt {
  id: string;
  name: string;
  model: string;
  ipAddress: string;
  ponPortsCount: number;
  status: 'online' | 'offline';
  cpuUsage: number;
  memoryUsage: number;
  uptimeSeconds: number;
  sshPort?: number;
  username?: string;
  password?: string;
}

export interface Mikrotik {
  id: string;
  name: string;
  model: string;
  ipAddress: string;
  status: 'online' | 'offline';
  cpuUsage: number;
  memoryUsage: number;
  uptimeSeconds: number;
  port?: number;
  username?: string;
  password?: string;
}

export interface Invoice {
  id: string;
  subscriberId: string;
  subscriberName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue';
  paidDate?: string;
}

export interface Reseller {
  id: string;
  name: string;
  areaName: string;
  email: string;
  phone: string;
  balance: number;
  creditLimit: number;
}

export interface AreaName {
  id: string;
  name: string;
  type: 'customer' | 'pop' | 'reseller';
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  resolved: boolean;
  type: 'fiber_cut' | 'laser_high' | 'olt_offline' | 'mikrotik_offline' | 'onu_offline' | 'billing_suspension';
  distanceKm?: number;
}
