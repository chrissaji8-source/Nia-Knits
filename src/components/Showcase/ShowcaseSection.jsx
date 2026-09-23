import { useMemo, useRef, useState } from 'react'
import defaultWorks from '../../data/works.json'
import CatalogGridView from './CatalogGridView'
import LookbookView from './LookbookView'
import QuickViewModal from './QuickViewModal'

const VIEW_MODE_KEY = 'nia-knits-view-mode'

/**
 * Validates and normalizes view mode input to 'catalog' or 'lookbook'.
 */
function normalizeViewMode(mode) {
  if (mode === 'lookbook') return 'lookbook'
  if (mode === 'catalog' || mode === 'grid') return 'catalog'
  return 'catalog'
}

function readInitialViewMode() {
  if (typeof window === 'undefined') return 'catalog'
  try {
    const stored = window.localStorage.getItem(VIEW_MODE_KEY)
    return normalizeViewMode(stored)
  } catch {
    return 'catalog'
  }
}

function persistViewMode(mode) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(VIEW_MODE_KEY, mode)
  } catch {}
}

export default function ShowcaseSection({
  works = defaultWorks,
  likes = {},
  likedPieces = [],
  onToggleLike,
  highestLikes = 1,
  likesAvailable = true,
  updatingLikeIds = [],
  userLikeCount,
  onInquire,
}) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [viewMode, setViewModeState] = useState(readInitialViewMode)
  const [quickViewItem, setQuickViewItem] = useState(null)
  const catalogBtnRef = useRef(null)
  const lookbookBtnRef = useRef(null)

  const setViewMode = (mode) => {
    const normalized = normalizeViewMode(mode)
    setViewModeState(normalized)
    persistViewMode(normalized)
  }

  const handleRadioKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const nextMode = viewMode === 'catalog' ? 'lookbook' : 'catalog'
      setViewMode(nextMode)
      if (nextMode === 'lookbook') {
        lookbookBtnRef.current?.focus()
      } else {
        catalogBtnRef.current?.focus()
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prevMode = viewMode === 'lookbook' ? 'catalog' : 'lookbook'
      setViewMode(prevMode)
      if (prevMode === 'catalog') {
        catalogBtnRef.current?.focus()
      } else {
        lookbookBtnRef.current?.focus()
      }
    }
  }

  // Derive dynamic category counts matching authoritative spec
  const categoryCounts = useMemo(() => {
    const counts = { All: works.length }
    works.forEach((item) => {
      if (item.category) {
        counts[item.category] = (counts[item.category] || 0) + 1
      }
    })
    return counts
  }, [works])

  // Category list preserves canonical order
  const categories = useMemo(() => {
    const rawOrder = ['All', 'Bouquets', 'Wearables', 'Home', 'Small things']
    const existing = new Set(works.map((w) => w.category).filter(Boolean))
    const list = rawOrder.filter((cat) => cat === 'All' || existing.has(cat))
    // Append any unforeseen custom categories
    existing.forEach((cat) => {
      if (!list.includes(cat)) list.push(cat)
    })
    return list
  }, [works])

  // Filter works based on active category without mutating original catalog
  const filteredWorks = useMemo(() => {
    if (activeCategory === 'All') return works
    return works.filter((w) => w.category === activeCategory)
  }, [works, activeCategory])

  const calculatedUserLikeCount =
    typeof userLikeCount === 'number' ? userLikeCount : likedPieces.length

  return (
    <section id="work" className="work-section section-shell" aria-labelledby="work-title">
      {/* Section Header */}
      <div className="section-heading">
        <div className="work-heading-meta flex items-center justify-between flex-wrap gap-4 mb-4">
          <p className="eyebrow m-0">Selected work · {works.length} pieces</p>
          {calculatedUserLikeCount > 0 && (
            <p className="user-like-count m-0" aria-live="polite">
              <span aria-hidden="true">♥</span> Your likes: {calculatedUserLikeCount}
            </p>
          )}
        </div>
        <h2 id="work-title">Made for keeping</h2>
        <p>Little crochet objects with a generous point of view.</p>
      </div>

      {/* Control Bar: Category Filters & Dual-View Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 pt-2">
        {/* Dynamic Category Filter Chips */}
        <div
          className="category-filters flex flex-wrap gap-2 m-0"
          role="group"
          aria-label="Filter work by category"
        >
          {categories.map((category) => {
            const count = categoryCounts[category] ?? 0
            const isActive = activeCategory === category

            return (
              <button
                key={category}
                type="button"
                className={`px-3.5 py-2 rounded-full font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer border ${
                  isActive
                    ? 'is-active bg-[var(--berry)] text-[var(--canvas-soft)] border-[var(--berry)] shadow-sm'
                    : 'bg-transparent text-[var(--ink-soft)] border-[var(--ink)]/20 hover:border-[var(--berry)] hover:text-[var(--berry-deep)]'
                }`}
                aria-pressed={isActive}
                onClick={() => setActiveCategory(category)}
              >
                {`${category} (${count})`}
              </button>
            )
          })}
        </div>

        {/* Dual-View Switcher Segmented Control */}
        <div
          role="radiogroup"
          aria-label="Collection display view"
          className="self-start md:self-center inline-flex p-1 rounded-full bg-[var(--canvas-soft)] border border-[var(--ink)]/15 shadow-inner"
          onKeyDown={handleRadioKeyDown}
        >
          {/* Catalog Grid View Button */}
          <button
            ref={catalogBtnRef}
            type="button"
            role="radio"
            aria-checked={viewMode === 'catalog'}
            tabIndex={viewMode === 'catalog' ? 0 : -1}
            onClick={() => setViewMode('catalog')}
            onKeyDown={handleRadioKeyDown}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              viewMode === 'catalog'
                ? 'bg-[var(--berry)] text-[var(--canvas-soft)] shadow-xs'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-black/5'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            <span>Catalog</span>
          </button>

          {/* Lookbook Magazine View Button */}
          <button
            ref={lookbookBtnRef}
            type="button"
            role="radio"
            aria-checked={viewMode === 'lookbook'}
            tabIndex={viewMode === 'lookbook' ? 0 : -1}
            onClick={() => setViewMode('lookbook')}
            onKeyDown={handleRadioKeyDown}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              viewMode === 'lookbook'
                ? 'bg-[var(--berry)] text-[var(--canvas-soft)] shadow-xs'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-black/5'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Lookbook</span>
          </button>
        </div>
      </div>

      {/* Main View Presentation with smooth transition */}
      <div
        key={viewMode}
        className="transition-all duration-300 ease-out"
        style={{
          animation: 'showcase-fade-in 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {viewMode === 'catalog' ? (
          <CatalogGridView
            items={filteredWorks}
            onOpenQuickView={(item) => setQuickViewItem(item)}
            onInquire={onInquire}
            likes={likes}
            likedPieces={likedPieces}
            onToggleLike={onToggleLike}
            highestLikes={highestLikes}
            likesAvailable={likesAvailable}
            updatingLikeIds={updatingLikeIds}
          />
        ) : (
          <LookbookView
            items={filteredWorks}
            onOpenQuickView={(item) => setQuickViewItem(item)}
            onInquire={onInquire}
          />
        )}
      </div>

      {/* Quick-View Modal */}
      <QuickViewModal
        item={quickViewItem}
        isOpen={Boolean(quickViewItem)}
        onClose={() => setQuickViewItem(null)}
        onInquire={onInquire}
      />
    </section>
  )
}
