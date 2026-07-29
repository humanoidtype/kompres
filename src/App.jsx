import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Upload, Settings, Play } from "lucide-react"
import { Button } from "./components/ui/button"
import { formatBytes } from "./utils/format"

import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import UploadZone from "./components/UploadZone"
import VideoDetails from "./components/VideoDetails"
import PresetSelector from "./components/PresetSelector"
import ProgressBar from "./components/ProgressBar"
import ResultCard from "./components/ResultCard"
import WhySection from "./components/WhySection"
import FeaturesSection from "./components/FeaturesSection"
import Footer from "./components/Footer"
import DebugPanel from "./components/DebugPanel"

export default function App() {
  const [step, setStep] = useState("upload")
  const [file, setFile] = useState(null)
  const [preset, setPreset] = useState("balanced")
  const [advanced, setAdvanced] = useState({ resolution: "720p", fps: 30, crf: 26 })
  const [job, setJob] = useState(null)
  const [status, setStatus] = useState(null)
  const [progress, setProgress] = useState(0)
  const [meta, setMeta] = useState(null)
  const pollRef = useRef(null)

  const handleFileSelect = f => {
    console.log("File selected:", f.name, formatBytes(f.size))
    setFile(f)
    setMeta(null)
    setStep("preset")
  }

  const handleCompress = async jobData => {
    setStep("progress")
    setStatus("processing")
    setProgress(0)
    console.log("Starting compress for job:", jobData.job_id, "preset:", preset)

    const body = { job_id: jobData.job_id, preset }
    if (preset === "advanced") {
      body.resolution = advanced.resolution.replace("p", "")
      body.fps = advanced.fps
      body.crf = advanced.crf
    }

    try {
      const res = await fetch("/api/compress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      console.log("Compress response:", data)

      if (data.status === "processing") {
        pollRef.current = setInterval(async () => {
          try {
            const r = await fetch(`/api/status/${jobData.job_id}`)
            const s = await r.json()
            if (s.progress != null) setProgress(s.progress)
            if (s.status === "done") {
              clearInterval(pollRef.current)
              setProgress(100)
              setStatus("done")
              setJob(s)
              setStep("result")
              console.log("Compression done via poll")
            } else if (s.status === "error") {
              clearInterval(pollRef.current)
              setStatus("error")
              console.error("Job failed:", s)
            }
          } catch (pollErr) {
            console.error("Poll error:", pollErr)
          }
        }, 1000)
      } else if (data.status === "done") {
        setProgress(100)
        setStatus("done")
        setJob(data)
        setStep("result")
      } else if (data.error) {
        setStatus("error")
        console.error("Compression error:", data.error)
      }
    } catch (err) {
      setStatus("error")
      console.error("Compress fetch error:", err)
    }
  }

  const handleStartCompress = async () => {
    if (!file) return
    const form = new FormData()
    form.append("video", file)
    setStatus("pending")
    setStep("progress")
    console.log("Uploading file:", file.name, formatBytes(file.size))

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form })
      const data = await res.json()
      console.log("Upload response:", data)

      if (data.job_id) {
        setJob(data)
        setMeta(data)
        await handleCompress(data)
      } else {
        setStatus("error")
        console.error("Upload failed:", data.error || "unknown")
      }
    } catch (err) {
      setStatus("error")
      console.error("Upload fetch error:", err)
    }
  }

  const handleReset = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    setFile(null)
    setJob(null)
    setMeta(null)
    setStatus(null)
    setProgress(0)
    setPreset("balanced")
    setAdvanced({ resolution: "720p", fps: 30, crf: 26 })
    setStep("upload")
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

          {file && step !== "upload" && <VideoDetails file={file} meta={meta} onRemove={handleReset} />}

          {step === "upload" && <UploadZone onFileSelect={handleFileSelect} />}

          {step === "preset" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center gap-2 text-slate-300">
                <Settings size={18} className="text-cyan-400" />
                <h3 className="font-semibold">Compression Mode</h3>
              </div>
              <PresetSelector selected={preset} onChange={setPreset} advanced={advanced} onAdvancedChange={setAdvanced} />
              <Button size="lg" className="w-full" onClick={handleStartCompress}>
                <Play size={18} /> Start Compression
              </Button>
            </motion.div>
          )}

          {step === "progress" && (
            <div className="space-y-6 py-8">
              <ProgressBar status={status} progress={progress} />
              {status === "error" && (
                <div className="text-center">
                  <p className="text-red-400 text-sm mb-3">Something went wrong. Check the debug panel for details.</p>
                  <Button variant="outline" onClick={handleReset}>Try Again</Button>
                </div>
              )}
            </div>
          )}

          {step === "result" && job && <ResultCard job={job} />}

          {step === "result" && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="w-full">
              <Upload size={14} /> Compress Another Video
            </Button>
          )}
        </div>
      </section>

      <WhySection />
      <FeaturesSection />
      <Footer />
      {import.meta.env.VITE_DEV_MODE === "true" && <DebugPanel />}
    </div>
  )
}
