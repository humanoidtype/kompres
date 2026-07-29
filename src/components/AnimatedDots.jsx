import { motion } from "framer-motion"

export default function AnimatedDots() {
  return (
    <span className="inline-flex gap-0.5 ml-0.5 mb-0.5">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          className="text-slate-400"
        >
          .
        </motion.span>
      ))}
    </span>
  )
}
