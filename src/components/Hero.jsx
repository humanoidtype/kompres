import { motion } from "framer-motion"
import { Download, ChevronDown } from "lucide-react"
import { Button } from "./ui/button"

export default function Hero() {
  return (
    <section className="min-h-[90svh] flex items-center justify-center pt-14 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/40 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Compress Your <span className="text-cyan-400">Videos</span>
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-lg mx-auto">
            Reduce video file size without sacrificing quality. Fast, private, and works entirely in your browser.
          </p>
          <a href="#tool">
            <Button size="lg" className="mt-8 text-base gap-2">
              <Download size={18} /> Get Started
            </Button>
          </a>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.5 }} className="mt-12">
          <ChevronDown size={24} className="mx-auto text-slate-600 animate-bounce" />
        </motion.div>
      </div>
    </section>
  )
}
