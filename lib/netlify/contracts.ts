import type { DataMode, GeoNode, VisitorLocation, CommentarySource } from "../types/hud";

export interface GeoContextResponse {
  visitor: VisitorLocation;
  nearestNodeName: string | null;
  distanceKm: number | null;
}

export interface CommentarySnapshot {
  mode: DataMode;
  uptime: number;
  stats: {
    neuralLoad: number;
    inferenceRate: number;
    coreTemp: number;
    entropyIdx: number;
    coherence: number;
  };
  geoNodes: Array<Pick<GeoNode, "id" | "name" | "type" | "status" | "ping" | "load">>;
  selectedNodeId: string | null;
  visitorLocation: Pick<VisitorLocation, "city" | "country" | "nearestNodeId"> | null;
}

export interface CommentaryResponse {
  commentary: string;
  generatedAt: string;
  source: CommentarySource;
}
