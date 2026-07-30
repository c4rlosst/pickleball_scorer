import { motion } from 'framer-motion'
import PickleballIcon from '@/components/PickleballIcon'

export default function IntroRoll({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center overflow-hidden bg-black"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <motion.div
        className="text-[#ff7a00]"
        initial={{ x: '-20vw', rotate: 0 }}
        animate={{ x: '120vw', rotate: 1080 }}
        transition={{ duration: 1.1, ease: 'easeIn' }}
        onAnimationComplete={onDone}
      >
        <PickleballIcon className="w-14 h-14 sm:w-20 sm:h-20" />
      </motion.div>
    </motion.div>
  )
}
