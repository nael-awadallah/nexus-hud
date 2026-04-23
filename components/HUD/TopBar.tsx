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
    <div className="hud-topbar">

      <div className="hud-kicker">
        NEXUS-7 / AI CONTROL MATRIX / SECTOR 04
      </div>

      <div className="flex items-center gap-2">
        {MODES.map(m => (
          <button key={m} className={`mode-btn ${mode === m ? 'active' : ''}`}
            onClick={() => setMode(m)}>
            {m.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-6 justify-self-end">
        <span className="hud-mono neon-text text-sm tracking-[0.28em]">{clock}</span>
        <span className="hud-kicker">
          UPTIME: <span className="hud-value">{h}:{m}:{s}</span>
        </span>
      </div>
    </div>
  )
}
