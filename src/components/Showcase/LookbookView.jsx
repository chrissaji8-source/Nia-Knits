import { useContext, useState } from 'react'
import { BasketContext } from '../../context/BasketContext'
import { formatSinglePieceInquiry, openInstagramDM } from '../../utils/inquiry'

function useSafeBasket() {
  return useContext(BasketContext)
}

/**
 * Editorial Interactive Loupe for inspecting yarn stitches & crochet texture.
 */
function TextureZoomImage({ imageSrc, alt, onOpenQuickView, badge, pieceNum }) {
  const [isHovered, setIsHovered] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    })
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => setIsHovered(false)

  return (
    <div
      className="relative w-full aspect-[4/5] sm:aspect-[1/1] md:aspect-[4/5] lg:aspect-[5/6] overflow-hidden rounded-2xl bg-[var(--canvas)] border border-[var(--ink)]/15 shadow-xl group select-none cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onOpenQuickView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpenQuickView?.()
        }
      }}
      aria-label={`${alt}. Hover to inspect stitch texture, click for full details.`}
    >
      {/* Background/Base Image */}
      <img
        src={imageSrc}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        loading="lazy"
      />

      {/* Craft badge and piece number */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
        <span className="px-3 py-1 rounded-full bg-[var(--canvas-soft)]/95 text-[var(--ink)] font-mono text-xs font-semibold shadow-md border border-[var(--ink)]/10 backdrop-blur-sm">
          #{pieceNum}
        </span>
        {badge && (
          <span className="px-3 py-1 rounded-full bg-[var(--canvas-soft)]/95 text-[var(--berry-deep)] font-mono text-xs font-semibold uppercase tracking-wider shadow-md border border-[var(--ink)]/10 backdrop-blur-sm">
            {badge}
          </span>
        )}
      </div>

      {/* Floating Loupe Magnifier Lens (Desktop) */}
      {isHovered && imageSrc && (
        <div
          className="absolute pointer-events-none z-20 hidden md:block rounded-full overflow-hidden transition-opacity duration-200 shadow-2xl"
          style={{
            width: '170px',
            height: '170px',
            left: `${mousePos.x - 85}px`,
            top: `${mousePos.y - 85}px`,
            border: '2.5px solid var(--ochre)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.4)',
            backgroundImage: `url("${imageSrc}")`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: '260%',
            backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
          }}
        />
      )}

      {/* Mobile inspection hint banner */}
      <div className="absolute bottom-4 inset-x-4 z-10 flex items-center justify-between pointer-events-none">
        <span className="px-3 py-1.5 rounded-full bg-[var(--ink)]/80 text-[var(--canvas-soft)] font-mono text-[11px] font-medium backdrop-blur-sm shadow-md md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          🔍 {isHovered ? '2.5× Hand-Stitch Texture' : 'Hover / Tap to Inspect Texture'}
        </span>
        <span className="hidden sm:inline-block px-3 py-1.5 rounded-full bg-[var(--canvas-soft)]/90 text-[var(--ink)] font-mono text-[11px] font-semibold border border-[var(--ink)]/10 shadow-sm">
          Click for Quick View ↗
        </span>
      </div>
    </div>
  )
}

/**
 * Editorial Magazine Spread for an individual artisan piece.
 */
