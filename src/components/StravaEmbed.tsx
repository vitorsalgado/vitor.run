import { useEffect, useRef } from 'react'

const STRAVA_EMBED_SCRIPT = 'https://strava-embeds.com/embed.js'

type StravaEmbedProps = {
  activityId: string
  style?: 'standard' | 'dark' | 'light'
}

export function StravaEmbed({ activityId, style = 'standard' }: StravaEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activityId || !containerRef.current) return

    const existing = document.querySelector(`script[src="${STRAVA_EMBED_SCRIPT}"]`)
    if (existing) {
      // Script already loaded; Strava may need to re-run for new embeds
      if (typeof (window as unknown as { StravaEmbed?: { run?: () => void } }).StravaEmbed?.run === 'function') {
        ;(window as unknown as { StravaEmbed: { run: () => void } }).StravaEmbed.run()
      }
      return
    }

    const script = document.createElement('script')
    script.src = STRAVA_EMBED_SCRIPT
    script.async = true
    script.onload = () => {
      if (typeof (window as unknown as { StravaEmbed?: { run?: () => void } }).StravaEmbed?.run === 'function') {
        ;(window as unknown as { StravaEmbed: { run: () => void } }).StravaEmbed.run()
      }
    }
    document.body.appendChild(script)
    return () => {
      script.remove()
    }
  }, [activityId])

  return (
    <div className="my-6 strava-embed-wrapper">
      <div
        ref={containerRef}
        className="strava-embed-placeholder"
        data-embed-type="activity"
        data-embed-id={activityId}
        data-style={style}
        data-from-embed="false"
      />
    </div>
  )
}
