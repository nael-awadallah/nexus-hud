import { create } from "zustand";
import { INITIAL_GEO_NODES } from "../data/geoNodes";
import type {
  CommentarySource,
  DataMode,
  GeoNode,
  ModelStatus,
  ModelView,
  RemoteDataStatus,
  SystemStatus,
  VisitorLocation,
} from "../types/hud";

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
  modelStatus: ModelStatus;
  modelView: ModelView;
  modelAutospin: boolean;
  modelInteractions: number;
  lastModelGesture: string;
  visitorLocation: VisitorLocation | null;
  geoContextStatus: RemoteDataStatus;
  geoContextError: string | null;
  aiCommentary: string;
  aiCommentaryStatus: RemoteDataStatus;
  aiCommentarySource: CommentarySource;
  aiCommentaryUpdatedAt: string | null;
  aiCommentaryError: string | null;

  // Actions
  setMode: (mode: DataMode) => void;
  tick: () => void;
  selectGeoNode: (id: string | null) => void;
  setModelStatus: (status: ModelStatus) => void;
  setModelView: (view: ModelView) => void;
  toggleModelAutospin: () => void;
  registerModelGesture: (gesture: string) => void;
  setVisitorLocation: (visitorLocation: VisitorLocation | null) => void;
  setGeoContextStatus: (status: RemoteDataStatus, error?: string | null) => void;
  setAICommentary: (payload: {
    commentary: string;
    generatedAt: string;
    source: CommentarySource;
  }) => void;
  setAICommentaryStatus: (status: RemoteDataStatus, error?: string | null) => void;
}

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
  modelStatus: "booting",
  modelView: "orbit",
  modelAutospin: true,
  modelInteractions: 0,
  lastModelGesture: "Viewer link established",
  visitorLocation: null,
  geoContextStatus: "idle",
  geoContextError: null,
  aiCommentary: "Awaiting live telemetry commentary from the gateway.",
  aiCommentaryStatus: "idle",
  aiCommentarySource: "system",
  aiCommentaryUpdatedAt: null,
  aiCommentaryError: null,

  setMode: (mode) => set({ mode }),
  selectGeoNode: (id) => set({ geoSelected: id }),
  setModelStatus: (status) => set({ modelStatus: status }),
  setModelView: (view) => set({ modelView: view }),
  toggleModelAutospin: () => set((state) => ({ modelAutospin: !state.modelAutospin })),
  registerModelGesture: (gesture) =>
    set((state) => ({
      lastModelGesture: gesture,
      modelInteractions: state.modelInteractions + 1,
    })),
  setVisitorLocation: (visitorLocation) =>
    set((state) => ({
      visitorLocation,
      geoSelected: state.geoSelected ?? visitorLocation?.nearestNodeId ?? null,
      geoContextError: null,
    })),
  setGeoContextStatus: (status, error = null) =>
    set({
      geoContextStatus: status,
      geoContextError: error,
    }),
  setAICommentary: ({ commentary, generatedAt, source }) =>
    set({
      aiCommentary: commentary,
      aiCommentarySource: source,
      aiCommentaryUpdatedAt: generatedAt,
      aiCommentaryStatus: "ready",
      aiCommentaryError: null,
    }),
  setAICommentaryStatus: (status, error = null) =>
    set({
      aiCommentaryStatus: status,
      aiCommentaryError: error,
    }),

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
