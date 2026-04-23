'use client'
import GlassPanel from '../HUD/GlassPanel'
import { useHUDStore } from '@/lib/store/hudStore'

const SOURCE_LABELS = {
  'ai-gateway': 'AI GATEWAY',
  fallback: 'FALLBACK',
  system: 'SYSTEM',
} as const

export default function CommentaryPanel() {
  const {
    aiCommentary,
    aiCommentarySource,
    aiCommentaryStatus,
    aiCommentaryUpdatedAt,
    visitorLocation,
  } = useHUDStore()

  const stamp = aiCommentaryUpdatedAt
    ? new Date(aiCommentaryUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--'

  return (
    <GlassPanel label="AI COMMENTARY // LIVE" delay={0.42}>
      <div className="commentary-panel">
        <div className="commentary-meta">
          <span className={`commentary-badge commentary-${aiCommentaryStatus}`}>
            {SOURCE_LABELS[aiCommentarySource]}
          </span>
          <span className="hud-kicker">LAST SYNC {stamp}</span>
        </div>

        <p className="commentary-copy">{aiCommentary}</p>

        <div className="commentary-footer">
          <span className="hud-kicker">
            {visitorLocation?.city
              ? `VIEWPOINT ${visitorLocation.city.toUpperCase()}`
              : 'VIEWPOINT UNRESOLVED'}
          </span>
          <span className="hud-kicker">STATUS {aiCommentaryStatus.toUpperCase()}</span>
        </div>
      </div>
    </GlassPanel>
  )
}
