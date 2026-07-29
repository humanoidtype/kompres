import { motion } from "framer-motion"
import { Cpu, Zap, Monitor } from "lucide-react"

const reasons = [
  { icon: Cpu, title: "Save Storage Space", desc: "Compressed videos take up significantly less space on your device, letting you keep more content." },
  { icon: Zap, title: "Faster Sharing", desc: "Smaller files upload and download faster. Share videos on messaging apps, email, or social media instantly." },
  { icon: Monitor, title: "Optimized for Web", desc: "Reduce bandwidth usage on your website or app. Compressed videos load faster and provide a better user experience." }
]

export default function WhySection() {
  return (
    <section id="why" className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center">Why Compress Your Videos?</h2>
        <p className="mt-3 text-slate-400 text-center max-w-lg mx-auto">Large video files can be a headache. Here is why compression helps.</p>
        <div className="mt-12 grid sm:grid-cols-3 gap-6">
          {reasons.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-5 rounded-xl bg-slate-800/40 border border-slate-700">
              <r.icon size={24} className="text-cyan-400 mb-3" />
              <h3 className="font-semibold text-white">{r.title}</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
