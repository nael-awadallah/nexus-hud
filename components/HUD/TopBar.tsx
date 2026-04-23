'use client'
import { useEffect, useState } from 'react'
import { useHUDStore } from '@/lib/store/hudStore'
import type { DataMode } from '@/lib/types/hud'

const MODES: DataMode[] = ['alpha', 'beta', 'delta']

const DEPLOY_META: Record<string, { label: string; className: string }> = {
  production: { label: 'PRODUCTION', className: 'env-badge production' },
  'deploy-preview': { label: 'PREVIEW', className: 'env-badge preview' },
  'branch-deploy': { label: 'BRANCH', className: 'env-badge branch' },
  development: { label: 'LOCAL', className: 'env-badge development' },
}

export default function TopBar({ deployContext }: { deployContext: string }) {
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
  const envMeta = DEPLOY_META[deployContext] ?? DEPLOY_META.development

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
        <span className={envMeta.className}>{envMeta.label}</span>
        <span className="hud-mono neon-text text-sm tracking-[0.28em]">{clock}</span>
        <span className="hud-kicker">
          UPTIME: <span className="hud-value">{h}:{m}:{s}</span>
        </span>
      </div>
    </div>
  )
}
