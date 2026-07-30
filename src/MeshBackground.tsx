import { motion } from 'framer-motion'

export default function MeshBackground({ colorHex }: { colorHex: string }) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <motion.div
        className="absolute w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] rounded-full blur-3xl opacity-40"
        style={{ backgroundColor: colorHex, top: '-15%', left: '-10%', transition: 'background-color 0.7s ease' }}
        animate={{ x: ['0%', '15%', '-5%', '0%'], y: ['0%', '10%', '15%', '0%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[55vw] h-[55vw] max-w-[460px] max-h-[460px] rounded-full blur-3xl opacity-30"
        style={{
          backgroundColor: colorHex,
          bottom: '-12%',
          right: '-8%',
          transition: 'background-color 0.7s ease',
        }}
        animate={{ x: ['0%', '-10%', '8%', '0%'], y: ['0%', '-8%', '-12%', '0%'] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[40vw] h-[40vw] max-w-[320px] max-h-[320px] rounded-full blur-3xl opacity-20"
        style={{
          backgroundColor: colorHex,
          top: '35%',
          left: '40%',
          transition: 'background-color 0.7s ease',
        }}
        animate={{ x: ['0%', '10%', '-10%', '0%'], y: ['0%', '-10%', '10%', '0%'] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />

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
