import { useContext, useState } from 'react'
import { BasketContext } from '../../context/BasketContext'
import { formatSinglePieceInquiry, openInstagramDM } from '../../utils/inquiry'

function useSafeBasket() {
  return useContext(BasketContext)
}

function ThreadNeedle({ variation = 0 }) {
  return (
    <svg
      className={`thread-needle thread-needle-${variation}`}
      viewBox="0 0 124 70"
      aria-hidden="true"
      focusable="false"
    >
      <path className="thread-path" d="M5 53C19 20 32 19 44 42s24 26 37 4 20-27 38-16" />
      <path className="needle-path" d="M28 54L86 12" />
      <circle className="needle-eye" cx="28" cy="54" r="3.2" />
    </svg>
  )
}

function BasketBookmarkButton({ item, isSaved, onToggle }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onToggle(item)
      }}
      aria-pressed={isSaved}
      aria-label={isSaved ? `Remove ${item.title} from Stitched Basket` : `Save ${item.title} to Stitched Basket`}
      title={isSaved ? 'Saved in basket (click to remove)' : 'Save to Stitched Basket'}
      className={`absolute top-3.5 right-3.5 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer border ${
        isSaved
          ? 'bg-[var(--berry)] text-[var(--canvas-soft)] border-[var(--berry)] scale-105'
          : 'bg-[var(--canvas-soft)]/90 text-[var(--ink)] border-[var(--ink)]/20 hover:border-[var(--berry)] hover:text-[var(--berry)] hover:scale-110'
      }`}
    >
      <svg
        className="w-4 h-4 sm:w-5 sm:h-5 transition-transform"
        viewBox="0 0 24 24"
        fill={isSaved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={isSaved ? '1' : '2'}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Wicker basket icon */}
        <path d="M4 10h16l-2 10H6L4 10z" />
        <path d="M9 10V6a3 3 0 0 1 6 0v4" />
        <path d="M9 14l2 3 4-6" />
      </svg>
    </button>
  )
}

function CardLikeMeter({
  work,
  likes = {},
  likedPieces = [],
  onToggleLike,
  highestLikes = 1,
  likesAvailable = true,
  updatingLikeIds = [],
}) {
  if (!onToggleLike) return null

  const isLiked = likedPieces.includes(work.id)
  const displayLikes = likes[work.id] || 0
  const isUpdating = updatingLikeIds.includes(work.id)
  const fillWidth = highestLikes ? (displayLikes / highestLikes) * 100 : 0

  return (
    <div className="likemeter my-2">
      <button
        className={`like-button ${isLiked ? 'is-liked' : ''}`}
        type="button"
        aria-pressed={isLiked}
        aria-label={`${isLiked ? 'Unlike' : 'Like'} ${work.title}`}
        disabled={isUpdating || !likesAvailable}
        title={likesAvailable ? undefined : 'Live likes temporarily unavailable'}
        onClick={() => onToggleLike(work.id)}
      >
        <span aria-hidden="true">{isLiked ? '♥' : '♡'}</span>
        <span className="like-number">{displayLikes}</span>
      </button>
      <div
        className="meter-track"
        role="meter"
        aria-label={`${work.title} popularity meter`}
        aria-valuenow={displayLikes}
        aria-valuemin={0}
        aria-valuemax={highestLikes || 1}
      >
        <div className="meter-fill" style={{ width: `${fillWidth}%` }} />
      </div>
    </div>
  )
}

