import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bug, X, Clock } from "lucide-react"

export default function DebugPanel() {
  const [open, setOpen] = useState(false)
  const [logs, setLogs] = useState([])
  const [devTime, setDevTime] = useState("")
  const logEndRef = useRef(null)

  useEffect(() => {
    fetch("/api/dev-session")
      .then(r => r.json())
      .then(s => {
        if (s.started_at) {
          const start = new Date(s.started_at)
          const tick = () => {
            const diff = Date.now() - start
            const h = String(Math.floor(diff / 3600000)).padStart(2, "0")
            const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0")
            const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0")
            setDevTime(`${h}:${m}:${s}`)
          }
          tick()
          const iv = setInterval(tick, 1000)
          return () => clearInterval(iv)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const origLog = console.log
    const origErr = console.error
    console.log = (...args) => {
      setLogs(p => [...p.slice(-99), args.join(" ")])
      origLog(...args)
    }
    console.error = (...args) => {
      setLogs(p => [...p.slice(-99), "[ERROR] " + args.join(" ")])
      origErr(...args)
    }
    return () => {
      console.log = origLog
      console.error = origErr
    }
  }, [])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-cyan-600 text-white shadow-lg flex items-center justify-center hover:bg-cyan-700 cursor-pointer"
      >
        <Bug size={18} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: 380 }}
            animate={{ x: 0 }}
            exit={{ x: 380 }}
            className="fixed top-0 right-0 z-50 w-96 h-full bg-slate-900 text-gray-100 shadow-2xl flex flex-col border-l border-slate-700"
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-700">
              <span className="text-xs font-mono flex items-center gap-2 text-cyan-400">
                <Clock size={12} /> Dev Time: {devTime}
              </span>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-3 font-mono text-xs leading-relaxed">
              {logs.length === 0 && <p className="text-slate-500">No logs yet...</p>}
              {logs.map((l, i) => (
                <div key={i} className={l.startsWith("[ERROR]") ? "text-red-400" : "text-slate-300"}>{l}</div>
              ))}
              <div ref={logEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
