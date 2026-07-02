import { Onu, Subscriber, Olt, Mikrotik, Invoice, Reseller, AreaName, SystemAlert } from '../types';

// Default mock data
export const defaultAreas: AreaName[] = [
  { id: 'ca-1', name: 'Downtown Sector-A', type: 'customer' },
  { id: 'ca-2', name: 'Greenwood Heights', type: 'customer' },
  { id: 'ca-3', name: 'Industrial Zone 4', type: 'customer' },
  { id: 'ca-4', name: 'Oceanview Avenue', type: 'customer' },
  { id: 'pa-1', name: 'Main POP Central', type: 'pop' },
  { id: 'pa-2', name: 'North Substation POP', type: 'pop' },
  { id: 'pa-3', name: 'East Boundary POP', type: 'pop' },
  { id: 'ra-1', name: 'Apex Reseller Area', type: 'reseller' },
  { id: 'ra-2', name: 'ByteSpeed Reseller Area', type: 'reseller' },
];

export const defaultMikrotiks: Mikrotik[] = [];

export const defaultOlts: Olt[] = [];

export const defaultOnus: Onu[] = [];

export const defaultSubscribers: Subscriber[] = [];

export const defaultInvoices: Invoice[] = [];

export const defaultResellers: Reseller[] = [
  {
    id: 'res-1',
    name: 'Apex Resellers',
    areaName: 'Apex Reseller Area',
    email: 'info@apexnet.com',
    phone: '+1 (555) 777-1111',
    balance: 450.0,
    creditLimit: 1000.0,
  },
  {
    id: 'res-2',
    name: 'ByteSpeed Resellers',
    areaName: 'ByteSpeed Reseller Area',
    email: 'billing@bytespeed.net',
    phone: '+1 (555) 888-2222',
    balance: -120.0, // Indebted
    creditLimit: 500.0,
  },
];

export const defaultAlerts: SystemAlert[] = [];

// Helper functions for persistent storage
const KEYS = {
  AREAS: 'isp_areas',
  MIKROTIKS: 'isp_mikrotiks',
  OLTS: 'isp_olts',
  ONUS: 'isp_onus',
  SUBSCRIBERS: 'isp_subscribers',
  INVOICES: 'isp_invoices',
  RESELLERS: 'isp_resellers',
  ALERTS: 'isp_alerts',
  AUTH: 'isp_admin_auth',
};

export function getStoredData() {
  const getOrSet = <T>(key: string, defaultValue: T): T => {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    try {
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  };

  return {
    areas: getOrSet<AreaName[]>(KEYS.AREAS, defaultAreas),
    mikrotiks: getOrSet<Mikrotik[]>(KEYS.MIKROTIKS, defaultMikrotiks),
    olts: getOrSet<Olt[]>(KEYS.OLTS, defaultOlts),
    onus: getOrSet<Onu[]>(KEYS.ONUS, defaultOnus),
    subscribers: getOrSet<Subscriber[]>(KEYS.SUBSCRIBERS, defaultSubscribers),
    invoices: getOrSet<Invoice[]>(KEYS.INVOICES, defaultInvoices),
    resellers: getOrSet<Reseller[]>(KEYS.RESELLERS, defaultResellers),
    alerts: getOrSet<SystemAlert[]>(KEYS.ALERTS, defaultAlerts),
  };
}

export function saveStoredData(data: {
  areas?: AreaName[];
  mikrotiks?: Mikrotik[];
  olts?: Olt[];
  onus?: Onu[];
  subscribers?: Subscriber[];
  invoices?: Invoice[];
  resellers?: Reseller[];
  alerts?: SystemAlert[];
}) {
  if (data.areas) localStorage.setItem(KEYS.AREAS, JSON.stringify(data.areas));
  if (data.mikrotiks) localStorage.setItem(KEYS.MIKROTIKS, JSON.stringify(data.mikrotiks));
  if (data.olts) localStorage.setItem(KEYS.OLTS, JSON.stringify(data.olts));
  if (data.onus) localStorage.setItem(KEYS.ONUS, JSON.stringify(data.onus));
  if (data.subscribers) localStorage.setItem(KEYS.SUBSCRIBERS, JSON.stringify(data.subscribers));
  if (data.invoices) localStorage.setItem(KEYS.INVOICES, JSON.stringify(data.invoices));
  if (data.resellers) localStorage.setItem(KEYS.RESELLERS, JSON.stringify(data.resellers));
  if (data.alerts) localStorage.setItem(KEYS.ALERTS, JSON.stringify(data.alerts));
}
