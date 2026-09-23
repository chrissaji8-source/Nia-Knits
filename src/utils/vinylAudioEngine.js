/**
 * Cozy Vinyl Audio Engine for Nia Knits
 * Generates soothing ambient studio music and authentic vinyl crackle
 * using the Web Audio API with zero external dependencies, 100% offline reliability,
 * and zero network latency.
 */

export const STUDIO_TRACKS = [
  {
    id: 'track-1',
    title: 'Chai & Cinnamon Loops',
    subtitle: 'Warm Acoustic Studio Chords',
    side: 'Side A · 33⅓ RPM',
    duration: 180,
    bpm: 68,
    scale: [261.63, 329.63, 392.0, 493.88, 523.25, 659.25], // Cmaj7 / Am9 / Fmaj7 palette
    chords: [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],   // Am7
      [174.61, 220.0, 261.63, 329.63],  // Fmaj7
      [196.0, 246.94, 293.66, 349.23],  // G7
    ],
    accent: '#B94D68',
  },
  {
    id: 'track-2',
    title: 'Rain on Bandra Balcony',
    subtitle: 'Mellow Electric Piano & Rain Drops',
    side: 'Side A · Track 2',
    duration: 210,
    bpm: 60,
    scale: [220.0, 277.18, 329.63, 415.3, 440.0, 554.37], // A maj / F#m palette
    chords: [
      [220.0, 277.18, 329.63, 415.3],   // Amaj7
      [185.0, 220.0, 277.18, 329.63],   // F#m7
      [146.83, 185.0, 220.0, 277.18],   // Dmaj7
      [164.81, 207.65, 246.94, 293.66], // E7
    ],
    accent: '#74816C',
  },
  {
    id: 'track-3',
    title: 'Midnight Stitches',
    subtitle: 'Slow Dreamy Harp & Cozy Night Hum',
    side: 'Side B · Track 1',
    duration: 240,
    bpm: 54,
    scale: [196.0, 246.94, 293.66, 370.0, 392.0, 493.88], // Gmaj7 / Em9 palette
    chords: [
      [196.0, 246.94, 293.66, 370.0],   // Gmaj7
      [164.81, 196.0, 246.94, 293.66],  // Em7
      [130.81, 164.81, 196.0, 246.94],  // Cmaj7
      [146.83, 185.0, 220.0, 261.63],   // D7
    ],
    accent: '#D49A72',
  },
]

class VinylAudioEngine {
  constructor() {
    this.audioCtx = null
    this.masterGain = null
    this.crackleGain = null
    this.musicGain = null
    this.isPlaying = false
    this.currentTrackIndex = 0
    this.volume = 0.65
    this.timerId = null
    this.chordStep = 0
    this.noteStep = 0
    this.crackleNode = null
    this.activeNodes = []
  }

  initContext() {
    if (this.audioCtx) return
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return

    this.audioCtx = new AudioContextClass()

    // Master Volume Gain
    this.masterGain = this.audioCtx.createGain()
    this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime)
    this.masterGain.connect(this.audioCtx.destination)

    // Music Sub-gain with warm analog low-pass filter
    this.musicFilter = this.audioCtx.createBiquadFilter()
    this.musicFilter.type = 'lowpass'
    this.musicFilter.frequency.setValueAtTime(1200, this.audioCtx.currentTime)
    this.musicFilter.Q.setValueAtTime(1.2, this.audioCtx.currentTime)

    this.musicGain = this.audioCtx.createGain()
    this.musicGain.gain.setValueAtTime(0.4, this.audioCtx.currentTime)
    this.musicGain.connect(this.musicFilter)
    this.musicFilter.connect(this.masterGain)

    // Vinyl Crackle Sub-gain
    this.crackleGain = this.audioCtx.createGain()
    this.crackleGain.gain.setValueAtTime(0.06, this.audioCtx.currentTime)
    this.crackleGain.connect(this.masterGain)

