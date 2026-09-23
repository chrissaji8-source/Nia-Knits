import { useState, useId } from 'react'
import craftStory from '../../data/craftStory.json'
import CraftTimeline from './CraftTimeline'
import HobbyChips from './HobbyChips'

/**
 * Pushpin SVG component
 */
function MetallicPushpin({ className = '', color = 'brass' }) {
  const uniqueId = useId()
  const gradientId = `pushpin-grad-${color}-${uniqueId.replace(/:/g, '')}`

  return (
    <svg
      className={`metallic-pushpin w-4 h-4 drop-shadow-[2px_3px_2px_rgba(48,38,41,0.28)] ${className}`}
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={gradientId} cx="35%" cy="35%" r="65%">
          {color === 'brass' ? (
            <>
              <stop offset="0%" stopColor="#FFF3D4" />
              <stop offset="40%" stopColor="#D49A72" />
              <stop offset="100%" stopColor="#7E4A28" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#FAD4DF" />
              <stop offset="40%" stopColor="#B94D68" />
              <stop offset="100%" stopColor="#5E1D2D" />
            </>
          )}
        </radialGradient>
      </defs>
      <circle cx="10" cy="10" r="8" fill={`url(#${gradientId})`} />
      <circle cx="8" cy="8" r="3" fill="#FFFFFF" fillOpacity="0.45" />
      <circle cx="10" cy="10" r="7.5" fill="none" stroke="rgba(48,38,41,0.25)" strokeWidth="0.8" />
    </svg>
  )
}

/**
 * Washi Tape strip SVG/HTML component
 */
function WashiTape({ color = 'rgba(212, 154, 114, 0.65)', angle = -1.5, className = '' }) {
  return (
    <div
      className={`washi-tape-strip pointer-events-none absolute z-10 h-5 w-20 shadow-sm border-l-2 border-r-2 border-dashed border-[#302629]/25 backdrop-blur-[1px] ${className}`}
      style={{
        backgroundColor: color,
        transform: `rotate(${angle}deg)`,
      }}
      aria-hidden="true"
    />
  )
}

/**
 * Scrapbook Polaroid Card component
 */
