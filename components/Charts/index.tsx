'use client'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import { useHUDStore } from '@/lib/store/hudStore'
import GlassPanel from '../HUD/GlassPanel'
import { useEffect, useRef } from 'react'

const MODE_COLORS: Record<string, string[]> = {
  alpha: ['#d9f5ff', '#9fe7ff', '#77cbe7', '#5bb6d5', '#7da9ff', '#a5dfff'],
  beta:  ['#d2edff', '#90d7f7', '#7cb5f0', '#95c6ff', '#7ec8f5', '#b1e5ff'],
  delta: ['#dcf6ff', '#9de4ef', '#78cad7', '#62b8d0', '#8dd7f3', '#bdefff'],
}
const PIE_COLORS = ['#d7f4ff', '#95daf6', '#6bbddf', '#5f98d2', '#85baf4']
const PIE_LABELS = ['COMPUTE', 'MEMORY', 'I/O', 'NETWORK', 'CACHE']

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(0,18,32,0.9)', border: '1px solid rgba(0,234,255,0.3)',
      borderRadius: 12, padding: '6px 10px', fontSize: 10, color: '#d8f4ff', letterSpacing: '0.08em',
      backgroundColor: 'rgba(7,16,27,0.92)', borderColor: 'rgba(182,229,250,0.2)', backdropFilter: 'blur(12px)' }}>
      {payload[0].value.toFixed(1)}
    </div>
  )
}

// ── Line Chart ────────────────────────────────────────────────────
export function LinePanel() {
  const { lineData, mode } = useHUDStore()
  const color = MODE_COLORS[mode][0]
  const data = lineData.map((v, i) => ({ i, v }))

  return (
    <GlassPanel label="NEURAL THROUGHPUT — REAL-TIME" delay={0.15}>
      <div style={{ height: 104, padding: '4px 10px 12px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.34} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="i" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone" dataKey="v" stroke={color}
              strokeWidth={2.2} dot={false} isAnimationActive={false}
              strokeLinecap="round"
              filter="drop-shadow(0 0 10px rgba(175, 228, 255, 0.14))"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassPanel>
  )
}

// ── Bar Chart ─────────────────────────────────────────────────────
export function BarPanel() {
  const { barData, mode } = useHUDStore()
  const colors = MODE_COLORS[mode]
  const labels = { alpha: ['A1','A2','A3','A4','A5','A6'],
                   beta:  ['B1','B2','B3','B4','B5','B6'],
                   delta: ['D1','D2','D3','D4','D5','D6'] }
  const data = barData.map((v, i) => ({ name: labels[mode][i], v: Math.round(v) }))

  return (
    <GlassPanel label="SECTOR LOAD DISTRIBUTION" delay={0.2}>
      <div style={{ height: 106, padding: '4px 10px 12px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 8 }} barSize={16}>
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'rgba(166,213,234,0.5)' }} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} hide />
            <Tooltip content={<CustomTooltip />} />
            {data.map((_, i) => (
              <Bar key={i} dataKey="v" isAnimationActive={false}>
                {data.map((__, j) => (
                  <Cell key={j} fill={colors[j % colors.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassPanel>
  )
}

// ── Waveform (Canvas-based for performance) ───────────────────────
export function WavePanel() {
  const cvs = useRef<HTMLCanvasElement>(null)
  const phaseRef = useRef(0)
  const { mode } = useHUDStore()
  const color = MODE_COLORS[mode][0]

  useEffect(() => {
    let raf: number
    const draw = () => {
      const c = cvs.current
      if (!c) return
      const ctx = c.getContext('2d')!
      const W = c.width, H = c.height, mid = H / 2
      ctx.clearRect(0, 0, W, H)
      phaseRef.current += 0.1

      ctx.beginPath()
      for (let x = 0; x < W; x++) {
        const t = x / W
        const y = mid + Math.sin(t * 22 + phaseRef.current) * 8
                      + Math.sin(t * 11 + phaseRef.current * 1.3) * 4
                      + Math.sin(t * 41 + phaseRef.current * 0.7) * 2
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke()

      ctx.beginPath()
      for (let x = 0; x < W; x++) {
        const t = x / W
        const y = mid + Math.sin(t * 15 + phaseRef.current * 0.8) * 5
                      + Math.sin(t * 7 + phaseRef.current * 1.1) * 3
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.strokeStyle = color + '44'; ctx.lineWidth = 1; ctx.stroke()
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [color])

  return (
    <GlassPanel label="SIGNAL WAVEFORM" delay={0.25}>
      <canvas ref={cvs} height={48}
        style={{ width: '100%', display: 'block', height: 62, padding: '0 10px' }}
        width={typeof window !== 'undefined' ? window.innerWidth : 400} />
    </GlassPanel>
  )
}

// ── Pie / Donut Chart ─────────────────────────────────────────────
export function PiePanel() {
  const { pieData } = useHUDStore()
  const total = pieData.reduce((a, b) => a + b, 0)
  const data = pieData.map((v, i) => ({ name: PIE_LABELS[i], value: v }))

  return (
    <GlassPanel label="RESOURCE MAP" delay={0.3}
      className="flex flex-col items-center">
      <div style={{ height: 130 }}>
        <ResponsiveContainer width={176} height={146}>
          <PieChart>
            <Pie
              data={data}
              cx={84} cy={68}
              innerRadius={38} outerRadius={58}
              startAngle={90} endAngle={-270}
              dataKey="value"
              isAnimationActive={false}
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i]} fillOpacity={0.85} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full px-4 pb-4" style={{ marginTop: -4 }}>
        {PIE_LABELS.map((l, i) => (
          <div key={i} className="mb-[6px] flex items-center gap-2">
            <div className="h-2 w-2 rounded-sm flex-shrink-0"
              style={{ background: PIE_COLORS[i] }} />
            <span className="hud-kicker" style={{ color: 'rgba(177,220,239,0.58)', letterSpacing: '0.16em' }}>{l}</span>
            <span className="hud-value" style={{ fontSize: 12, marginLeft: 'auto' }}>
              {Math.round(pieData[i] / total * 100)}%
            </span>
          </div>
        ))}
      </div>
    </GlassPanel>
  )
}

// ── Circular Progress Cluster ─────────────────────────────────────
const CIRC_LABELS = ['CPU', 'MEM', 'NET']
const CIRC_COLORS = ['#00eaff', '#4488ff', '#aa44ff']

export function CircularProgressCluster() {
  const { circData } = useHUDStore()

  return (
    <GlassPanel delay={0.35}
      className="flex items-center justify-around px-4 py-4">
      {CIRC_LABELS.map((label, i) => (
        <CircGauge key={label} label={label} value={circData[i]} color={CIRC_COLORS[i]} />
      ))}
    </GlassPanel>
  )
}

function CircGauge({ label, value, color }: { label: string; value: number; color: string }) {
  const r = 18, cx = 28, cy = 28, circ = 2 * Math.PI * r
  const dash = value * circ

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="56" height="56">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(173,224,246,0.12)" strokeWidth={3} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
        <text x={cx} y={cy + 4} textAnchor="middle"
          fontFamily="var(--font-display)" fontSize={10} fill={color} fontWeight="600">
          {Math.round(value * 100)}%
        </text>
      </svg>
      <span className="hud-kicker" style={{ color: 'rgba(173,218,239,0.45)', letterSpacing: '0.18em' }}>{label}</span>
    </div>
  )
}
