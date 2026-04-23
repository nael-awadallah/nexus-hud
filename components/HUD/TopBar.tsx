'use client'
import { useEffect, useState } from 'react'
import { useHUDStore, DataMode } from '@/lib/store/hudStore'

const MODES: DataMode[] = ['alpha', 'beta', 'delta']

export default function TopBar() {
  const { mode, setMode, uptime } = useHUDStore()
  const [clock, setClock] = useState('--:--:--')

  useEffect(() => {
    const t = setInterval(() => {
      setClock(new Date().toTimeString().slice(0, 8))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const h = String(Math.floor(uptime / 3600)).padStart(2, '0')
  const m = String(Math.floor((uptime % 3600) / 60)).padStart(2, '0')
  const s = String(uptime % 60).padStart(2, '0')

  return (
    <div className="flex items-center justify-between px-4 h-7 border-b"
      style={{ background: 'rgba(0,8,18,0.8)', borderColor: 'rgba(0,234,255,0.15)' }}>

      <span className="text-[8px] tracking-[0.2em]" style={{ color: 'rgba(0,234,255,0.4)' }}>
        NEXUS-7 / AI CONTROL MATRIX / SECTOR 04
      </span>

      <div className="flex items-center gap-2">
        {MODES.map(m => (
          <button key={m} className={`mode-btn ${mode === m ? 'active' : ''}`}
            onClick={() => setMode(m)}>
            {m.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <span className="text-[9px] tracking-widest neon-text">{clock}</span>
        <span className="text-[8px] tracking-[0.15em]" style={{ color: 'rgba(0,234,255,0.4)' }}>
          UPTIME: <span style={{ color: 'var(--cyan)' }}>{h}:{m}:{s}</span>
        </span>
      </div>
    </div>
  )
}