    this.startCrackle()
  }

  startCrackle() {
    if (!this.audioCtx || this.crackleNode) return

    // Generate 4 seconds of warm vinyl noise loop
    const bufferSize = this.audioCtx.sampleRate * 4
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate)
    const output = noiseBuffer.getChannelData(0)

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      // Pink noise filter approximation
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.1538520
      b3 = 0.86650 * b3 + white * 0.3104856
      b4 = 0.55000 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.0168980
      let pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04
      b6 = white * 0.115926

      // Occasional random vinyl stylus pop/crackle tick
      if (Math.random() < 0.00035) {
        pink += (Math.random() * 2 - 1) * 0.45
      }
      output[i] = pink
    }

    const whiteNoise = this.audioCtx.createBufferSource()
    whiteNoise.buffer = noiseBuffer
    whiteNoise.loop = true

    // Bandpass filter for authentic phonograph needle range
    const crackleFilter = this.audioCtx.createBiquadFilter()
    crackleFilter.type = 'bandpass'
    crackleFilter.frequency.setValueAtTime(2200, this.audioCtx.currentTime)
    crackleFilter.Q.setValueAtTime(1.5, this.audioCtx.currentTime)

    whiteNoise.connect(crackleFilter)
    crackleFilter.connect(this.crackleGain)
    whiteNoise.start()

    this.crackleNode = whiteNoise
  }

  playNote(freq, time, duration = 2.4, isPluck = false) {
    if (!this.audioCtx) return

    const osc = this.audioCtx.createOscillator()
    const noteGain = this.audioCtx.createGain()

    // Warm Rhodes / Nylon acoustic string harmonic blend
    osc.type = isPluck ? 'triangle' : 'sine'
    osc.frequency.setValueAtTime(freq, time)

    // Slight vintage tape wow/flutter pitch variation
    const vibrato = this.audioCtx.createOscillator()
    const vibratoGain = this.audioCtx.createGain()
    vibrato.frequency.setValueAtTime(4.5 + Math.random() * 0.5, time)
    vibratoGain.gain.setValueAtTime(1.2, time)
    vibrato.connect(osc.frequency)
    vibrato.start(time)
    vibrato.stop(time + duration)

    // Warm envelope
    const attack = isPluck ? 0.02 : 0.4
    const decay = duration * 0.7
    noteGain.gain.setValueAtTime(0.0001, time)
    noteGain.gain.exponentialRampToValueAtTime(0.18, time + attack)
    noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration)

    osc.connect(noteGain)
    noteGain.connect(this.musicGain)

    osc.start(time)
    osc.stop(time + duration)

    this.activeNodes.push(osc, vibrato)
  }

  playNextProgressionStep() {
    if (!this.isPlaying || !this.audioCtx) return

    const track = STUDIO_TRACKS[this.currentTrackIndex]
    const chord = track.chords[this.chordStep % track.chords.length]
    const now = this.audioCtx.currentTime

    // Play lush background pad chord
    chord.forEach((freq, idx) => {
      this.playNote(freq, now + idx * 0.08, 3.8, false)
    })

    // Play sparkling gentle arpeggio notes
    const melodyNote1 = track.scale[Math.floor(Math.random() * track.scale.length)]
    const melodyNote2 = track.scale[Math.floor(Math.random() * track.scale.length)]
    this.playNote(melodyNote1 * 1.5, now + 0.6, 1.8, true)
    this.playNote(melodyNote2 * 1.5, now + 1.4, 2.0, true)

    this.chordStep = (this.chordStep + 1) % track.chords.length

    const intervalMs = (60 / track.bpm) * 4 * 1000
    this.timerId = setTimeout(() => {
      this.playNextProgressionStep()
    }, intervalMs)
  }

  async play() {
    this.initContext()
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume()
    }
    this.isPlaying = true
    this.masterGain.gain.setTargetAtTime(this.volume, this.audioCtx.currentTime, 0.15)
    this.playNextProgressionStep()
  }

  pause() {
    this.isPlaying = false
    if (this.timerId) {
      clearTimeout(this.timerId)
      this.timerId = null
    }
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(0.0001, this.audioCtx.currentTime, 0.2)
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.pause()
      return false
    } else {
      this.play()
      return true
    }
  }

  setTrack(index) {
    this.currentTrackIndex = (index + STUDIO_TRACKS.length) % STUDIO_TRACKS.length
    this.chordStep = 0
    if (this.isPlaying) {
      if (this.timerId) clearTimeout(this.timerId)
      this.playNextProgressionStep()
    }
    return STUDIO_TRACKS[this.currentTrackIndex]
  }

  nextTrack() {
    return this.setTrack(this.currentTrackIndex + 1)
  }

  prevTrack() {
    return this.setTrack(this.currentTrackIndex - 1)
  }

  setVolume(newVol) {
    this.volume = Math.max(0, Math.min(1, newVol))
    if (this.masterGain && this.audioCtx && this.isPlaying) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.audioCtx.currentTime, 0.05)
    }
  }
}

export const vinylEngine = new VinylAudioEngine()
