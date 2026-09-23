import { useState, useEffect, useRef } from 'react'
import { vinylEngine, STUDIO_TRACKS } from '../../utils/vinylAudioEngine'
import './vinyl.css'

export default function VinylPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(STUDIO_TRACKS[0])
  const [volume, setVolume] = useState(0.65)
  const [isMuted, setIsMuted] = useState(false)
  const prevVolumeRef = useRef(0.65)
  const modalRef = useRef(null)

  useEffect(() => {
    // Handle Escape key to close expanded modal
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isExpanded])

  const handleTogglePlay = (e) => {
    e?.stopPropagation()
    const active = vinylEngine.toggle()
    setIsPlaying(active)
  }

  const handleNextTrack = (e) => {
    e?.stopPropagation()
    const next = vinylEngine.nextTrack()
    setCurrentTrack(next)
  }

  const handlePrevTrack = (e) => {
    e?.stopPropagation()
    const prev = vinylEngine.prevTrack()
    setCurrentTrack(prev)
  }

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value)
    setVolume(newVol)
    setIsMuted(newVol === 0)
    vinylEngine.setVolume(newVol)
  }

  const handleToggleMute = (e) => {
    e?.stopPropagation()
    if (isMuted) {
      const restored = prevVolumeRef.current || 0.65
      setVolume(restored)
      setIsMuted(false)
      vinylEngine.setVolume(restored)
    } else {
      prevVolumeRef.current = volume
      setVolume(0)
      setIsMuted(true)
      vinylEngine.setVolume(0)
    }
  }

  return (
    <>
      {/* 1. Floating Mini Vinyl Player Trigger (Bottom Left) */}
      <div
        className="vinyl-floating-trigger"
        onClick={() => setIsExpanded(true)}
        role="button"
        tabIndex={0}
        aria-label={`Studio Vinyl Player: ${currentTrack.title}. ${isPlaying ? 'Currently playing' : 'Paused'}. Click to expand player.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsExpanded((prev) => !prev)
          }
        }}
      >
        {/* Mini Spinning Vinyl Disc */}
        <div className={`mini-vinyl-disc ${isPlaying ? 'is-spinning' : ''}`}>
          <div className="mini-vinyl-grooves" />
          <div
            className="mini-vinyl-label"
            style={{ backgroundColor: currentTrack.accent || 'var(--berry)' }}
          >
            <div className="mini-vinyl-center-hole" />
          </div>
        </div>

        {/* Track Info */}
        <div className="vinyl-trigger-info">
          <span className="vinyl-trigger-label">
            <span>{isPlaying ? 'Playing' : 'Studio Vinyl'}</span>
            {isPlaying && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--moss)] animate-pulse" />
            )}
          </span>
          <span className="vinyl-trigger-track">{currentTrack.title}</span>
        </div>

        {/* Animated Equalizer Bars */}
        <div className={`vinyl-equalizer ${isPlaying ? 'is-active' : ''}`} aria-hidden="true">
          <div className="equalizer-bar" />
          <div className="equalizer-bar" />
          <div className="equalizer-bar" />
          <div className="equalizer-bar" />
        </div>

        {/* Quick Play/Pause Trigger */}
        <button
          type="button"
          className="ml-1 p-1.5 rounded-full text-[var(--ink)] hover:text-[var(--berry)] hover:bg-black/5 transition-colors cursor-pointer"
          onClick={handleTogglePlay}
          aria-label={isPlaying ? 'Pause studio music' : 'Play studio music'}
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>
      </div>

      {/* 2. Expanded Vintage Turntable Deck Popover */}
      {isExpanded && (
        <>
          <div
            className="vinyl-deck-scrim"
            onClick={() => setIsExpanded(false)}
            aria-hidden="true"
          />

          <div
            ref={modalRef}
            className="vinyl-deck-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Vintage Vinyl Turntable Player"
          >
            {/* Close Button */}
            <button
              type="button"
              className="turntable-close-btn"
              onClick={() => setIsExpanded(false)}
              aria-label="Close vinyl player deck"
            >
              ✕
            </button>

            {/* Turntable Platter Deck Area */}
            <div className="turntable-platter-deck">
              {/* Full Spinning Vinyl LP Record */}
              <div className={`vinyl-lp-disc ${isPlaying ? 'is-spinning' : ''}`}>
                <div className="vinyl-lp-sheen" />
                <div className="vinyl-lp-grooves" />
                <div
                  className="vinyl-lp-label"
                  style={{ backgroundColor: currentTrack.accent || 'var(--berry)' }}
                >
                  <span className="vinyl-lp-label-text">Nia Knits</span>
                  <span className="vinyl-lp-label-sub">Studio Mix</span>
                  <div className="vinyl-lp-center-spindle" />
                </div>
              </div>

              {/* Tonearm Base & Arm */}
              <div className="turntable-tonearm-base" />
              <div className={`turntable-tonearm ${isPlaying ? 'is-on-record' : ''}`}>
                <div className="tonearm-pole" />
                <div className="tonearm-headshell">
                  <div className="tonearm-needle" />
                </div>
              </div>
            </div>

            {/* Track Meta */}
            <div className="turntable-track-meta">
              <span className="turntable-side-badge">{currentTrack.side}</span>
              <h3 className="turntable-track-title">{currentTrack.title}</h3>
              <p className="turntable-track-sub">{currentTrack.subtitle}</p>
            </div>

            {/* Playback Controls */}
            <div className="turntable-controls">
              <button
                type="button"
                className="turntable-btn-skip"
                onClick={handlePrevTrack}
                aria-label="Previous studio track"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="19 20 9 12 19 4 19 20" />
                  <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2.5" />
                </svg>
              </button>

              <button
                type="button"
                className="turntable-btn-play"
                onClick={handleTogglePlay}
                aria-label={isPlaying ? 'Pause music' : 'Play music'}
              >
                {isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                className="turntable-btn-skip"
                onClick={handleNextTrack}
                aria-label="Next studio track"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 4 15 12 5 20 5 4" />
                  <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" />
                </svg>
              </button>
            </div>

            {/* Volume Control Row */}
            <div className="turntable-volume-row">
              <button
                type="button"
                className="volume-icon-btn"
                onClick={handleToggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="volume-slider"
                aria-label="Turntable Volume Slider"
              />

              <span className="font-mono text-[10px] text-[var(--ink-soft)] w-8 text-right">
                {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
              </span>
            </div>
          </div>
        </>
      )}
    </>
  )
}
