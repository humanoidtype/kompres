import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Settings, Play, Download, Bug, X, Clock, Trash2, Film, Zap, Shield, Monitor, FileVideo, Cpu, ChevronDown, ExternalLink } from 'lucide-react'
import { Button } from './components/ui/button'
import { cn } from './lib/utils'

const PRESETS = {
  maximum: {
    label: 'Maximum',
    res: '480p',
    fps: 24,
    crf: 32,
    desc: 'Max compression',
    saving: '~85-90% smaller'
  },
  balanced: {
    label: 'Balanced',
    res: '720p',
    fps: 30,
    crf: 26,
    desc: 'Good quality',
    saving: '~70-80% smaller'
  },
  minimum: {
    label: 'Minimum',
    res: 'source',
    fps: 30,
    crf: 22,
    desc: 'Minimal loss',
    saving: '~40-60% smaller'
  },
  advanced: {
    label: 'Advanced',
    res: null,
    fps: null,
    crf: null,
    desc: 'Full control',
    saving: null
  }
}

const RES_OPTIONS = ['240p', '360p', '480p', '720p', '1080p']
const FPS_OPTIONS = [24, 30, 60]

const FEATURES = [
  { icon: Zap, title: 'Fast Processing', desc: 'Optimized FFmpeg encoding with hardware acceleration support for quick compression.' },
  { icon: FileVideo, title: 'All Formats', desc: 'Supports MP4, MKV, AVI, MOV, WebM, 3GP, MPEG, and more.' },
  { icon: Monitor, title: 'Multiple Presets', desc: 'Maximum to Minimum mode — choose your balance between size and quality.' },
  { icon: Shield, title: '100% Private', desc: 'Your files are processed securely. We do not store or share your videos with any third parties.' },
]

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i]
}

function formatDuration(sec) {
  if (!sec) return ''
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function DebugPanel() {
  const [open, setOpen] = useState(false)
  const [logs, setLogs] = useState([])
  const [devTime, setDevTime] = useState('')
  const logEndRef = useRef(null)

  useEffect(() => {
    fetch('/api/dev-session')
      .then(r => r.json())
      .then(s => {
        if (s.started_at) {
          const start = new Date(s.started_at)
          const tick = () => {
            const diff = Date.now() - start
            const h = String(Math.floor(diff / 3600000)).padStart(2, '0')
            const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
            const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
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
      setLogs(p => [...p.slice(-99), args.join(' ')])
      origLog(...args)
    }
    console.error = (...args) => {
      setLogs(p => [...p.slice(-99), '[ERROR] ' + args.join(' ')])
      origErr(...args)
    }
    return () => {
      console.log = origLog
      console.error = origErr
    }
  }, [])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
                <div key={i} className={l.startsWith('[ERROR]') ? 'text-red-400' : 'text-slate-300'}>{l}</div>
              ))}
              <div ref={logEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Navbar() {
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

function Hero() {
  return (
    <section className="min-h-[90svh] flex items-center justify-center pt-14 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/40 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Compress Your <span className="text-cyan-400">Videos</span>
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-lg mx-auto">
            Reduce video file size without sacrificing quality. Fast, private, and works entirely in your browser.
          </p>
          <a href="#tool">
            <Button size="lg" className="mt-8 text-base gap-2">
              <Download size={18} /> Get Started
            </Button>
          </a>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.5 }} className="mt-12">
          <ChevronDown size={24} className="mx-auto text-slate-600 animate-bounce" />
        </motion.div>
      </div>
    </section>
  )
}

function UploadZone({ onFileSelect }) {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDrag(false)
    const file = e.dataTransfer.files[0]
    if (file) onFileSelect(file)
  }, [onFileSelect])

  return (
    <div
      id="tool"
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all',
        drag ? 'border-cyan-400 bg-cyan-950/30 scale-[1.02]' : 'border-slate-700 hover:border-cyan-600 hover:bg-slate-800/50'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/x-matroska,video/avi,video/quicktime,video/webm,video/x-flv,video/x-ms-wmv,video/mp4,video/3gpp,video/mpeg,video/mp2t,video/ogg"
        hidden
        onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
      />
      <Upload size={48} className="mx-auto mb-4 text-cyan-400" />
      <p className="text-lg font-medium text-white">Drop your video here</p>
      <p className="text-sm text-slate-500 mt-1">or click to browse (mp4, mkv, avi, mov, webm, 3gp, mpeg, flv, wmv)</p>
    </div>
  )
}

