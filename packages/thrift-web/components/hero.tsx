'use client'
import { cn } from '@/lib/utils'
import AnimatedText from './ui/animated-text'
import { getCldVideoUrl } from 'next-cloudinary'
import { Montagu_Slab } from 'next/font/google'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { Pause, Play } from 'lucide-react'
import { heroContent, heroFrame, heroHeading, heroTitle } from './hero-layout'

const font = Montagu_Slab({ weight: '500', subsets: ['latin'] })
const videoSrc = getCldVideoUrl({
  width: 1920,
  height: 1080,
  src: 'sellit-media/hero/laptop-unboxing-hd',
})

export function Hero({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const video = useRef<HTMLVideoElement>(null)
  const reducedMotion = useReducedMotion()
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const element = video.current
    if (!element) return
    if (reducedMotion !== false) element.pause()
    else {
      // Adding autoplay after media has loaded does not reliably start playback.
      void element.play().catch((error: DOMException) => {
        if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
          // Browser policy can require a gesture; the Play control remains available.
          setPlaying(false)
        } else {
          console.warn('Background video could not start', error)
          setFailed(true)
        }
      })
    }
  }, [reducedMotion])
  return (
    <section aria-labelledby="hero-heading" className={heroFrame}>
      <video
        ref={video}
        src={videoSrc}
        autoPlay={reducedMotion === false}
        loop
        muted
        playsInline
        aria-hidden="true"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setFailed(true)}
        className="absolute inset-0 h-full w-full object-cover"
        poster="/laptop-unboxing-hd.jpg"
      />
      <div className={cn(heroContent, font.className, className)}>
        <AnimatedText
          as="h1"
          id="hero-heading"
          className={heroHeading}
          text={heroTitle}
          delim="|"
        />
        {children}
      </div>
      {!failed && (
        <button
          type="button"
          aria-label={`${playing ? 'Pause' : 'Play'} background video`}
          className="absolute bottom-5 right-6 flex min-h-11 items-center gap-2 rounded-md bg-black px-4 text-sm text-white hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          onClick={async () => {
            if (!video.current) return
            if (playing) video.current.pause()
            else {
              try {
                await video.current.play()
              } catch {
                setFailed(true)
              }
            }
          }}
        >
          {playing ? (
            <Pause aria-hidden="true" size={16} />
          ) : (
            <Play aria-hidden="true" size={16} />
          )}
          {playing ? 'Pause video' : 'Play video'}
        </button>
      )}
    </section>
  )
}
