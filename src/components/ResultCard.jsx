import { motion } from "framer-motion"
import { Download } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "../lib/utils"
import { formatBytes } from "../utils/format"

export default function ResultCard({ job }) {
  const reduction = Math.round((1 - job.compressed_size / job.original_size) * 100)
  const isLarger = reduction < 0

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white">Compression Result</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-slate-900 rounded-xl">
          <p className="text-slate-400">Original</p>
          <p className="text-xl font-bold text-white">{formatBytes(job.original_size)}</p>
          {job.original_resolution && (
            <p className="text-xs text-slate-500 mt-1">{job.original_resolution} · {job.original_fps}fps</p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl border", isLarger ? "bg-amber-950/40 border-amber-900/50" : "bg-green-950/40 border-green-900/50")}>
          <p className="text-slate-400">Compressed</p>
          <p className={cn("text-xl font-bold", isLarger ? "text-amber-400" : "text-green-400")}>
            {formatBytes(job.compressed_size)}
          </p>
          <p className={cn("text-xs mt-1", isLarger ? "text-amber-600" : "text-green-600")}>
            {isLarger ? `+${Math.abs(reduction)}% larger` : `-${reduction}% smaller`}
          </p>
        </div>
      </div>
      {isLarger && (
        <p className="text-xs text-amber-500/80 bg-amber-950/30 border border-amber-900/30 rounded-lg px-3 py-2">
          This video may already be compressed. Re-encoding can result in a larger file size.
        </p>
      )}
      <div className="flex gap-4 text-sm text-slate-400 flex-wrap">
        <span>{job.resolution}</span>
        <span>{job.fps} fps</span>
        <span className="capitalize">{job.preset}</span>
      </div>
      <Button asChild className="w-full">
        <a href={`/api/download/${job.job_id}`}>
          <Download size={16} /> Download Compressed Video
        </a>
      </Button>
    </motion.div>
  )
}
