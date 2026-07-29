import { useState, useRef, useCallback } from "react"
import { Upload } from "lucide-react"
import { cn } from "../lib/utils"

export default function UploadZone({ onFileSelect }) {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = useCallback(e => {
    e.preventDefault()
    setDrag(false)
    const file = e.dataTransfer.files[0]
    if (file) onFileSelect(file)
  }, [onFileSelect])

  return (
    <div
      id="tool"
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all",
        drag ? "border-cyan-400 bg-cyan-950/30 scale-[1.02]" : "border-slate-700 hover:border-cyan-600 hover:bg-slate-800/50"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/x-matroska,video/avi,video/quicktime,video/webm,video/x-flv,video/x-ms-wmv,video/mp4,video/3gpp,video/mpeg,video/mp2t,video/ogg"
        hidden
        onChange={e => e.target.files[0] && onFileSelect(e.target.files[0])}
      />
      <Upload size={48} className="mx-auto mb-4 text-cyan-400" />
      <p className="text-lg font-medium text-white">Drop your video here</p>
      <p className="text-sm text-slate-500 mt-1">or click to browse (mp4, mkv, avi, mov, webm, 3gp, mpeg, flv, wmv)</p>
    </div>
  )
}
