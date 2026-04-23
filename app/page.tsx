import HUDLayout from '@/components/HUD/HUDLayout'

export default function Page() {
  const deployContext = process.env.CONTEXT ?? process.env.NEXT_PUBLIC_DEPLOY_CONTEXT ?? 'development'
  return <HUDLayout deployContext={deployContext} />
}
