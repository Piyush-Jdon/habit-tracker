class SoundEffects {
  private ctx: AudioContext | null = null

  private init() {
    if (typeof window === 'undefined') return
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) this.ctx = new AudioCtx()
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  // Subtle mechanical pop on tapping +/- or toggling
  playPop() {
    try {
      this.init()
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(420, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.05)
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + 0.05)
    } catch {}
  }

  // Harmonic chord on full habit completion
  playSuccess() {
    try {
      this.init()
      if (!this.ctx) return
      const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator()
        const gain = this.ctx!.createGain()
        osc.type = 'triangle'
        osc.frequency.value = freq
        const startTime = this.ctx!.currentTime + idx * 0.04
        gain.gain.setValueAtTime(0.08, startTime)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28)
        osc.connect(gain)
        gain.connect(this.ctx!.destination)
        osc.start(startTime)
        osc.stop(startTime + 0.3)
      })
    } catch {}
  }

  // Low warning tone when logging a slip on an abstinence habit
  playWarning() {
    try {
      this.init()
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(180, this.ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.14)
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.14)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + 0.15)
    } catch {}
  }
}

export const sounds = new SoundEffects()