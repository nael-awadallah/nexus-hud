'use client'
import GlassPanel from './GlassPanel'
import { useHUDStore } from '@/lib/store/hudStore'

export default function AICore() {
  const { stats, flickering } = useHUDStore()

  return (
    <GlassPanel label="AI CORE MODULE" className="flex flex-col items-center py-4 px-3" delay={0.1}>
      {/* Chip + rings */}
      <div className="relative w-28 h-28 flex items-center justify-center mb-3">
        {/* Outer ring */}
        <div className="absolute w-28 h-28 rounded-full border border-cyan-400/20 ring-b"
          style={{ borderRightColor: 'rgba(0,180,255,0.5)', borderTopColor: 'transparent', borderBottomColor: 'transparent' }} />
        {/* Inner ring */}
        <div className="absolute w-24 h-24 rounded-full border border-cyan-400/30 ring-a"
          style={{ borderTopColor: '#00eaff' }} />

        {/* Chip SVG */}
        <svg width="64" height="64" viewBox="0 0 64 64" className={flickering ? 'holo-flicker' : ''}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <rect x="14" y="14" width="36" height="36" rx="5"
            fill="none" stroke="rgba(0,234,255,0.45)" strokeWidth="1.2" filter="url(#glow)" />
          <rect x="19" y="19" width="26" height="26" rx="3"
            fill="rgba(0,40,70,0.8)" stroke="#00eaff" strokeWidth="0.8" />
          <text x="32" y="37" textAnchor="middle" fontFamily="Courier New"
            fontSize="13" fontWeight="700" fill="#00eaff" letterSpacing="2" filter="url(#glow)">
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
        <div className="absolute w-32 h-32 rounded-full animate-ping"
          style={{ border: '1px solid rgba(0,234,255,0.12)' }} />
      </div>

      <div className="text-xs tracking-widest neon-text mb-1">NEXUS AI v7.4</div>
      <div className={`text-[9px] tracking-widest mb-4 ${flickering ? 'opacity-30' : 'opacity-60'}`}
        style={{ color: 'var(--cyan)' }}>
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
