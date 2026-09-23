import { useContext, useEffect, useRef, useState } from 'react'
import { BasketContext } from '../../context/BasketContext'
import {
  createGmailComposeUrl,
  createMailtoUrl,
  formatSinglePieceInquiry,
  openInstagramDM,
} from '../../utils/inquiry'

function useSafeBasket() {
  return useContext(BasketContext)
}

function QuickViewDialogContent({
  item,
  onClose,
  onToggleBasket,
  isSaved: propIsSaved,
  onInquire,
}) {
  const basket = useSafeBasket()
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const previousActiveElement = useRef(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [copiedNotification, setCopiedNotification] = useState(false)

  // Focus trapping and body scroll locking
  useEffect(() => {
    previousActiveElement.current = document.activeElement
    closeButtonRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose?.()
        return
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (!dialogRef.current.contains(document.activeElement)) {
          event.preventDefault()
          first.focus()
          return
        }

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    const handleFocusIn = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target || document.activeElement)) {
        const focusable = dialogRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        if (focusable.length > 0) {
          focusable[0].focus()
        }
      }
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('focusin', handleFocusIn)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('focusin', handleFocusIn)
      if (
        previousActiveElement.current &&
        typeof previousActiveElement.current.focus === 'function'
      ) {
        previousActiveElement.current.focus()
      }
    }
  }, [onClose])

  const isSavedInBasket =
    typeof propIsSaved === 'boolean'
      ? propIsSaved
      : basket?.isInBasket?.(item.id) ?? false

  const handleToggleBasket = () => {
    if (onToggleBasket) {
      onToggleBasket(item)
    } else if (basket?.toggleBasket) {
      basket.toggleBasket(item)
    }
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.()
    }
  }

  const handleDirectInquire = () => {
    onClose?.()
    if (onInquire) {
      onInquire(item.title)
      return
    }

    // Default: smooth scroll to contact section and pre-fill regarding input
    if (typeof window !== 'undefined') {
      window.location.hash = '#contact'
      const contactSection = document.getElementById('contact')
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' })
        const regardingInput = document.querySelector('input[name="regarding"]')
        if (regardingInput) {
          regardingInput.value = `Inquiry: ${item.title}`
          regardingInput.dispatchEvent(new Event('input', { bubbles: true }))
          regardingInput.focus()
        }
      }
    }
  }

  const handleInstagramInquiry = async () => {
    const text = formatSinglePieceInquiry(item)
    setCopiedNotification(true)
    await openInstagramDM(text)
    setTimeout(() => setCopiedNotification(false), 4000)
  }

  const handleEmailInquiry = () => {
    const subject = `Nia Knits Inquiry: ${item.title}`
    const body = formatSinglePieceInquiry(item)
    const gmailUrl = createGmailComposeUrl(subject, body)
    const opened = window.open(gmailUrl, '_blank', 'noopener,noreferrer')
    if (!opened) {
      window.location.href = createMailtoUrl(subject, body)
    }
  }

  // Authoritative specs matrix with graceful fallbacks
  const fiberMaterials = item.materials || '100% Handcrafted Cotton Blend'
  const hookSpecs = item.hookSpecs || 'Custom Artisan Hook'
  const craftingHours = item.estimatedCraftingHours
    ? `${item.estimatedCraftingHours} hand-stitching hours`
    : 'Crafted Slowly by Hand'
  const dimensions = item.dimensions || 'One of a kind'
  const careGuide = item.careGuide || 'Spot clean gently with cold water'

  const images = Array.isArray(item.images) && item.images.length > 0 ? item.images : []
  const activeImageSrc = images[activeImageIndex] || images[0]

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quickview-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--ink) 82%, var(--plum))',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col md:flex-row border border-[#FFF8F5]/30 outline outline-1 outline-[#D49A72] -outline-offset-8"
        style={{
          backgroundColor: 'var(--canvas-soft)',
          color: 'var(--ink)',
          boxShadow: '0 24px 70px color-mix(in srgb, var(--ink) 45%, transparent), 0 0 0 8px color-mix(in srgb, var(--berry) 24%, transparent)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close quick view"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xl font-light transition-all border border-[var(--ink)]/20 hover:border-[var(--berry)] hover:text-[var(--berry)] bg-[var(--canvas-soft)]/90 backdrop-blur-sm cursor-pointer"
        >
          ×
        </button>

        {/* Media Column (Left) */}
        <div className="md:w-1/2 p-5 sm:p-7 flex flex-col justify-between bg-black/5 border-b md:border-b-0 md:border-r border-[var(--ink)]/10">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[var(--canvas)] flex items-center justify-center border border-[var(--ink)]/10 shadow-inner">
            {/* Badge pill */}
            <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider uppercase bg-[var(--canvas-soft)]/95 text-[var(--berry-deep)] shadow-md border border-[var(--ink)]/10 backdrop-blur-sm">
              {item.badge || item.category || 'Handcrafted'}
            </div>

            {/* Media display */}
            {item.video ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                controls
                poster={activeImageSrc}
                className="w-full h-full object-cover"
                aria-label={`${item.title} video`}
              >
                <source src={item.video} type="video/mp4" />
              </video>
            ) : activeImageSrc ? (
              <img
                src={activeImageSrc}
                alt={`${item.title} handcrafted crochet piece`}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                loading="eager"
              />
            ) : (
              <div className="text-center p-8 text-[var(--ink-soft)] font-mono text-xs">
                🌸 Artisan Piece Preview
              </div>
            )}
          </div>

          {/* Thumbnails row if multiple images exist */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto py-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                    idx === activeImageIndex
                      ? 'border-[var(--berry)] ring-2 ring-[var(--berry)]/30 scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`Show image ${idx + 1} of ${item.title}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details & Specs Column (Right) */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2 pr-8">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--moss)]">
                {item.category} · Piece #{item.id?.replace(/[^0-9]/g, '') || '01'}
              </span>
            </div>

            <h2
              id="quickview-title"
              className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 font-['Coustard',serif] text-[var(--ink)] leading-snug"
            >
              {item.title}
            </h2>

            {item.description && (
              <p className="text-sm sm:text-base text-[var(--ink-soft)] leading-relaxed mb-6">
                {item.description}
              </p>
            )}

            {/* Complete Specifications Matrix (5 fields) */}
            <div className="rounded-xl border border-[var(--ink)]/15 bg-[var(--canvas)]/60 p-4 mb-6 space-y-3 shadow-xs">
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--berry-deep)] pb-1 border-b border-[var(--ink)]/10">
                Piece Specifications
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. Fiber Materials */}
                <div className="flex items-start gap-2">
                  <span className="text-base" aria-hidden="true">🧶</span>
                  <div>
                    <strong className="block text-[var(--ink)] font-mono text-[11px] uppercase tracking-wide">
                      Materials
                    </strong>
                    <span className="text-[var(--ink-soft)]">{fiberMaterials}</span>
                  </div>
                </div>

                {/* 2. Hook Specs */}
                <div className="flex items-start gap-2">
                  <span className="text-base" aria-hidden="true">🪝</span>
                  <div>
                    <strong className="block text-[var(--ink)] font-mono text-[11px] uppercase tracking-wide">
                      Hook Tooling
                    </strong>
                    <span className="text-[var(--ink-soft)]">{hookSpecs}</span>
                  </div>
                </div>

                {/* 3. Crafting Hours */}
                <div className="flex items-start gap-2">
                  <span className="text-base" aria-hidden="true">⏱️</span>
                  <div>
                    <strong className="block text-[var(--ink)] font-mono text-[11px] uppercase tracking-wide">
                      Crafting Time
                    </strong>
                    <span className="text-[var(--ink-soft)]">{craftingHours}</span>
                  </div>
                </div>

                {/* 4. Dimensions */}
                <div className="flex items-start gap-2">
                  <span className="text-base" aria-hidden="true">📐</span>
                  <div>
                    <strong className="block text-[var(--ink)] font-mono text-[11px] uppercase tracking-wide">
                      Dimensions / Sizing
                    </strong>
                    <span className="text-[var(--ink-soft)]">{dimensions}</span>
                  </div>
                </div>
              </div>

              {/* 5. Care Instructions */}
              <div className="pt-2 border-t border-[var(--ink)]/10 flex items-start gap-2 text-xs">
                <span className="text-base" aria-hidden="true">🧼</span>
                <div>
                  <strong className="block text-[var(--ink)] font-mono text-[11px] uppercase tracking-wide">
                    Care Guide
                  </strong>
                  <span className="text-[var(--ink-soft)]">{careGuide}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Suite */}
          <div className="space-y-3 pt-2">
            {/* Basket Bookmark Button */}
            <button
              type="button"
              onClick={handleToggleBasket}
              aria-pressed={isSavedInBasket}
              className={`w-full py-3 px-4 rounded-full font-mono text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                isSavedInBasket
                  ? 'bg-[var(--moss)] text-[var(--canvas-soft)] border border-[var(--moss)] hover:brightness-110'
                  : 'bg-[var(--berry)] text-[var(--canvas-soft)] border border-[var(--berry)] hover:bg-[var(--berry-deep)] shadow-md hover:shadow-lg'
              }`}
            >
              <span aria-hidden="true">{isSavedInBasket ? '✓' : '🧺'}</span>
              <span>{isSavedInBasket ? 'Saved in Stitched Basket' : 'Save to Stitched Basket'}</span>
            </button>

            {/* Inquiry Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleInstagramInquiry}
                className="py-2.5 px-3 rounded-full font-mono text-[11px] font-semibold uppercase tracking-wider border border-[var(--plum)] text-[var(--plum)] hover:bg-[var(--plum)] hover:text-[var(--canvas-soft)] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                title="Copies message to clipboard and opens Instagram DM"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.4" cy="6.6" r="1" fill="currentColor" />
                </svg>
                <span>{copiedNotification ? 'Copied to Clipboard! ↗' : 'Ask on Instagram ↗'}</span>
              </button>

              <button
                type="button"
                onClick={handleEmailInquiry}
                className="py-2.5 px-3 rounded-full font-mono text-[11px] font-semibold uppercase tracking-wider border border-[var(--ink)]/30 text-[var(--ink)] hover:border-[var(--berry)] hover:text-[var(--berry-deep)] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Inquire via Email ↗</span>
              </button>
            </div>

            {/* Direct on-site note link */}
            <button
              type="button"
              onClick={handleDirectInquire}
              className="w-full text-center text-[11px] font-mono font-medium text-[var(--ink-soft)] hover:text-[var(--berry-deep)] underline underline-offset-4 cursor-pointer pt-1"
            >
              Prefer on-site form? Pre-fill note in Contact section ↓
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Accessible Quick-View Modal for handcrafted pieces.
 * Mounts dialog content keyed on item.id so state resets cleanly on piece change.
 */
export default function QuickViewModal({
  item,
  isOpen = Boolean(item),
  onClose,
  onToggleBasket,
  isSaved,
  onInquire,
}) {
  if (!isOpen || !item) return null

  return (
    <QuickViewDialogContent
      key={item.id}
      item={item}
      onClose={onClose}
      onToggleBasket={onToggleBasket}
      isSaved={isSaved}
      onInquire={onInquire}
    />
  )
}
