import { Film, Trash2 } from "lucide-react"
import { formatBytes, formatDuration } from "../utils/format"

export default function VideoDetails({ file, meta, onRemove }) {
  return (
    <div className="flex items-center gap-4 bg-slate-800/60 rounded-xl px-4 py-3 border border-slate-700">
      <div className="p-2 rounded-lg bg-cyan-950/50">
        <Film size={20} className="text-cyan-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{file.name}</p>
        <div className="flex gap-3 text-xs text-slate-400 mt-1">
          <span>{formatBytes(file.size)}</span>
          {meta && <span>{meta.original_resolution}</span>}
          {meta && <span>{meta.original_fps ? `${meta.original_fps}fps` : ""}</span>}
          {meta && meta.duration ? <span>{formatDuration(meta.duration)}</span> : null}
        </div>
      </div>
      {onRemove && (
        <button onClick={onRemove} className="p-2 text-slate-500 hover:text-red-400 transition-colors cursor-pointer shrink-0">
          <Trash2 size={16} />
        </button>
      )}
    </div>
  )
}
