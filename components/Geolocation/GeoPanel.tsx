'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassPanel from '../HUD/GlassPanel'
import { useHUDStore } from '@/lib/store/hudStore'
import type { GeoNode } from '@/lib/types/hud'

// Equirectangular projection: lng/lat → svg x/y within a 320×160 map
const MAP_W = 320, MAP_H = 155
function project(lat: number, lng: number): [number, number] {
  const x = ((lng + 180) / 360) * MAP_W
  const y = ((90 - lat) / 180) * MAP_H
  return [x, y]
}

const STATUS_COLORS: Record<string, string> = {
  online:  '#00ff88',
  warn:    '#ffaa00',
  offline: '#ff4455',
}
const TYPE_LABELS: Record<string, string> = {
  primary: 'PRI',
  relay:   'RLY',
  sensor:  'SNS',
}

// Simplified world coastline paths (SVG path data, simplified for HUD aesthetic)
const WORLD_PATHS = `
M40,58 L52,52 L65,50 L70,55 L68,62 L60,68 L52,65 Z
M72,48 L85,44 L100,46 L108,52 L112,60 L106,68 L98,72 L88,70 L80,65 L74,58 Z
M112,52 L125,48 L138,50 L145,56 L148,64 L140,70 L130,72 L118,68 L112,60 Z
M148,46 L162,42 L175,44 L182,50 L185,58 L178,66 L165,68 L152,62 Z
M185,50 L198,46 L210,48 L216,54 L218,62 L210,68 L198,66 L186,60 Z
M218,44 L232,40 L245,42 L250,48 L252,56 L245,62 L232,60 L220,54 Z
M68,74 L78,70 L88,72 L92,80 L88,88 L78,90 L68,86 Z
M162,72 L175,68 L188,70 L195,78 L193,86 L182,90 L170,88 L160,80 Z
M195,78 L205,74 L215,76 L220,84 L218,92 L208,96 L196,92 Z
M108,90 L120,86 L132,88 L138,96 L135,104 L124,108 L112,104 L106,96 Z
M220,64 L232,60 L242,62 L248,70 L246,78 L236,82 L224,78 L218,70 Z
M242,72 L254,68 L265,70 L270,78 L268,86 L258,90 L245,86 L240,78 Z
M265,74 L278,70 L290,72 L295,80 L292,88 L282,92 L270,88 L263,80 Z
M145,98 L158,94 L170,96 L174,104 L172,112 L160,116 L148,112 L142,104 Z
M40,78 L52,74 L64,76 L68,84 L66,92 L56,96 L44,92 L38,84 Z
`

