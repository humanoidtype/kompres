import { Film, ExternalLink } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 py-8 px-4">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Film size={16} className="text-cyan-400" />
          <span>Kompres Video</span>
        </div>
        <p>Compress your videos efficiently and securely.</p>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
          <ExternalLink size={14} /> GitHub
        </a>
      </div>
    </footer>
  )
}