export default function CatalogGridView({
  items = [],
  onOpenQuickView,
  onInquire,
  likes = {},
  likedPieces = [],
  onToggleLike,
  highestLikes = 1,
  likesAvailable = true,
  updatingLikeIds = [],
}) {
  const basket = useSafeBasket()
  const [copiedId, setCopiedId] = useState(null)

  const handleToggleBasket = (item) => {
    basket?.toggleBasket?.(item)
  }

  const handleInstagramPrompt = async (item) => {
    const text = formatSinglePieceInquiry(item)
    setCopiedId(item.id)
    await openInstagramDM(text)
    setTimeout(() => setCopiedId(null), 3500)
  }

  const handleInquireClick = (itemTitle) => {
    if (onInquire) {
      onInquire(itemTitle)
      return
    }

    if (typeof window !== 'undefined') {
      window.location.hash = '#contact'
      const contactSection = document.getElementById('contact')
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' })
        const input = document.querySelector('input[name="regarding"]')
        if (input) {
          input.value = itemTitle
          input.dispatchEvent(new Event('input', { bubbles: true }))
          input.focus()
        }
      }
    }
  }

  if (items.length === 0) {
    return (
      <div className="py-16 px-4 text-center rounded-2xl border border-dashed border-[var(--ink)]/20 bg-[var(--canvas-soft)]/50 my-8">
        <span className="text-4xl block mb-3" aria-hidden="true">🧶</span>
        <h3 className="font-['Coustard',serif] text-xl text-[var(--ink)] mb-2">
          No pieces found in this category
        </h3>
        <p className="text-sm text-[var(--ink-soft)] max-w-md mx-auto">
          Every piece is small-batch and made slowly. Select another category or request a bespoke custom commission!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8 my-6">
      {items.map((work, index) => {
        const isSaved = basket?.isInBasket?.(work.id) ?? false
        const pieceNum = String(index + 1).padStart(2, '0')
        const imageSrc = work.images?.[0]
        const hours = work.estimatedCraftingHours

        return (
          <article
            key={work.id}
            style={{ '--stitch-delay': `${(index % 6) * 90}ms` }}
            className="group flex flex-col justify-between overflow-hidden rounded-[var(--radius-soft)] border border-[var(--ink)]/15 bg-[var(--canvas-soft)] transition-all duration-300 hover:shadow-xl hover:border-[var(--berry)]/40"
          >
            {/* Media Container */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--canvas)]">
              {/* Piece number pill */}
              <span className="absolute top-3.5 left-3.5 z-10 grid w-8 h-8 sm:w-9 sm:h-9 place-items-center rounded-full bg-[var(--canvas-soft)]/90 text-[var(--ink)] font-mono text-xs font-semibold shadow-xs backdrop-blur-xs border border-[var(--ink)]/10">
                #{pieceNum}
              </span>

              {/* Craft badge */}
              {work.badge && (
                <span className="absolute bottom-3.5 left-3.5 z-10 px-2.5 py-1 rounded-full bg-[var(--canvas-soft)]/95 text-[var(--berry-deep)] font-mono text-[10px] sm:text-xs font-semibold uppercase tracking-wider shadow-sm border border-[var(--ink)]/10 backdrop-blur-xs">
                  {work.badge}
                </span>
              )}

              {/* Basket Bookmark / Wishlist trigger */}
              <BasketBookmarkButton
                item={work}
                isSaved={isSaved}
                onToggle={handleToggleBasket}
              />

              {/* Media element: Video or Image */}
              {work.video ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  poster={imageSrc}
                  className="w-full h-full object-cover"
                  aria-label={`${work.title} handcrafted crochet piece`}
                >
                  <source src={work.video} type="video/mp4" />
                </video>
              ) : imageSrc ? (
                <button
                  type="button"
                  onClick={() => onOpenQuickView?.(work)}
                  className="w-full h-full p-0 border-0 bg-transparent cursor-pointer block text-left"
                  aria-label={`Open quick view for ${work.title}`}
                >
                  <img
                    src={imageSrc}
                    alt={`${work.title}. ${work.description || ''}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </button>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--ink-soft)] font-mono text-xs">
                  Handcrafted Piece
                </div>
              )}

              {/* Hover Quick View Trigger Overlay */}
              <button
                type="button"
                onClick={() => onOpenQuickView?.(work)}
                aria-label={`Quick view ${work.title}`}
                className="absolute inset-x-4 bottom-14 z-10 py-2.5 px-4 rounded-full bg-[var(--ink)]/85 text-[var(--canvas-soft)] font-mono text-xs font-semibold uppercase tracking-wider backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 hover:bg-[var(--berry)] cursor-pointer shadow-lg"
              >
                <span>Quick View</span>
                <span aria-hidden="true">🔍</span>
              </button>

              {/* Decorative needle stitch effect */}
              <ThreadNeedle variation={index % 3} />
            </div>

            {/* Card Content & Details */}
            <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[11px] font-semibold tracking-wider text-[var(--moss)] uppercase">
                    {work.category}
                  </span>
                  {hours && (
                    <span className="font-mono text-[10px] font-medium text-[var(--ink-soft)] bg-[var(--canvas)] px-2 py-0.5 rounded-full border border-[var(--ink)]/10">
                      ⏱️ ~{hours} hrs
                    </span>
                  )}
                </div>

                <h3 className="font-['Coustard',serif] text-xl font-bold tracking-tight text-[var(--ink)] mb-2 group-hover:text-[var(--berry)] transition-colors">
                  <button
                    type="button"
                    onClick={() => onOpenQuickView?.(work)}
                    className="text-left font-inherit text-inherit hover:underline p-0 border-0 bg-transparent cursor-pointer"
                  >
                    {work.title}
                  </button>
                </h3>

                {work.description && (
                  <p className="text-xs sm:text-sm text-[var(--ink-soft)] line-clamp-2 leading-relaxed mb-3">
                    {work.description}
                  </p>
                )}

                {work.materials && (
                  <p className="font-mono text-[10px] sm:text-[11px] font-semibold text-[var(--moss)] uppercase tracking-wider mb-3 leading-tight line-clamp-1">
                    {work.materials}
                  </p>
                )}
              </div>

              {/* Likemeter integration */}
              <div>
                <CardLikeMeter
                  work={work}
                  likes={likes}
                  likedPieces={likedPieces}
                  onToggleLike={onToggleLike}
                  highestLikes={highestLikes}
                  likesAvailable={likesAvailable}
                  updatingLikeIds={updatingLikeIds}
                />

                {/* Card Actions */}
                <div className="pt-2 border-t border-[var(--ink)]/10 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleInquireClick(work.title)}
                      className="inquire-link text-left cursor-pointer hover:text-[var(--berry-deep)] text-[11px]"
                    >
                      Inquire about this piece <span aria-hidden="true">↗</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenQuickView?.(work)}
                      className="text-[11px] font-mono font-medium text-[var(--ink-soft)] hover:text-[var(--berry)] cursor-pointer"
                    >
                      Details & Specs ↗
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInstagramPrompt(work)}
                    className="instagram-inquire-link cursor-pointer text-[10px] sm:text-[11px]"
                    title="Shows a ready message and opens Instagram"
                    aria-label={copiedId === work.id ? 'Message copied for Instagram' : `Ask about ${work.title} on Instagram`}
                  >
                    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" />
                    </svg>
                    <span>{copiedId === work.id ? 'Message copied ✓' : 'Ask on Instagram ↗'}</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
