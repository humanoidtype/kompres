export const PRESETS = {
  maximum: { label: "Maximum", res: "480p", fps: 24, crf: 32, desc: "Max compression", saving: "~85-90% smaller" },
  balanced: { label: "Balanced", res: "720p", fps: 30, crf: 26, desc: "Good quality", saving: "~70-80% smaller" },
  minimum: { label: "Minimum", res: "source", fps: 30, crf: 22, desc: "Minimal loss", saving: "~40-60% smaller" },
  advanced: { label: "Advanced", res: null, fps: null, crf: null, desc: "Full control", saving: null }
}

export const RES_OPTIONS = ["240p", "360p", "480p", "720p", "1080p"]
export const FPS_OPTIONS = [24, 30, 60]

export const FEATURES = [
  { title: "Fast Processing", desc: "Optimized FFmpeg encoding with hardware acceleration support for quick compression." },
  { title: "All Formats", desc: "Supports MP4, MKV, AVI, MOV, WebM, 3GP, MPEG, and more." },
  { title: "Multiple Presets", desc: "Maximum to Minimum mode — choose your balance between size and quality." },
  { title: "100% Private", desc: "Your files are processed securely. We do not store or share your videos with any third parties." }
]