function ScrapbookPolaroid({ polaroid, onOpenImage, className = '' }) {
  const [isHovered, setIsHovered] = useState(false)

  const handleImageClick = () => {
    if (typeof onOpenImage === 'function') {
      onOpenImage({
        src: polaroid.src,
        alt: polaroid.alt,
        title: polaroid.caption,
      })
    }
  }

  return (
    <div
      className={`scrapbook-polaroid-card group relative rounded-sm bg-[#FFFDF9] p-3 pb-4 border border-[#302629]/15 shadow-[0_12px_28px_rgba(48,38,41,0.12),0_2px_6px_rgba(48,38,41,0.06)] transition-all duration-300 ${className}`}
      style={{
        transform: isHovered ? 'rotate(0deg) scale(1.02)' : `rotate(${polaroid.angle}deg)`,
        transformOrigin: 'center center',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Washi Tape */}
      <WashiTape
        color={polaroid.washiColor}
        angle={polaroid.washiAngle || (polaroid.angle > 0 ? -2 : 2)}
        className="-top-2.5 left-1/2 -translate-x-1/2"
      />

      {/* Craft Pin */}
      <div className="absolute -top-1.5 right-3 z-20 pointer-events-none">
        <MetallicPushpin color={polaroid.angle > 0 ? 'berry' : 'brass'} />
      </div>

      {/* Badge */}
      {polaroid.badge && (
        <span className="absolute top-4 left-4 z-10 rounded-full bg-[#FFFDF9]/90 backdrop-blur-xs px-2 py-0.5 font-mono text-[0.62rem] font-semibold tracking-wide text-[#963B54] shadow-xs border border-[#302629]/10">
          {polaroid.badge}
        </span>
      )}

      {/* Photo Frame */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xs bg-[#F1E5E3] cursor-pointer">
        <img
          src={polaroid.src}
          alt={polaroid.alt}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Lightbox Trigger Overlay */}
        <button
          type="button"
          onClick={handleImageClick}
          className="absolute inset-0 flex items-center justify-center bg-[#302629]/0 opacity-0 group-hover:bg-[#302629]/20 group-hover:opacity-100 transition-all duration-200 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D49A72]"
          aria-label={`Zoom photo: ${polaroid.caption}`}
        >
          <span className="rounded-full bg-[#FFFDF9]/95 px-3 py-1 font-mono text-xs font-semibold text-[#302629] shadow-md flex items-center gap-1.5">
            <span>🔍</span>
            <span>View Snapshot</span>
          </span>
        </button>
      </div>

      {/* Handwritten / Monospace Caption */}
      <div className="mt-2.5 px-1 flex items-center justify-between text-left">
        <p className="font-mono text-[0.68rem] font-bold uppercase tracking-wider text-[#302629] line-clamp-1">
          {polaroid.caption}
        </p>
        <span className="font-mono text-[0.6rem] text-[#705D62] select-none" aria-hidden="true">
          ✦
        </span>
      </div>
    </div>
  )
}

/**
 * Scrapbook Sticky Note component
 */
function ScrapbookStickyNote({ note }) {
  return (
    <div
      className="scrapbook-sticky-note relative rounded-sm p-3.5 shadow-[0_4px_12px_rgba(48,38,41,0.08)] border border-[#302629]/10 transition-transform duration-200 hover:rotate-0 hover:scale-105 select-none"
      style={{
        backgroundColor: note.bg || '#FFF9E6',
        color: note.color || '#302629',
        transform: `rotate(${note.angle}deg)`,
      }}
    >
      {/* Mini metallic pin at top center */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none">
        <MetallicPushpin className="w-3.5 h-3.5" color="brass" />
      </div>
      <p className="font-serif italic text-xs md:text-sm text-center leading-snug pt-1">
        {note.text}
      </p>
    </div>
  )
}

/**
 * ScrapbookAbout — Artisan Scrapbook About Section
 *
 * @param {Object} props
 * @param {function({ src: string, alt: string, title: string }): void} [props.onOpenImage] - Callback for opening image in Lightbox
 * @param {number} [props.activeStep] - Optional controlled timeline step
 * @param {function(number): void} [props.onSelectStep] - Optional timeline step handler
 * @param {string|null} [props.activeHobby] - Optional controlled active hobby
 * @param {function(string): void} [props.onToggleHobby] - Optional hobby toggle handler
 * @param {string} [props.className] - Optional container class name
 */
export default function ScrapbookAbout({
  onOpenImage,
  activeStep,
  onSelectStep,
  activeHobby,
  onToggleHobby,
  className = '',
}) {
  const { makerBio, polaroids, stickyNotes } = craftStory

  return (
    <section
      id="about"
      className={`scrapbook-about-section section-shell relative my-20 py-16 px-4 sm:px-6 md:px-10 lg:px-12 rounded-3xl border border-dashed border-[#302629]/20 bg-[#FFF8F5]/90 shadow-[0_16px_40px_rgba(48,38,41,0.06)] overflow-hidden ${className}`}
      aria-labelledby="about-title"
    >
      {/* Washi tape accents at top edge */}
      <WashiTape color="rgba(185, 77, 104, 0.45)" angle={-2} className="-top-2.5 left-12" />
      <WashiTape color="rgba(116, 129, 108, 0.45)" angle={1.5} className="-top-2.5 right-16" />

      {/* Top Header Section */}
      <div className="mb-12 text-center md:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#B94D68]/30 bg-[#B94D68]/10 px-3.5 py-1 text-xs font-mono uppercase tracking-wider text-[#963B54] mb-3">
          <span>🌸</span>
          <span>{makerBio.heroEyebrow || 'The Maker & The Craft'}</span>
        </div>
        <h2
          id="about-title"
          className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#302629]"
        >
          {makerBio.heading}
        </h2>
      </div>

      {/* Main 2-Column Scrapbook Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column (5 cols): Polaroid Collage & Sticky Notes */}
        <div className="lg:col-span-5 relative flex flex-col items-center gap-6">
          {/* Primary Maker Polaroid (Neha's Portrait) */}
          <div className="w-full max-w-[320px] relative z-10">
            {polaroids?.[0] && (
              <ScrapbookPolaroid
                polaroid={polaroids[0]}
                onOpenImage={onOpenImage}
                className="w-full"
              />
            )}
          </div>

          {/* Secondary Flatlay Polaroid */}
          <div className="w-full max-w-[320px] relative">
            {polaroids?.[1] && (
              <ScrapbookPolaroid
                polaroid={polaroids[1]}
                onOpenImage={onOpenImage}
                className="w-full"
              />
            )}
          </div>

          {/* Sticky Notes Row */}
          {stickyNotes && stickyNotes.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 w-full max-w-[320px]">
              {stickyNotes.slice(0, 2).map((note) => (
                <ScrapbookStickyNote key={note.id} note={note} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Maker Bio Story & Hobby Chips */}
        <div className="lg:col-span-7 space-y-6">
          {/* Intro Story Paper Card */}
          <div className="rounded-2xl border border-[#302629]/15 bg-[#FFFDF9] p-6 md:p-8 shadow-sm space-y-4 relative">
            {/* Metallic Pushpin on Top Right */}
            <div className="absolute -top-2 right-6 pointer-events-none">
              <MetallicPushpin color="berry" />
            </div>

            <div className="space-y-1">
              <p className="font-mono text-xs uppercase tracking-widest text-[#B94D68] font-bold">
                Maker Story · Neha Jose
              </p>
              <h3 className="font-serif text-xl md:text-2xl font-bold text-[#302629]">
                {makerBio.intro}
              </h3>
            </div>

            {/* Paragraphs in Maker's Warm Voice */}
            <div className="space-y-3.5 text-sm md:text-base leading-relaxed text-[#705D62]">
              {makerBio.paragraphs.map((para, i) => (
                <p key={i} className="text-[#302629]/85">
                  {para}
                </p>
              ))}
            </div>

            {/* Craft Philosophy Highlight Box */}
            <div className="rounded-xl border-l-4 border-[#B94D68] bg-[#F1E5E3]/40 p-4">
              <p className="font-serif italic text-sm md:text-base text-[#302629] leading-snug">
                &ldquo;{makerBio.philosophy}&rdquo;
              </p>
              <p className="font-mono text-xs text-[#705D62] mt-1.5 uppercase tracking-wider">
                — {makerBio.name}, {makerBio.brand} ({makerBio.origin})
              </p>
            </div>
          </div>

          {/* Interactive Maker Hobby Chips */}
          <div className="rounded-2xl border border-[#302629]/15 bg-[#FFFDF9] p-6 md:p-7 shadow-sm">
            <HobbyChips
              activeHobby={activeHobby}
              onToggleHobby={onToggleHobby}
            />
          </div>
        </div>
      </div>

      {/* Full-Width Interactive 4-Step Craft Timeline */}
      <CraftTimeline
        activeStep={activeStep}
        onSelectStep={onSelectStep}
      />
    </section>
  )
}
