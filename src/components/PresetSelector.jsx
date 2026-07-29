import { motion } from "framer-motion"
import { cn } from "../lib/utils"
import { PRESETS, RES_OPTIONS, FPS_OPTIONS } from "../constants"

export default function PresetSelector({ selected, onChange, advanced, onAdvancedChange }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(PRESETS).map(([key, p]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              "p-4 rounded-xl border-2 text-left transition-all cursor-pointer relative",
              selected === key
                ? "border-cyan-500 bg-cyan-950/30 shadow-lg shadow-cyan-950/50"
                : "border-slate-700 bg-slate-800/50 hover:border-cyan-700"
            )}
          >
            {key === "balanced" && (
              <span className="absolute -top-2 -right-2 bg-amber-500 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full">BEST</span>
            )}
            <p className="font-semibold text-white">{p.label}</p>
            {p.res && <p className="text-sm text-slate-400 mt-1">{p.res}{p.fps ? ` · ${p.fps}fps` : ""}</p>}
            <p className="text-xs text-slate-500 mt-1">{p.desc}</p>
            {p.saving && <p className="text-xs text-cyan-500 mt-1 font-medium">{p.saving}</p>}
          </button>
        ))}
      </div>
      {selected === "advanced" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-4 p-4 bg-slate-800/80 rounded-xl border border-slate-700"
        >
          <div className="flex-1 min-w-[120px]">
            <label className="text-sm font-medium text-slate-300">Resolution</label>
            <select
              value={advanced.resolution}
              onChange={e => onAdvancedChange({ ...advanced, resolution: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white"
            >
              {RES_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="text-sm font-medium text-slate-300">FPS</label>
            <select
              value={advanced.fps}
              onChange={e => onAdvancedChange({ ...advanced, fps: Number(e.target.value) })}
              className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white"
            >
              {FPS_OPTIONS.map(f => <option key={f} value={f}>{f} fps</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-sm font-medium text-slate-300">
              CRF (18-36) <span className="text-slate-500 font-normal">— low = high quality</span>
            </label>
            <input
              type="range" min="18" max="36" value={advanced.crf}
              onChange={e => onAdvancedChange({ ...advanced, crf: Number(e.target.value) })}
              className="mt-2 w-full accent-cyan-500"
            />
            <p className="text-xs text-slate-400 mt-1">{advanced.crf}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
