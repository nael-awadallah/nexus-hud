'use client'
import { useEffect, useRef } from 'react'
import { useHUDStore } from '@/lib/store/hudStore'
import AICore from './AICore'
import TopBar from './TopBar'
import { LinePanel, BarPanel, WavePanel, PiePanel, CircularProgressCluster } from '../Charts'
import StatusPanel from '../Panels/StatusPanel'
import CommentaryPanel from '../Panels/CommentaryPanel'
import GeoPanel from '../Geolocation/GeoPanel'
import dynamic from 'next/dynamic'
import type { CommentarySnapshot, CommentaryResponse, GeoContextResponse } from '@/lib/netlify/contracts'
import { buildFallbackCommentary } from '@/lib/ai/commentaryFallback'

// Lazy load the Three.js scene (SSR disabled)
const ThreeScene = dynamic(() => import('@/lib/three/Scene'), { ssr: false })

function createCommentarySnapshot(): CommentarySnapshot {
  const state = useHUDStore.getState()
  return {
    mode: state.mode,
    uptime: state.uptime,
    stats: state.stats,
    geoNodes: state.geoNodes.map(({ id, name, type, status, ping, load }) => ({
      id,
      name,
      type,
      status,
      ping,
      load,
    })),
    selectedNodeId: state.geoSelected,
    visitorLocation: state.visitorLocation
      ? {
          city: state.visitorLocation.city,
          country: state.visitorLocation.country,
          nearestNodeId: state.visitorLocation.nearestNodeId,
        }
      : null,
  }
}

export default function HUDLayout({ deployContext }: { deployContext: string }) {
  const tick = useHUDStore(s => s.tick)
  const selectGeoNode = useHUDStore(s => s.selectGeoNode)
  const setVisitorLocation = useHUDStore(s => s.setVisitorLocation)
  const setGeoContextStatus = useHUDStore(s => s.setGeoContextStatus)
  const setAICommentary = useHUDStore(s => s.setAICommentary)
  const setAICommentaryStatus = useHUDStore(s => s.setAICommentaryStatus)
  const mouseRef = useRef<[number, number]>([0, 0])
  const containerRef = useRef<HTMLDivElement>(null)

  // Data streaming simulation
  useEffect(() => {
    const interval = setInterval(() => tick(), 1000)
    return () => clearInterval(interval)
  }, [tick])

  useEffect(() => {
    let cancelled = false

    const hydrateGeo = async () => {
      setGeoContextStatus('loading')

      try {
        const response = await fetch('/api/geo-context', { cache: 'no-store' })
        if (!response.ok) throw new Error(`Geo request failed with ${response.status}`)

        const payload = await response.json() as GeoContextResponse
        if (cancelled) return

        setVisitorLocation(payload.visitor)
        setGeoContextStatus('ready')

        if (payload.visitor.nearestNodeId) {
          selectGeoNode(payload.visitor.nearestNodeId)
        }
      } catch {
        if (cancelled) return

        setVisitorLocation({
          city: 'Localhost',
          country: 'Development',
          region: null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
          latitude: 31.95,
          longitude: 35.93,
          nearestNodeId: 'am07',
          source: 'fallback',
        })
        setGeoContextStatus('error', 'Netlify Edge Functions are unavailable in this runtime.')
      }
    }

    hydrateGeo()
    return () => {
      cancelled = true
    }
  }, [selectGeoNode, setGeoContextStatus, setVisitorLocation])

  useEffect(() => {
    let cancelled = false
    let inFlight = false

    const refreshCommentary = async () => {
      if (inFlight) return
      inFlight = true
      setAICommentaryStatus('loading')

      const snapshot = createCommentarySnapshot()
      const fallbackGeneratedAt = new Date().toISOString()

      try {
        const response = await fetch('/.netlify/functions/commentary', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(snapshot),
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error(`Commentary request failed with ${response.status}`)
        }

        const payload = await response.json() as CommentaryResponse
        if (!cancelled) {
          setAICommentary(payload)
        }
      } catch {
        if (!cancelled) {
          setAICommentary({
            commentary: buildFallbackCommentary(snapshot),
            generatedAt: fallbackGeneratedAt,
            source: 'fallback',
          })
          setAICommentaryStatus('error', 'Netlify Function unavailable; using local commentary synthesis.')
        }
      } finally {
        inFlight = false
      }
    }

    refreshCommentary()
    const interval = window.setInterval(refreshCommentary, 45000)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [setAICommentary, setAICommentaryStatus])

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
        <TopBar deployContext={deployContext} />
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
          <CommentaryPanel />
        </div>

        {/* Geolocation — full width bottom row */}
        <div style={{ gridColumn: '1 / -1', gridRow: 5 }}>
          <GeoPanel />
        </div>
      </div>
    </div>
  )
}
