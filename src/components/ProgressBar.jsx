import { motion } from "framer-motion"
import { cn } from "../lib/utils"
import AnimatedDots from "./AnimatedDots"

export default function ProgressBar({ status, progress }) {
  return (
    <div className="space-y-3">
      <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: status === "done" ? "100%" : status === "error" ? "100%" : `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            status === "done" ? "bg-green-500" : status === "error" ? "bg-red-500" : "bg-cyan-500"
          )}
        />
      </div>
      <p className="text-sm text-slate-400 text-center flex items-center justify-center gap-1">
        {status === "pending" && <><span>Uploading</span><AnimatedDots /></>}
        {status === "processing" && <><span>Compressing</span><AnimatedDots /><span>{progress}%</span></>}
        {status === "done" && "Compression complete!"}
        {status === "error" && "Compression failed"}
      </p>
    </div>
  )
}
