'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function PageLoader({ children }) {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [expand, setExpand] = useState(false)

  useEffect(() => {
    setLoading(true)
    setExpand(false)

    // ⏱ Timing for dot animation
    const pulseDuration = 2000 // time to pulse before expand
    const totalDuration = 3000 // total before showing page

    const pulseTimeout = setTimeout(() => setExpand(true), pulseDuration)
    const finishTimeout = setTimeout(() => setLoading(false), totalDuration)

    return () => {
      clearTimeout(pulseTimeout)
      clearTimeout(finishTimeout)
    }
  }, [pathname])

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Pulsing dot that grows into full screen */}
            <motion.div
              className="bg-[#FF0000] rounded-full"
              initial={{ width: 20, height: 20, scale: 1 }}
              animate={
                expand
                  ? { scale: 100, opacity: 1, transition: { duration: 1.5, ease: 'easeInOut' } }
                  : {
                      scale: [1, 1.3, 1],
                      transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
                    }
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content (appears after loader) */}
      <AnimatePresence mode="wait">
        {!loading && (
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}


