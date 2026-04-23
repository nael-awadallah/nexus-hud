'use client'
import { useEffect, useRef } from 'react'
import { useHUDStore } from '@/lib/store/hudStore'
import AICore from './AICore'
import TopBar from './TopBar'
import { LinePanel, BarPanel, WavePanel, PiePanel, CircularProgressCluster } from '../Charts'
import StatusPanel from '../Panels/StatusPanel'
import GeoPanel from '../Geolocation/GeoPanel'
import dynamic from 'next/dynamic'

// Lazy load the Three.js scene (SSR disabled)
const ThreeScene = dynamic(() => import('@/lib/three/Scene'), { ssr: false })

export default function HUDLayout() {
  const tick = useHUDStore(s => s.tick)
  const mouseRef = useRef<[number, number]>([0, 0])
  const containerRef = useRef<HTMLDivElement>(null)

  // Data streaming simulation
  useEffect(() => {
    const interval = setInterval(() => tick(), 1000)
    return () => clearInterval(interval)
  }, [tick])

  // Mouse parallax
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      mouseRef.current = [
        ((e.clientX - r.left) / r.width - 0.5) * 2,
        ((e.clientY - r.top) / r.height - 0.5) * 2,
      ]
    }
    const onLeave = () => { mouseRef.current = [0, 0] }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave) }
  }, [])

  return (
    <div ref={containerRef} className="hud-shell">

      {/* Three.js WebGL background */}
      <ThreeScene mouseRef={mouseRef} />

      {/* Scanline overlay */}
      <div className="scanlines" />

      {/* Top bar */}
      <div className="relative z-10">
        <TopBar />
      </div>

      {/* Main grid */}
      <div className="hud-grid">

        {/* AI Core — spans 2 rows */}
        <div style={{ gridColumn: 1, gridRow: '1 / 3' }}>
          <AICore />
        </div>

        {/* Line chart */}
        <div style={{ gridColumn: 2, gridRow: 1 }}>
          <LinePanel />
        </div>

        {/* Bar chart */}
        <div style={{ gridColumn: 2, gridRow: 2 }}>
          <BarPanel />
        </div>

        {/* Pie chart — spans 2 rows */}
        <div style={{ gridColumn: 3, gridRow: '1 / 3' }}>
          <PiePanel />
        </div>

        {/* Waveform */}
        <div style={{ gridColumn: 2, gridRow: 3 }}>
          <WavePanel />
        </div>

        {/* Circular gauges */}
        <div style={{ gridColumn: 1, gridRow: 3 }}>
          <CircularProgressCluster />
        </div>

        {/* Status */}
        <div style={{ gridColumn: 3, gridRow: 3 }}>
          <StatusPanel />
        </div>

        {/* Geolocation — full width bottom row */}
        <div style={{ gridColumn: '1 / -1', gridRow: 4 }}>
          <GeoPanel />
        </div>
      </div>
    </div>
  )
}