function LookbookSpread({
  work,
  index,
  onOpenQuickView,
  onInquire,
  isSaved,
  onToggleBasket,
}) {
  const isEven = index % 2 === 0
  const imageSrc = work.images?.[0]
  const pieceNum = String(index + 1).padStart(2, '0')

  const handleInstagramInquiry = async () => {
    const text = formatSinglePieceInquiry(work)
    await openInstagramDM(text)
  }

  const handleInquireClick = () => {
    if (onInquire) {
      onInquire(work.title)
      return
    }

    if (typeof window !== 'undefined') {
      window.location.hash = '#contact'
      const contactSection = document.getElementById('contact')
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' })
        const input = document.querySelector('input[name="regarding"]')
        if (input) {
          input.value = work.title
          input.dispatchEvent(new Event('input', { bubbles: true }))
          input.focus()
        }
      }
    }
  }

  // Visual Image Column
  const imageColumn = (
    <div className="w-full lg:w-[56%] flex-shrink-0">
      <TextureZoomImage
        imageSrc={imageSrc}
        alt={`${work.title} editorial view`}
        onOpenQuickView={() => onOpenQuickView(work)}
        badge={work.badge}
        pieceNum={pieceNum}
      />
    </div>
  )

  // Editorial Note Column
  const noteColumn = (
    <div className="w-full lg:w-[44%] flex flex-col justify-between py-2">
      {/* Washi Tape Graphic Motif */}
      <div className="relative mb-6">
        <div
          className="inline-block px-5 py-1 text-[10px] font-mono font-semibold uppercase tracking-widest text-[var(--ink)] shadow-xs"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--ochre) 50%, var(--canvas-soft))',
            borderLeft: '2px dashed rgba(0,0,0,0.15)',
            borderRight: '2px dashed rgba(0,0,0,0.15)',
            transform: isEven ? 'rotate(-1.5deg)' : 'rotate(1.5deg)',
          }}
        >
          Edition #{pieceNum} · {work.category}
        </div>
      </div>

      <div>
        <h3 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 font-['Coustard',serif] text-[var(--ink)] leading-tight">
          {work.title}
        </h3>

        {work.description && (
          <p className="text-base text-[var(--ink-soft)] leading-relaxed mb-6">
            {work.description}
          </p>
        )}

        {/* Styling Notes Editorial Box */}
        {work.stylingNotes && (
          <div className="p-4 sm:p-5 rounded-xl border border-dashed border-[var(--berry)]/35 bg-[var(--canvas-soft)]/90 mb-6 relative">
            <div className="flex items-center gap-2 mb-2 font-mono text-[11px] font-bold tracking-wider text-[var(--berry-deep)] uppercase">
              <span>✦</span>
              <span>Neha's Styling Notes</span>
            </div>
            <p className="text-sm italic text-[var(--ink)] leading-relaxed pl-2 border-l-2 border-[var(--berry)]/50">
              "{work.stylingNotes}"
            </p>
          </div>
        )}

        {/* Craft Details Grid */}
        <div className="grid grid-cols-2 gap-3 py-4 border-y border-[var(--ink)]/15 text-xs font-mono mb-6">
          <div>
            <span className="block text-[var(--ink-soft)] text-[10px] uppercase tracking-wider">
              Tooling & Hook
            </span>
            <strong className="text-[var(--ink)]">
              {work.hookSpecs || '3.5mm Hand Hook'}
            </strong>
          </div>

          <div>
            <span className="block text-[var(--ink-soft)] text-[10px] uppercase tracking-wider">
              Slow Craft Time
            </span>
            <strong className="text-[var(--berry-deep)]">
              {work.estimatedCraftingHours
                ? `~${work.estimatedCraftingHours} hours`
                : 'Mindfully crafted'}
            </strong>
          </div>

          {work.dimensions && (
            <div>
              <span className="block text-[var(--ink-soft)] text-[10px] uppercase tracking-wider">
                Dimensions
              </span>
              <strong className="text-[var(--ink)]">{work.dimensions}</strong>
            </div>
          )}

          {work.careGuide && (
            <div>
              <span className="block text-[var(--ink-soft)] text-[10px] uppercase tracking-wider">
                Care Advice
              </span>
              <strong className="text-[var(--moss)] truncate block" title={work.careGuide}>
                {work.careGuide}
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* Action Suite */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {/* Quick View Button */}
        <button
          type="button"
          onClick={() => onOpenQuickView(work)}
          className="py-3 px-5 rounded-full font-mono text-xs font-semibold uppercase tracking-wider bg-[var(--ink)] text-[var(--canvas-soft)] hover:bg-[var(--berry)] transition-colors cursor-pointer shadow-md flex items-center gap-2"
        >
          <span>Examine Piece</span>
          <span aria-hidden="true">🔍</span>
        </button>

        {/* Save to Basket Button */}
        <button
          type="button"
          onClick={() => onToggleBasket(work)}
          aria-pressed={isSaved}
          className={`py-3 px-4 rounded-full font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-2 shadow-xs ${
            isSaved
              ? 'bg-[var(--moss)] text-[var(--canvas-soft)] border-[var(--moss)]'
              : 'bg-transparent text-[var(--ink)] border-[var(--ink)]/30 hover:border-[var(--berry)] hover:text-[var(--berry-deep)]'
          }`}
        >
          <span>{isSaved ? 'In Basket ✓' : 'Save to Basket 🧺'}</span>
        </button>

        {/* Direct Inquire */}
        <button
          type="button"
          onClick={handleInquireClick}
          className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--berry-deep)] hover:underline underline-offset-4 cursor-pointer py-2 px-1"
        >
          Commission This Piece ↗
        </button>

        {/* Instagram DM prompt */}
        <button
          type="button"
          onClick={handleInstagramInquiry}
          className="text-xs font-mono font-medium text-[var(--plum)] hover:underline underline-offset-4 cursor-pointer py-2 px-1"
        >
          Ask on IG ↗
        </button>
      </div>
    </div>
  )

  return (
    <article
      className="p-6 sm:p-8 md:p-10 rounded-3xl border border-[var(--ink)]/12 bg-[var(--canvas-soft)]/60 shadow-lg transition-all duration-300 hover:shadow-2xl"
    >
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {isEven ? (
          <>
            {imageColumn}
            {noteColumn}
          </>
        ) : (
          <>
            {/* On mobile always put image first for natural visual hierarchy */}
            <div className="w-full lg:hidden">{imageColumn}</div>
            {noteColumn}
            <div className="hidden lg:block w-full lg:w-[56%] flex-shrink-0">
              {imageColumn}
            </div>
          </>
        )}
      </div>
    </article>
  )
}

export default function LookbookView({
  items = [],
  onOpenQuickView,
  onInquire,
}) {
  const basket = useSafeBasket()

  const handleToggleBasket = (item) => {
    basket?.toggleBasket?.(item)
  }

  if (items.length === 0) {
    return (
      <div className="py-20 px-4 text-center rounded-3xl border border-dashed border-[var(--ink)]/20 bg-[var(--canvas-soft)]/50 my-8">
        <span className="text-4xl block mb-3" aria-hidden="true">📖</span>
        <h3 className="font-['Coustard',serif] text-2xl text-[var(--ink)] mb-2">
          No editorial spreads found
        </h3>
        <p className="text-sm text-[var(--ink-soft)] max-w-md mx-auto">
          Try switching your category filter to explore other handcrafted works in our editorial journal.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-20 my-8">
      {items.map((work, index) => (
        <LookbookSpread
          key={work.id}
          work={work}
          index={index}
          onOpenQuickView={onOpenQuickView}
          onInquire={onInquire}
          isSaved={basket?.isInBasket?.(work.id) ?? false}
          onToggleBasket={handleToggleBasket}
        />
      ))}
    </div>
  )
}
