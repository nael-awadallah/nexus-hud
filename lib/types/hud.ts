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

export type ModelStatus = "booting" | "ready" | "error";
export type ModelView = "orbit" | "focus";

export type RemoteDataStatus = "idle" | "loading" | "ready" | "error";
export type CommentarySource = "ai-gateway" | "fallback" | "system";

export interface VisitorLocation {
  city: string | null;
  country: string | null;
  region: string | null;
  timezone: string | null;
  latitude: number;
  longitude: number;
  nearestNodeId: string | null;
  source: "edge" | "fallback";
}
