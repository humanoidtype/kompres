import { Film } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film size={22} className="text-cyan-400" />
          <span className="font-bold text-lg text-white">Kompres Video</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <a href="#tool" className="hover:text-cyan-400 transition-colors">Tool</a>
          <a href="#why" className="hover:text-cyan-400 transition-colors">Why</a>
          <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
        </div>
      </div>
    </nav>
  )
}
