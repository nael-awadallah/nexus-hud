import type { GeoNode } from "../types/hud";

export const INITIAL_GEO_NODES: GeoNode[] = [
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

export function findNearestGeoNode(latitude: number, longitude: number, nodes = INITIAL_GEO_NODES) {
  let nearest: GeoNode | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const node of nodes) {
    const distance = haversineDistance(latitude, longitude, node.lat, node.lng);
    if (distance < nearestDistance) {
      nearest = node;
      nearestDistance = distance;
    }
  }

  return {
    node: nearest,
    distanceKm: nearestDistance,
  };
}

function haversineDistance(latA: number, lngA: number, latB: number, lngB: number) {
  const earthRadiusKm = 6371;
  const dLat = degToRad(latB - latA);
  const dLng = degToRad(lngB - lngA);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const a =
    sinLat * sinLat +
    Math.cos(degToRad(latA)) * Math.cos(degToRad(latB)) * sinLng * sinLng;

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function degToRad(value: number) {
  return (value * Math.PI) / 180;
}
