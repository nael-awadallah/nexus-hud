'use client'
import GlassPanel from './GlassPanel'
import { useHUDStore } from '@/lib/store/hudStore'

export default function AICore() {
  const { stats, flickering } = useHUDStore()

  return (
    <GlassPanel label="AI CORE MODULE" className="flex flex-col items-center px-5 py-5" delay={0.1}>
      {/* Chip + rings */}
      <div className="relative mb-5 flex h-36 w-36 items-center justify-center">
        {/* Outer ring */}
        <div className="ring-b absolute h-36 w-36 rounded-full border border-cyan-400/20"
          style={{ borderRightColor: 'rgba(182,227,249,0.6)', borderTopColor: 'transparent', borderBottomColor: 'transparent' }} />
        {/* Inner ring */}
        <div className="ring-a absolute h-30 w-30 rounded-full border border-cyan-400/30"
          style={{ borderTopColor: 'rgba(226,244,255,0.94)', width: 122, height: 122 }} />
        <div
          className="absolute inset-6 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(130,210,244,0.16), transparent 62%)',
            filter: 'blur(10px)',
          }}
        />

        {/* Chip SVG */}
        <svg width="84" height="84" viewBox="0 0 64 64" className={flickering ? 'holo-flicker' : ''}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <rect x="14" y="14" width="36" height="36" rx="5"
            fill="rgba(6,16,24,0.55)" stroke="rgba(188,231,249,0.48)" strokeWidth="1.2" filter="url(#glow)" />
          <rect x="19" y="19" width="26" height="26" rx="3"
            fill="rgba(11,26,39,0.96)" stroke="rgba(223,246,255,0.9)" strokeWidth="0.8" />
          <text x="32" y="37" textAnchor="middle" fontFamily="var(--font-display)"
            fontSize="13" fontWeight="700" fill="#dff5ff" letterSpacing="1.4" filter="url(#glow)">
            AI
          </text>
          {/* Pins */}
          {[10, 22, 34].map(y => (
            <g key={`l${y}`}>
              <line x1="9"  y1={y} x2="14" y2={y} stroke="#00eaff" strokeWidth="1.2" />
              <line x1="50" y1={y} x2="55" y2={y} stroke="#00eaff" strokeWidth="1.2" />
            </g>
          ))}
          {[10, 22, 34].map(x => (
            <g key={`t${x}`}>
              <line x1={x} y1="9"  x2={x} y2="14" stroke="#00eaff" strokeWidth="1.2" />
              <line x1={x} y1="50" x2={x} y2="55" stroke="#00eaff" strokeWidth="1.2" />
            </g>
          ))}
        </svg>

        {/* Pulse ring */}
        <div className="absolute h-40 w-40 rounded-full animate-ping"
          style={{ border: '1px solid rgba(174,226,249,0.08)' }} />
      </div>

      <div className="hud-heading neon-text mb-1 text-2xl">NEXUS AI v7.4</div>
      <div className={`hud-kicker mb-5 ${flickering ? 'opacity-30' : 'opacity-60'}`}
        style={{ color: 'var(--cyan-soft)' }}>
        ● ONLINE — OPTIMAL
      </div>

      <div className="w-full space-y-[2px]">
        <div className="stat-row"><span className="stat-key">NEURAL LOAD</span>
          <span className="stat-val">{stats.neuralLoad}%</span></div>
        <div className="stat-row"><span className="stat-key">INFERENCE/s</span>
          <span className="stat-val">{stats.inferenceRate}K</span></div>
        <div className="stat-row"><span className="stat-key">TEMP CORE</span>
          <span className="stat-val">{stats.coreTemp}°C</span></div>
        <div className="stat-row"><span className="stat-key">ENTROPY IDX</span>
          <span className="stat-val">{stats.entropyIdx}</span></div>
        <div className="stat-row"><span className="stat-key">COHERENCE</span>
          <span className="stat-val">{stats.coherence}%</span></div>
      </div>
    </GlassPanel>
  )
}
