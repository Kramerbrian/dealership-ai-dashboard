'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Rocket, Clock } from 'lucide-react'

interface HyperdriveCardProps {
  onReply?: () => void;
  className?: string;
}

export default function HyperdriveCard({ onReply, className = '' }: HyperdriveCardProps) {
  const [isEngaging, setIsEngaging] = useState(false)

  const handleReply = async () => {
    setIsEngaging(true)
    
    // Simulate warp-speed processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (onReply) {
      onReply()
    }
    
    setIsEngaging(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/30 backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
          <Rocket className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white">Hyperdrive Replies</h2>
      </div>
      
      <p className="text-gray-300 mb-6 leading-relaxed">
        Our AI responds at warp speed—no time dilation, no red‑eye flights,
        just truth and a dash of sarcasm. Need a pause? Sorry, we left the
        brake pedal in the DeLorean.
      </p>
      
      <motion.button
        onClick={handleReply}
        disabled={isEngaging}
        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isEngaging ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-5 h-5" />
            </motion.div>
            Engaging Warp Drive...
          </>
        ) : (
          <>
            <Rocket className="w-5 h-5" />
            Engage Warp-Speed Reply
          </>
        )}
      </motion.button>
      
      {isEngaging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-center justify-center gap-2 text-sm text-purple-300"
        >
          <Clock className="w-4 h-4" />
          <span>Processing at 0.88c...</span>
        </motion.div>
      )}
    </motion.div>
  )
}
