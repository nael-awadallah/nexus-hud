'use client'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import { useHUDStore } from '@/lib/store/hudStore'
import GlassPanel from '../HUD/GlassPanel'
import { useEffect, useRef } from 'react'

const MODE_COLORS: Record<string, string[]> = {
  alpha: ['#00eaff', '#0088cc', '#0055aa', '#00ccee', '#0077bb', '#00aadd'],
  beta:  ['#aa44ff', '#7722cc', '#5511aa', '#cc66ff', '#9933dd', '#bb55ff'],
  delta: ['#00ffaa', '#00cc88', '#009966', '#33ffbb', '#00bb77', '#22dd99'],
}
const PIE_COLORS = ['#00eaff', '#0077bb', '#aa44ff', '#00cc88', '#ff6644']
const PIE_LABELS = ['COMPUTE', 'MEMORY', 'I/O', 'NETWORK', 'CACHE']

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'rgba(0,18,32,0.9)', border: '1px solid rgba(0,234,255,0.3)',
      borderRadius: 4, padding: '4px 8px', fontSize: 9, color: '#00eaff', letterSpacing: '0.1em' }}>
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
      <div style={{ height: 90 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="i" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone" dataKey="v" stroke={color}
              strokeWidth={1.5} dot={false} isAnimationActive={false}
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
      <div style={{ height: 80 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barSize={14}>
            <XAxis dataKey="name" tick={{ fontSize: 7, fill: 'rgba(0,234,255,0.4)' }} tickLine={false} axisLine={false} />
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
        style={{ width: '100%', display: 'block', height: 48 }}
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
        <ResponsiveContainer width={160} height={130}>
          <PieChart>
            <Pie
              data={data}
              cx={76} cy={60}
              innerRadius={30} outerRadius={54}
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
      <div className="w-full px-2 pb-2" style={{ marginTop: -10 }}>
        {PIE_LABELS.map((l, i) => (
          <div key={i} className="flex items-center gap-1.5 mb-[3px]">
            <div className="w-1.5 h-1.5 rounded-[1px] flex-shrink-0"
              style={{ background: PIE_COLORS[i] }} />
            <span style={{ fontSize: 8, color: 'rgba(0,234,255,0.5)', letterSpacing: '0.1em' }}>{l}</span>
            <span style={{ fontSize: 8, color: '#00eaff', marginLeft: 'auto' }}>
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
      className="flex items-center justify-around py-2 px-3">
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
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,234,255,0.1)" strokeWidth={3} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
        <text x={cx} y={cy + 4} textAnchor="middle"
          fontFamily="Courier New" fontSize={9} fill={color} fontWeight="bold">
          {Math.round(value * 100)}%
        </text>
      </svg>
      <span style={{ fontSize: 8, color: 'rgba(0,234,255,0.45)', letterSpacing: '0.12em' }}>{label}</span>
    </div>
  )
}
