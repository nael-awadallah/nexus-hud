import type { Config, Context } from "@netlify/edge-functions";
import { findNearestGeoNode } from "../../lib/data/geoNodes";
import type { GeoContextResponse } from "../../lib/netlify/contracts";

export default async function handler(_req: Request, context: Context) {
  const latitude = context.geo?.latitude ?? 31.95;
  const longitude = context.geo?.longitude ?? 35.93;
  const nearest = findNearestGeoNode(latitude, longitude);

  const payload: GeoContextResponse = {
    visitor: {
      city: context.geo?.city ?? "Amman",
      country: context.geo?.country?.name ?? "Jordan",
      region: context.geo?.subdivision?.name ?? null,
      timezone: context.geo?.timezone ?? null,
      latitude,
      longitude,
      nearestNodeId: nearest.node?.id ?? null,
      source: context.geo ? "edge" : "fallback",
    },
    nearestNodeName: nearest.node?.name ?? null,
    distanceKm: Number.isFinite(nearest.distanceKm) ? Math.round(nearest.distanceKm) : null,
  };

  return Response.json(payload, {
    headers: {
      "cache-control": "no-store",
    },
  });
}

export const config: Config = {
  path: "/api/geo-context",
};