export default function GeoPanel() {
  const { geoNodes, geoSelected, selectGeoNode, visitorLocation, geoContextStatus } = useHUDStore()
  const [pulseFrame, setPulseFrame] = useState(0)
  const [connections, setConnections] = useState<[string,string][]>([])

  useEffect(() => {
    const t = setInterval(() => setPulseFrame(f => f + 1), 800)
    return () => clearInterval(t)
  }, [])

  // Build connection lines between primaries and relays
  useEffect(() => {
    const primaries = geoNodes.filter(n => n.type === 'primary').map(n => n.id)
    const relays = geoNodes.filter(n => n.type === 'relay').map(n => n.id)
    const conns: [string,string][] = []
    primaries.forEach(p => relays.forEach(r => conns.push([p, r])))
    setConnections(conns)
  }, [geoNodes])

  const selectedNode = geoSelected ? geoNodes.find(n => n.id === geoSelected) : null
  const visitorCoords = visitorLocation ? project(visitorLocation.latitude, visitorLocation.longitude) : null

  return (
    <GlassPanel delay={0.45} className="col-span-full"
      style={{ gridColumn: '1 / -1' }}>
      <div className="panel-label">GEO-DISTRIBUTED NODE NETWORK</div>

      <div className="flex gap-3 px-3 pb-3" style={{ minHeight: 220 }}>
        {/* SVG World Map */}
        <div className="relative flex-1 rounded-lg overflow-hidden"
          style={{ background: 'rgba(0,8,18,0.6)', border: '1px solid rgba(0,234,255,0.12)' }}>

          <svg
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            <defs>
              <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(0,60,100,0.3)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <filter id="nodeGlow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Background glow */}
            <rect width={MAP_W} height={MAP_H} fill="url(#mapGlow)" />

            {/* Grid lines */}
            {[30,60,90,120,150,180,210,240,270,300].map(x => (
              <line key={`gx${x}`} x1={x} y1={0} x2={x} y2={MAP_H}
                stroke="rgba(0,234,255,0.05)" strokeWidth={0.5} />
            ))}
            {[40,80,120].map(y => (
              <line key={`gy${y}`} x1={0} y1={y} x2={MAP_W} y2={y}
                stroke="rgba(0,234,255,0.05)" strokeWidth={0.5} />
            ))}

            {/* Simplified world land masses */}
            <path d={WORLD_PATHS}
              fill="rgba(0,80,120,0.25)" stroke="rgba(0,234,255,0.18)" strokeWidth={0.5} />

            {/* Connection lines */}
            {connections.map(([a, b]) => {
              const na = geoNodes.find(n => n.id === a)
              const nb = geoNodes.find(n => n.id === b)
              if (!na || !nb) return null
              const [ax, ay] = project(na.lat, na.lng)
              const [bx, by] = project(nb.lat, nb.lng)
              const isActive = geoSelected === a || geoSelected === b
              return (
                <line key={`${a}-${b}`}
                  x1={ax} y1={ay} x2={bx} y2={by}
                  stroke={isActive ? 'rgba(0,234,255,0.5)' : 'rgba(0,234,255,0.12)'}
                  strokeWidth={isActive ? 0.8 : 0.4}
                  strokeDasharray="3 3"
                />
              )
            })}

            {/* Node markers */}
            {geoNodes.map(node => {
              const [x, y] = project(node.lat, node.lng)
              const col = STATUS_COLORS[node.status]
              const isSelected = geoSelected === node.id
              const pulse = (pulseFrame % 3 === 0) && node.status === 'warn'

              return (
                <g key={node.id} style={{ cursor: 'pointer' }}
                  onClick={() => selectGeoNode(isSelected ? null : node.id)}
                  filter="url(#nodeGlow)">
                  {/* Ping ring */}
                  <circle cx={x} cy={y} r={isSelected ? 10 : 7}
                    fill="none" stroke={col}
                    strokeWidth={0.5} opacity={0.3}
                    style={{ transition: 'r 0.3s ease' }}
                  />
                  {/* Pulse animation for warn */}
                  {pulse && (
                    <circle cx={x} cy={y} r={12}
                      fill="none" stroke={col} strokeWidth={0.5} opacity={0.2} />
                  )}
                  {/* Core dot */}
                  <circle cx={x} cy={y} r={isSelected ? 4 : 3}
                    fill={col} opacity={isSelected ? 1 : 0.85}
                    style={{ transition: 'r 0.2s ease' }}
                  />
                  {/* Label */}
                  <text x={x} y={y - 8} textAnchor="middle"
                    fontFamily="Courier New" fontSize={5}
                    fill="rgba(0,234,255,0.6)" letterSpacing={0.5}>
                    {node.name.split('-')[0]}
                  </text>
                </g>
              )
            })}

            {visitorCoords && (
              <g aria-label="Visitor geolocation marker">
                <circle cx={visitorCoords[0]} cy={visitorCoords[1]} r={15}
                  fill="none" stroke="rgba(217,245,255,0.28)" strokeWidth={0.7}
                  className="geo-pin" />
                <circle cx={visitorCoords[0]} cy={visitorCoords[1]} r={6}
                  fill="rgba(217,245,255,0.96)" opacity={0.95} />
                <circle cx={visitorCoords[0]} cy={visitorCoords[1]} r={2.4}
                  fill="#08131d" opacity={0.88} />
                <text x={visitorCoords[0]} y={visitorCoords[1] + 19} textAnchor="middle"
                  fontFamily="Courier New" fontSize={5.2}
                  fill="rgba(217,245,255,0.9)" letterSpacing={0.7}>
                  YOU ARE HERE
                </text>
              </g>
            )}
          </svg>

          {/* Map corner labels */}
          <div className="absolute top-1 left-2" style={{ fontSize: 7, color: 'rgba(0,234,255,0.25)', letterSpacing: '0.1em' }}>
            90°N
          </div>
          <div className="absolute bottom-1 left-2" style={{ fontSize: 7, color: 'rgba(0,234,255,0.25)', letterSpacing: '0.1em' }}>
            90°S
          </div>
          <div className="absolute top-1 right-2" style={{ fontSize: 7, color: 'rgba(0,234,255,0.25)', letterSpacing: '0.1em' }}>
            180°E
          </div>
          <div className="absolute left-2 bottom-2 geo-visitor-chip">
            {visitorLocation
              ? `${visitorLocation.city ?? 'UNKNOWN'} / ${visitorLocation.country ?? 'UNMAPPED'}`
              : geoContextStatus === 'loading'
                ? 'LOCATING VISITOR...'
                : 'VISITOR GEO UNAVAILABLE'}
          </div>
        </div>

        {/* Node list + detail */}
        <div className="flex flex-col gap-2" style={{ width: 180, flexShrink: 0 }}>
          {/* Node list */}
          <div className="flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: 140 }}>
            {geoNodes.map(node => (
              <NodeRow key={node.id} node={node}
                selected={geoSelected === node.id}
                onSelect={() => selectGeoNode(geoSelected === node.id ? null : node.id)} />
            ))}
          </div>

          {/* Detail card */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.25 }}
                className="rounded-lg p-3 flex-1"
                style={{
                  background: 'rgba(0,18,32,0.85)',
                  border: `1px solid ${STATUS_COLORS[selectedNode.status]}44`,
                  boxShadow: `0 0 14px ${STATUS_COLORS[selectedNode.status]}22`,
                }}
              >
                <div style={{ fontSize: 8, letterSpacing: '0.15em', color: STATUS_COLORS[selectedNode.status], marginBottom: 6 }}>
                  ● {selectedNode.status.toUpperCase()} NODE
                </div>
                <div style={{ fontSize: 10, color: '#00eaff', letterSpacing: '0.1em', marginBottom: 8, fontWeight: 'bold' }}>
                  {selectedNode.name}
                </div>
                <div style={{ fontSize: 8, color: 'rgba(0,234,255,0.4)', marginBottom: 4, letterSpacing: '0.1em' }}>
                  {selectedNode.lat.toFixed(2)}°, {selectedNode.lng.toFixed(2)}°
                </div>

                <div className="space-y-1" style={{ marginTop: 8 }}>
                  {[
                    { k: 'TYPE',    v: TYPE_LABELS[selectedNode.type] },
                    { k: 'PING',    v: `${selectedNode.ping}ms` },
                    { k: 'LOAD',    v: `${selectedNode.load}%` },
                  ].map(({ k, v }) => (
                    <div key={k} className="flex justify-between" style={{ fontSize: 9 }}>
                      <span style={{ color: 'rgba(0,234,255,0.4)', letterSpacing: '0.1em' }}>{k}</span>
                      <span style={{ color: '#00eaff' }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Load bar */}
                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 3, background: 'rgba(0,234,255,0.1)', borderRadius: 2 }}>
                    <div style={{
                      height: '100%', borderRadius: 2,
                      width: `${selectedNode.load}%`,
                      background: selectedNode.load > 80
                        ? '#ffaa00'
                        : STATUS_COLORS[selectedNode.status],
                      transition: 'width 0.5s ease',
                      boxShadow: `0 0 6px ${STATUS_COLORS[selectedNode.status]}`,
                    }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedNode && (
            <div className="flex-1 flex items-center justify-center"
              style={{ fontSize: 8, color: 'rgba(0,234,255,0.25)', letterSpacing: '0.12em', textAlign: 'center' }}>
              SELECT NODE<br />FOR DETAILS
            </div>
          )}
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center gap-4 px-3 pb-2"
        style={{ borderTop: '1px solid rgba(0,234,255,0.08)', paddingTop: 6 }}>
        {['online','warn','offline'].map(s => {
          const count = geoNodes.filter(n => n.status === s).length
          return (
            <div key={s} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full"
                style={{ background: STATUS_COLORS[s], boxShadow: `0 0 4px ${STATUS_COLORS[s]}` }} />
              <span style={{ fontSize: 8, color: 'rgba(0,234,255,0.4)', letterSpacing: '0.1em' }}>
                {s.toUpperCase()}: {count}
              </span>
            </div>
          )
        })}
        <span style={{ fontSize: 8, color: 'rgba(0,234,255,0.25)', marginLeft: 'auto', letterSpacing: '0.1em' }}>
          {visitorLocation?.nearestNodeId ? `NEAREST ${visitorLocation.nearestNodeId.toUpperCase()} // ` : ''}
          {geoNodes.length} NODES REGISTERED
        </span>
      </div>
    </GlassPanel>
  )
}

function NodeRow({ node, selected, onSelect }: { node: GeoNode; selected: boolean; onSelect: () => void }) {
  const col = STATUS_COLORS[node.status]
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '3px 6px',
        borderRadius: 4, cursor: 'pointer',
        background: selected ? 'rgba(0,234,255,0.07)' : 'transparent',
        border: `1px solid ${selected ? 'rgba(0,234,255,0.3)' : 'transparent'}`,
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: col,
        boxShadow: `0 0 4px ${col}`, flexShrink: 0 }} />
      <span style={{ fontSize: 8, color: selected ? '#00eaff' : 'rgba(0,234,255,0.55)',
        letterSpacing: '0.08em', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {node.name}
      </span>
      <span style={{ fontSize: 7, color: 'rgba(0,234,255,0.3)', flexShrink: 0 }}>
        {node.ping}ms
      </span>
    </div>
  )
}
