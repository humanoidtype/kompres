import { motion } from "framer-motion"
import { Zap, FileVideo, Monitor, Shield } from "lucide-react"

const FEATURES = [
  { icon: Zap, title: "Fast Processing", desc: "Optimized FFmpeg encoding with hardware acceleration support for quick compression." },
  { icon: FileVideo, title: "All Formats", desc: "Supports MP4, MKV, AVI, MOV, WebM, 3GP, MPEG, and more." },
  { icon: Monitor, title: "Multiple Presets", desc: "Maximum to Minimum mode — choose your balance between size and quality." },
  { icon: Shield, title: "100% Private", desc: "Your files are processed securely. We do not store or share your videos with any third parties." }
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 border-t border-slate-800">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center">Supported Features</h2>
        <p className="mt-3 text-slate-400 text-center max-w-lg mx-auto">Everything you need to compress videos efficiently.</p>
        <div className="mt-12 grid sm:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-5 rounded-xl bg-slate-800/40 border border-slate-700">
              <f.icon size={24} className="text-cyan-400 mb-3" />
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
