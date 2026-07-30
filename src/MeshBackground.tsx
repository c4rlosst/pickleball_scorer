import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface Blob {
  size: number
  top?: string
  left?: string
  bottom?: string
  right?: string
  opacity: number
  depth: number
  driftX: string[]
  driftY: string[]
  duration: number
}

// driftX/driftY are precomputed, stable arrays (not recreated on render) so
// framer-motion doesn't treat every mouse-driven re-render as a new
// animation target and restart the drift.
const BLOBS: Blob[] = [
  {
    size: 600,
    top: '-15%',
    left: '-10%',
    opacity: 0.4,
    depth: 45,
    driftX: ['0%', '30%', '-15%', '0%'],
    driftY: ['0%', '20%', '30%', '0%'],
    duration: 14,
  },
  {
    size: 460,
    bottom: '-12%',
    right: '-8%',
    opacity: 0.3,
    depth: 0,
    driftX: ['0%', '-25%', '18%', '0%'],
    driftY: ['0%', '-20%', '-25%', '0%'],
    duration: 17,
  },
  {
    size: 320,
    top: '35%',
    left: '40%',
    opacity: 0.22,
    depth: 0,
    driftX: ['0%', '22%', '-22%', '0%'],
    driftY: ['0%', '-22%', '22%', '0%'],
    duration: 19,
  },
]

export default function MeshBackground({ colorHex }: { colorHex: string }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const frameRef = useRef<number | null>(null)
  const latest = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      latest.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      }
      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(() => {
          setMouse(latest.current)
          frameRef.current = null
        })
      }
    }
    window.addEventListener('pointermove', handleMove)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {BLOBS.map((b, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: b.top,
            left: b.left,
            bottom: b.bottom,
            right: b.right,
            width: b.size,
            height: b.size,
            maxWidth: '70vw',
            maxHeight: '70vw',
            transform:
              b.depth === 0 ? undefined : `translate(${mouse.x * b.depth}px, ${mouse.y * b.depth}px)`,
            transition: b.depth === 0 ? undefined : 'transform 0.6s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <motion.div
            className="w-full h-full rounded-full blur-3xl"
            style={{ backgroundColor: colorHex, opacity: b.opacity, transition: 'background-color 0.7s ease' }}
            animate={{ x: b.driftX, y: b.driftY }}
            transition={{ duration: b.duration, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      ))}

      {/* subtle grain texture, matching the mesh-gradient reference look */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]">
        <filter id="mesh-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#mesh-grain)" />
      </svg>
    </div>
  )
}
