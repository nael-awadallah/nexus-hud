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
            <div key={s.label} className="flex items-center gap-2 py-[3px]">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: st.dot, boxShadow: `0 0 5px ${st.dot}` }} />
              <span style={{ fontSize: 9, color: 'rgba(0,234,255,0.55)', letterSpacing: '0.1em', flex: 1 }}>
                {s.label}
              </span>
              <span style={{ fontSize: 9, color: st.text, letterSpacing: '0.1em' }}>{st.label}</span>
            </div>
          )
        })}
      </div>
    </GlassPanel>
  )
}
