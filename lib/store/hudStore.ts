import { create } from "zustand";

export type DataMode = "alpha" | "beta" | "delta";

export interface GeoNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "primary" | "relay" | "sensor";
  status: "online" | "warn" | "offline";
  ping: number;
  load: number;
}

export interface SystemStatus {
  label: string;
  status: "online" | "warn" | "error";
}

export interface HUDState {
  mode: DataMode;
  lineData: number[];
  barData: number[];
  pieData: number[];
  circData: number[];
  stats: {
    neuralLoad: number;
    inferenceRate: number;
    coreTemp: number;
    entropyIdx: number;
    coherence: number;
  };
  geoNodes: GeoNode[];
  geoSelected: string | null;
  systemStatuses: SystemStatus[];
  uptime: number;
  flickering: boolean;

  // Actions
  setMode: (mode: DataMode) => void;
  tick: () => void;
  selectGeoNode: (id: string | null) => void;
}

const INITIAL_GEO_NODES: GeoNode[] = [
  {
    id: "sg01",
    name: "SINGAPORE-01",
    lat: 1.35,
    lng: 103.82,
    type: "primary",
    status: "online",
    ping: 12,
    load: 78,
  },
  {
    id: "ny02",
    name: "NEW YORK-02",
    lat: 40.71,
    lng: -74.01,
    type: "primary",
    status: "online",
    ping: 8,
    load: 62,
  },
  {
    id: "ld03",
    name: "LONDON-03",
    lat: 51.51,
    lng: -0.13,
    type: "relay",
    status: "online",
    ping: 15,
    load: 44,
  },
  {
    id: "tk04",
    name: "TOKYO-04",
    lat: 35.68,
    lng: 139.69,
    type: "relay",
    status: "warn",
    ping: 31,
    load: 91,
  },
  {
    id: "sy05",
    name: "SYDNEY-05",
    lat: -33.87,
    lng: 151.21,
    type: "sensor",
    status: "online",
    ping: 22,
    load: 35,
  },
  {
    id: "sa06",
    name: "SAO PAULO-06",
    lat: -23.55,
    lng: -46.63,
    type: "sensor",
    status: "online",
    ping: 44,
    load: 57,
  },
  {
    id: "am07",
    name: "AMMAN-07",
    lat: 31.95,
    lng: 35.93,
    type: "primary",
    status: "online",
    ping: 18,
    load: 83,
  },
  {
    id: "du08",
    name: "DUBAI-08",
    lat: 25.2,
    lng: 55.27,
    type: "relay",
    status: "warn",
    ping: 26,
    load: 71,
  },
];

const rng = (v: number, range: number) =>
  Math.min(99, Math.max(1, v + (Math.random() - 0.5) * range));

export const useHUDStore = create<HUDState>((set, get) => ({
  mode: "alpha",
  lineData: Array.from({ length: 60 }, () => Math.random() * 60 + 20),
  barData: [72, 55, 88, 41, 66, 93],
  pieData: [30, 22, 18, 17, 13],
  circData: [0.74, 0.62, 0.88],
  stats: {
    neuralLoad: 74,
    inferenceRate: 12.4,
    coreTemp: 38.2,
    entropyIdx: 0.0091,
    coherence: 99.7,
  },
  geoNodes: INITIAL_GEO_NODES,
  geoSelected: null,
  systemStatuses: [
    { label: "CORE MATRIX", status: "online" },
    { label: "QUANTUM LINK", status: "online" },
    { label: "DATA SYNC", status: "online" },
    { label: "FIREWALL", status: "online" },
    { label: "ANOMALY DET.", status: "warn" },
    { label: "THERMAL CTRL", status: "online" },
  ],
  uptime: 0,
  flickering: false,

  setMode: (mode) => set({ mode }),
  selectGeoNode: (id) => set({ geoSelected: id }),

  tick: () => {
    const s = get();
    const newLine = [...s.lineData.slice(1), rng(s.lineData[s.lineData.length - 1], 8)];
    set({
      uptime: s.uptime + 1,
      flickering: Math.random() < 0.03,
      lineData: newLine,
      barData: s.barData.map((v) => rng(v, 6)),
      circData: s.circData.map((v) =>
        Math.min(0.99, Math.max(0.1, v + (Math.random() - 0.5) * 0.025)),
      ),
      stats: {
        neuralLoad: Math.round(rng(s.stats.neuralLoad, 4)),
        inferenceRate: parseFloat((s.stats.inferenceRate + (Math.random() - 0.5) * 0.5).toFixed(1)),
        coreTemp: parseFloat(rng(s.stats.coreTemp, 0.5).toFixed(1)),
        entropyIdx: parseFloat((Math.random() * 0.009 + 0.0001).toFixed(4)),
        coherence: parseFloat(rng(s.stats.coherence, 0.2).toFixed(1)),
      },
      geoNodes: s.geoNodes.map((n) => ({
        ...n,
        ping: Math.round(rng(n.ping, 4)),
        load: Math.round(rng(n.load, 5)),
      })),
    });
  },
}));
