'use client'
import GlassPanel from '../HUD/GlassPanel'
import { useHUDStore } from '@/lib/store/hudStore'

const STATUS_STYLE: Record<string, { dot: string; text: string; label: string }> = {
  online: { dot: '#00ff88', text: '#00ff88', label: 'OK' },
  warn:   { dot: '#ffaa00', text: '#ffaa00', label: 'WARN' },
  error:  { dot: '#ff4455', text: '#ff4455', label: 'ERR' },
}

export default function StatusPanel() {
  const { systemStatuses } = useHUDStore()

  return (
    <GlassPanel label="SYSTEM STATUS" delay={0.4}>
      <div className="px-3 pb-3">
        {systemStatuses.map(s => {
          const st = STATUS_STYLE[s.status]
          return (
            <div key={s.label} className="flex items-center gap-2 py-[7px]">
              <div className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: st.dot, boxShadow: `0 0 8px ${st.dot}` }} />
              <span className="hud-kicker" style={{ color: 'rgba(172,220,242,0.66)', flex: 1, letterSpacing: '0.16em' }}>
                {s.label}
              </span>
              <span className="hud-value" style={{ fontSize: 12, color: st.text }}>{st.label}</span>
            </div>
          )
        })}
      </div>
    </GlassPanel>
  )
}