function VideoDetails({ file, meta, onRemove }) {
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
          {meta && <span>{meta.original_fps ? `${meta.original_fps}fps` : ''}</span>}
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

function PresetSelector({ selected, onChange, advanced, onAdvancedChange }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(PRESETS).map(([key, p]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-all cursor-pointer relative',
              selected === key
                ? 'border-cyan-500 bg-cyan-950/30 shadow-lg shadow-cyan-950/50'
                : 'border-slate-700 bg-slate-800/50 hover:border-cyan-700'
            )}
          >
            {key === 'balanced' && (
              <span className="absolute -top-2 -right-2 bg-amber-500 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full">BEST</span>
            )}
            <p className="font-semibold text-white">{p.label}</p>
            {p.res && <p className="text-sm text-slate-400 mt-1">{p.res}{p.fps ? ` · ${p.fps}fps` : ''}</p>}
            <p className="text-xs text-slate-500 mt-1">{p.desc}</p>
            {p.saving && (
              <p className="text-xs text-cyan-500 mt-1 font-medium">{p.saving}</p>
            )}
          </button>
        ))}
      </div>
      {selected === 'advanced' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-4 p-4 bg-slate-800/80 rounded-xl border border-slate-700"
        >
          <div className="flex-1 min-w-[120px]">
            <label className="text-sm font-medium text-slate-300">Resolution</label>
            <select
              value={advanced.resolution}
              onChange={(e) => onAdvancedChange({ ...advanced, resolution: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white"
            >
              {RES_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="text-sm font-medium text-slate-300">FPS</label>
            <select
              value={advanced.fps}
              onChange={(e) => onAdvancedChange({ ...advanced, fps: Number(e.target.value) })}
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
              type="range"
              min="18"
              max="36"
              value={advanced.crf}
              onChange={(e) => onAdvancedChange({ ...advanced, crf: Number(e.target.value) })}
              className="mt-2 w-full accent-cyan-500"
            />
            <p className="text-xs text-slate-400 mt-1">{advanced.crf}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function ProgressBar({ status, progress }) {
  return (
    <div className="space-y-3">
      <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: status === 'done' ? '100%' : status === 'error' ? '100%' : `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full',
            status === 'done' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-cyan-500'
          )}
        />
      </div>
      <p className="text-sm text-slate-400 text-center">
        {status === 'pending' && 'Uploading...'}
        {status === 'processing' && `Compressing... ${progress}%`}
        {status === 'done' && 'Compression complete!'}
        {status === 'error' && 'Compression failed'}
      </p>
    </div>
  )
}

function ResultCard({ job }) {
  const reduction = Math.round((1 - job.compressed_size / job.original_size) * 100)
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
        <div className="p-3 bg-green-950/40 border border-green-900/50 rounded-xl">
          <p className="text-slate-400">Compressed</p>
          <p className="text-xl font-bold text-green-400">{formatBytes(job.compressed_size)}</p>
          <p className="text-xs text-green-600 mt-1">-{reduction}% smaller</p>
        </div>
      </div>
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

function WhySection() {
  const reasons = [
    { icon: Cpu, title: 'Save Storage Space', desc: 'Compressed videos take up significantly less space on your device, letting you keep more content.' },
    { icon: Zap, title: 'Faster Sharing', desc: 'Smaller files upload and download faster. Share videos on messaging apps, email, or social media instantly.' },
    { icon: Monitor, title: 'Optimized for Web', desc: 'Reduce bandwidth usage on your website or app. Compressed videos load faster and provide a better user experience.' },
  ]

  return (
    <section id="why" className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center">Why Compress Your Videos?</h2>
        <p className="mt-3 text-slate-400 text-center max-w-lg mx-auto">Large video files can be a headache. Here is why compression helps.</p>
        <div className="mt-12 grid sm:grid-cols-3 gap-6">
          {reasons.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-xl bg-slate-800/40 border border-slate-700"
            >
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

function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 border-t border-slate-800">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center">Supported Features</h2>
        <p className="mt-3 text-slate-400 text-center max-w-lg mx-auto">Everything you need to compress videos efficiently.</p>
        <div className="mt-12 grid sm:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-xl bg-slate-800/40 border border-slate-700"
            >
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

function Footer() {
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

export default function App() {
  const [step, setStep] = useState('upload')
  const [file, setFile] = useState(null)
  const [preset, setPreset] = useState('balanced')
  const [advanced, setAdvanced] = useState({ resolution: '720p', fps: 30, crf: 26 })
  const [job, setJob] = useState(null)
  const [status, setStatus] = useState(null)
  const [progress, setProgress] = useState(0)
  const [meta, setMeta] = useState(null)
  const pollRef = useRef(null)

  const handleFileSelect = (f) => {
    console.log('File selected:', f.name, formatBytes(f.size))
    setFile(f)
    setMeta(null)
    setStep('preset')
  }

  const handleCompress = async (jobData) => {
    setStep('progress')
    setStatus('processing')
    setProgress(0)
    console.log('Starting compress for job:', jobData.job_id, 'preset:', preset)

    const body = { job_id: jobData.job_id, preset }
    if (preset === 'advanced') {
      body.resolution = advanced.resolution.replace('p', '')
      body.fps = advanced.fps
      body.crf = advanced.crf
    }

    try {
      const res = await fetch('/api/compress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      console.log('Compress response:', data)

      if (data.status === 'processing') {
        pollRef.current = setInterval(async () => {
          try {
            const r = await fetch(`/api/status/${jobData.job_id}`)
            const s = await r.json()
            if (s.progress != null) setProgress(s.progress)
            if (s.status === 'done') {
              clearInterval(pollRef.current)
              setProgress(100)
              setStatus('done')
              setJob(s)
              setStep('result')
              console.log('Compression done via poll')
            } else if (s.status === 'error') {
              clearInterval(pollRef.current)
              setStatus('error')
              console.error('Job failed:', s)
            }
          } catch (pollErr) {
            console.error('Poll error:', pollErr)
          }
        }, 1000)
      } else if (data.status === 'done') {
        setProgress(100)
        setStatus('done')
        setJob(data)
        setStep('result')
      } else if (data.error) {
        setStatus('error')
        console.error('Compression error:', data.error)
      }
    } catch (err) {
      setStatus('error')
      console.error('Compress fetch error:', err)
    }
  }

  const handleStartCompress = async () => {
    if (!file) return
    const form = new FormData()
    form.append('video', file)
    setStatus('pending')
    setStep('progress')
    console.log('Uploading file:', file.name, formatBytes(file.size))

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      console.log('Upload response:', data)

      if (data.job_id) {
        setJob(data)
        setMeta(data)
        await handleCompress(data)
      } else {
        setStatus('error')
        console.error('Upload failed:', data.error || 'unknown')
      }
    } catch (err) {
      setStatus('error')
      console.error('Upload fetch error:', err)
    }
  }

  const handleReset = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    setFile(null)
    setJob(null)
    setMeta(null)
    setStatus(null)
    setProgress(0)
    setPreset('balanced')
    setAdvanced({ resolution: '720p', fps: 30, crf: 26 })
    setStep('upload')
  }

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  return (
    <div className="min-h-svh bg-slate-950">
      <Navbar />
      <Hero />

      <section className="py-16 px-4">
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-white text-center">Compress Your Video</h2>

          {file && step !== 'upload' && (
            <VideoDetails file={file} meta={meta} onRemove={handleReset} />
          )}

          {step === 'upload' && <UploadZone onFileSelect={handleFileSelect} />}

          {step === 'preset' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center gap-2 text-slate-300">
                <Settings size={18} className="text-cyan-400" />
                <h3 className="font-semibold">Compression Mode</h3>
              </div>
              <PresetSelector
                selected={preset}
                onChange={setPreset}
                advanced={advanced}
                onAdvancedChange={setAdvanced}
              />
              <Button size="lg" className="w-full" onClick={handleStartCompress}>
                <Play size={18} /> Start Compression
              </Button>
            </motion.div>
          )}

          {step === 'progress' && (
            <div className="space-y-6 py-8">
              <ProgressBar status={status} progress={progress} />
              {status === 'error' && (
                <div className="text-center">
                  <p className="text-red-400 text-sm mb-3">Something went wrong. Check the debug panel for details.</p>
                  <Button variant="outline" onClick={handleReset}>Try Again</Button>
                </div>
              )}
            </div>
          )}

          {step === 'result' && job && <ResultCard job={job} />}

          {step === 'result' && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="w-full">
              <Upload size={14} /> Compress Another Video
            </Button>
          )}
        </div>
      </section>

      <WhySection />
      <FeaturesSection />
      <Footer />
      <DebugPanel />
    </div>
  )
}