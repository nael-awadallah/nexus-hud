# NEXUS-7 AI HUD Dashboard

Cinematic AI control matrix with real-time data streaming, Three.js WebGL background,
holographic glass panels, and a full geolocation node network.

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Production Build

```bash
npm run build
npm start
```

## Stack

| Layer       | Tech                              |
|-------------|-----------------------------------|
| Framework   | Next.js 14 (App Router)           |
| 3D / WebGL  | Three.js + React Three Fiber      |
| Post FX     | @react-three/postprocessing       |
| Styling     | TailwindCSS + global CSS          |
| Charts      | Recharts + Canvas (waveform)      |
| Animation   | Framer Motion + GSAP-ready        |
| State       | Zustand                           |

## Project Structure

```
nexus-hud/
├── app/
│   ├── layout.tsx          # Root layout + metadata
│   ├── page.tsx            # Entry (dynamic import, no SSR)
│   └── globals.css         # HUD design system tokens
│
├── components/
│   ├── HUD/
│   │   ├── HUDLayout.tsx   # Grid orchestrator + data ticker
│   │   ├── TopBar.tsx      # Clock, mode toggle, uptime
│   │   ├── AICore.tsx      # Chip + rings + live stats
│   │   └── GlassPanel.tsx  # Reusable animated panel base
│   │
│   ├── Charts/
│   │   └── index.tsx       # LinePanel, BarPanel, WavePanel,
│   │                       # PiePanel, CircularProgressCluster
│   │
│   ├── Panels/
│   │   └── StatusPanel.tsx # System status with live dots
│   │
│   └── Geolocation/
│       └── GeoPanel.tsx    # SVG world map + node network
│                           # + interactive detail card
│
└── lib/
    ├── three/
    │   └── Scene.tsx       # WebGL canvas, particles,
    │                       # volumetric beams, post-processing
    └── store/
        └── hudStore.ts     # Zustand store + data simulation
```

## Geolocation Card

The geo panel features:
- **SVG world map** with equirectangular projection
- **8 distributed nodes** (Singapore, NY, London, Tokyo, Sydney, São Paulo, Amman, Dubai)
- **Live connection lines** between primaries and relays (dashed, glow on select)
- **Click any node** → animated detail card with lat/lng, ping, load bar
- **Pulse animation** on warn-status nodes
- **Status summary bar** (online / warn / offline counts)

## Data Modes

Toggle between **ALPHA** (cyan), **BETA** (violet), **DELTA** (green) — each
mode changes the color palette of all charts simultaneously via Zustand.

## Performance Notes

- Three.js particles use `InstancedMesh` (single draw call for 280 particles)
- Waveform uses raw Canvas API (bypasses React diffing)
- Charts lazy-loaded via `next/dynamic`
- `isAnimationActive={false}` on Recharts prevents redundant re-renders
- Zustand tick at 1Hz — heavy canvas redraws use `requestAnimationFrame`
