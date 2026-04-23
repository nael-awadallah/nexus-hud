import dynamic from 'next/dynamic'

// Full SSR disabled for HUD (needs window, WebGL)
const HUDLayout = dynamic(() => import('@/components/HUD/HUDLayout'), { ssr: false })

export default function Page() {
  return <HUDLayout />
}
