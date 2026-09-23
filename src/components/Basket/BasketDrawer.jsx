import { useContext, useEffect, useRef, useState } from 'react'
import { BasketContext } from '../../context/BasketContext'
import { useRouter } from '../../context/RouterContext'
import {
  copyToClipboard,
  createGmailComposeUrl,
  createMailtoUrl,
  formatMultiItemInquiry,
  openInstagramDM,
} from '../../utils/inquiry'

/**
 * BasketDrawer component
 * Slide-over off-canvas drawer sliding from the right edge with backdrop blur.
 * Features:
 * - Focus trap and Escape key handling
 * - Item cards with thumbnail, title, category, materials, crafting hours, and remove button
 * - Aggregate slow-crafting hours counter
 * - Multi-item inquiry actions:
 *   - "Inquire on Instagram DM": calls openInstagramDM with copy notification banner
 *   - "Inquire via Gmail": opens createGmailComposeUrl pre-filled with subject and summary
 *   - "Copy Summary" & "Clear Basket"
 * - Cozy artisan empty state when no items are saved with CTA to explore showcase
 */
export function BasketDrawer({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  className = '',
}) {
  const basket = useContext(BasketContext)

  const isDrawerOpen = controlledIsOpen !== undefined ? controlledIsOpen : (basket?.isDrawerOpen ?? false)
  const onClose = controlledOnClose || (() => basket?.setIsDrawerOpen?.(false))
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  const basketItems = basket?.basketItems || []
  const totalCraftingHours = basket?.totalCraftingHours || 0
  const removeFromBasket = basket?.removeFromBasket || (() => {})
  const clearBasket = basket?.clearBasket || (() => {})

  const [toastMessage, setToastMessage] = useState(null)
  const toastTimeoutRef = useRef(null)
  const drawerRef = useRef(null)
  const previousActiveElementRef = useRef(null)

  const showToast = (message) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }
    setToastMessage(message)
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null)
    }, 3800)
  }

  // Focus trap & Escape key handling
  useEffect(() => {
    if (!isDrawerOpen) {
      return
    }

    if (typeof document === 'undefined') return

    // Store previous active element to restore upon close
    previousActiveElementRef.current = document.activeElement

    // Prevent body scrolling while drawer is active
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Focus close button on mount
    const timer = setTimeout(() => {
      if (drawerRef.current) {
        const closeBtn = drawerRef.current.querySelector('.basket-drawer-close-btn')
        if (closeBtn) {
          closeBtn.focus()
        }
      }
    }, 50)

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onCloseRef.current()
        return
      }

      if (event.key === 'Tab') {
        if (!drawerRef.current) return
        const focusableElements = Array.from(
          drawerRef.current.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        )

        if (focusableElements.length === 0) {
          event.preventDefault()
          return
        }

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey) {
          if (document.activeElement === firstElement || !drawerRef.current.contains(document.activeElement)) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement || !drawerRef.current.contains(document.activeElement)) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(timer)
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        previousActiveElementRef.current.focus()
      }
    }
  }, [isDrawerOpen])

  // Multi-item inquiry actions
  const handleInstagramInquiry = async () => {
    const summaryText = formatMultiItemInquiry(basketItems, totalCraftingHours)
    showToast('Summary copied to clipboard! Opening Instagram DM...')
    try {
      await openInstagramDM(summaryText)
    } catch (err) {
      console.warn('Failed to open Instagram DM:', err)
    }
  }

  const handleGmailInquiry = () => {
    const count = basketItems.length
    const subject = `Nia Knits Inquiry: Stitched Basket (${count} ${count === 1 ? 'piece' : 'pieces'})`
    const body = formatMultiItemInquiry(basketItems, totalCraftingHours)
    const gmailUrl = createGmailComposeUrl(subject, body)

    if (typeof window !== 'undefined') {
      const opened = window.open(gmailUrl, '_blank', 'noopener,noreferrer')
      if (!opened) {
        // Fallback to mailto link if popup blocked
        window.location.assign(createMailtoUrl(subject, body))
      }
    }
  }

  const handleCopySummary = async () => {
    const summaryText = formatMultiItemInquiry(basketItems, totalCraftingHours)
    const success = await copyToClipboard(summaryText)
    if (success) {
      showToast('Summary copied to clipboard!')
    } else {
      showToast('Unable to copy automatically. Please select text.')
    }
  }

  const { navigate } = useRouter()

  const handleClearBasket = () => {
    clearBasket()
    showToast('Basket cleared.')
  }

  const handleExploreShowcase = () => {
    onClose()
    if (navigate) {
      navigate('/work')
    } else if (typeof window !== 'undefined') {
      window.location.assign('/work')
    }
  }

  const handleFillContactForm = () => {
    const summaryText = formatMultiItemInquiry(basketItems, totalCraftingHours)
    const count = basketItems.length
    const regardingText = `Stitched Basket: ${basketItems.map((i) => i.title).join(', ')} (${count} pieces)`

    onClose()
    if (navigate) {
      navigate('/contact')
    } else if (typeof window !== 'undefined') {
      window.location.assign('/contact')
    }

    setTimeout(() => {
      if (typeof document !== 'undefined') {
        const regardingInput = document.querySelector('input[name="regarding"], input#regarding, #regarding')
        const messageInput = document.querySelector('textarea[name="message"], textarea#message, #message')
        if (regardingInput) {
          regardingInput.value = regardingText
          regardingInput.dispatchEvent(new Event('input', { bubbles: true }))
        }
        if (messageInput) {
          messageInput.value = summaryText
          messageInput.dispatchEvent(new Event('input', { bubbles: true }))
        }
        const nameInput = document.querySelector('input[name="name"], input#name, #name')
        if (nameInput) nameInput.focus()
      }
    }, 150)
  }

  if (!isDrawerOpen) {
    return null
  }

  const count = basketItems.length

  return (
    <>
      <style>{`
        @keyframes basketBackdropFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes basketDrawerSlide {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes basketToastSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .basket-backdrop {
          position: fixed;
          inset: 0;
          z-index: 45;
          background: color-mix(in srgb, var(--ink, #302629) 55%, transparent);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          animation: basketBackdropFade 0.25s ease-out;
        }
        .basket-drawer-panel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          z-index: 50;
          width: min(480px, 100vw);
          background: var(--canvas, #F1E5E3);
          color: var(--ink, #302629);
          box-shadow: -10px 0 35px color-mix(in srgb, var(--ink, #302629) 25%, transparent);
          display: flex;
          flex-direction: column;
          animation: basketDrawerSlide 0.32s cubic-bezier(0.22, 1, 0.36, 1);
          outline: none;
        }
        .basket-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid color-mix(in srgb, var(--ink, #302629) 15%, transparent);
          background: color-mix(in srgb, var(--canvas-soft, #FFF8F5) 85%, transparent);
        }
        .basket-drawer-title-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .basket-drawer-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .basket-drawer-title {
          margin: 0;
          font-family: var(--font-display, serif);
          font-size: 1.35rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: var(--ink, #302629);
        }
        .basket-drawer-subtitle {
          margin: 0;
          font-family: var(--font-mono, monospace);
          font-size: 0.72rem;
          font-weight: 500;
          color: var(--ink-soft, #705D62);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .basket-drawer-close-btn {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          border: 1px solid color-mix(in srgb, var(--ink, #302629) 20%, transparent);
          border-radius: 50%;
          background: transparent;
          color: var(--ink, #302629);
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.15s ease;
        }
        .basket-drawer-close-btn:hover {
          background: color-mix(in srgb, var(--ink, #302629) 10%, transparent);
          transform: scale(1.05);
        }
        .basket-drawer-close-btn:focus-visible {
          outline: 3px solid var(--ochre, #D49A72);
          outline-offset: 2px;
        }
        .basket-toast-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          margin: 12px 18px 0;
          border-radius: var(--radius-soft, 14px);
          background: color-mix(in srgb, var(--moss, #74816C) 15%, var(--canvas-soft, #FFF8F5));
          border: 1px solid var(--moss, #74816C);
          color: var(--moss, #74816C);
          font-family: var(--font-mono, monospace);
          font-size: 0.78rem;
          font-weight: 600;
          animation: basketToastSlideDown 0.22s ease-out;
        }
        .basket-drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .basket-item-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 12px 14px;
          border-radius: var(--radius-soft, 16px);
          background: var(--canvas-soft, #FFF8F5);
          border: 1px solid color-mix(in srgb, var(--ink, #302629) 12%, transparent);
          box-shadow: 0 2px 8px color-mix(in srgb, var(--ink, #302629) 5%, transparent);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .basket-item-card:hover {
          box-shadow: 0 4px 14px color-mix(in srgb, var(--ink, #302629) 10%, transparent);
        }
        .basket-item-thumb-wrapper {
          position: relative;
          width: 76px;
          height: 76px;
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
          background: color-mix(in srgb, var(--ink, #302629) 8%, transparent);
          border: 1px solid color-mix(in srgb, var(--ink, #302629) 10%, transparent);
        }
        .basket-item-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .basket-item-thumb-placeholder {
          display: grid;
          place-items: center;
          width: 100%;
          height: 100%;
          font-size: 1.8rem;
          background: color-mix(in srgb, var(--ochre, #D49A72) 15%, transparent);
        }
        .basket-item-details {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .basket-item-category-pill {
          display: inline-block;
          font-family: var(--font-mono, monospace);
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--moss, #74816C);
        }
        .basket-item-title {
          margin: 0;
          font-family: var(--font-display, serif);
          font-size: 0.96rem;
          font-weight: 700;
          line-height: 1.25;
          color: var(--ink, #302629);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .basket-item-materials {
          margin: 0;
          font-size: 0.74rem;
          color: var(--ink-soft, #705D62);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .basket-item-meta-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 3px;
        }
        .basket-item-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 7px;
          border-radius: var(--radius-pill, 999px);
          font-family: var(--font-mono, monospace);
          font-size: 0.64rem;
          font-weight: 600;
          background: color-mix(in srgb, var(--ochre, #D49A72) 20%, transparent);
          color: var(--ink, #302629);
        }
        .basket-item-remove-btn {
          align-self: center;
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid color-mix(in srgb, var(--ink, #302629) 15%, transparent);
          background: transparent;
          color: var(--ink-soft, #705D62);
          cursor: pointer;
          transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
          flex-shrink: 0;
        }
        .basket-item-remove-btn:hover {
          background: color-mix(in srgb, var(--berry, #B94D68) 15%, transparent);
          color: var(--berry-deep, #963B54);
          border-color: var(--berry, #B94D68);
          transform: scale(1.08);
        }
        .basket-item-remove-btn:focus-visible {
          outline: 3px solid var(--ochre, #D49A72);
          outline-offset: 2px;
        }
        .basket-empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 24px;
        }
        .basket-empty-icon-card {
          display: grid;
          place-items: center;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: color-mix(in srgb, var(--canvas-soft, #FFF8F5) 90%, transparent);
          border: 2px dashed color-mix(in srgb, var(--ochre, #D49A72) 60%, transparent);
          margin-bottom: 20px;
          box-shadow: 0 4px 16px color-mix(in srgb, var(--ink, #302629) 6%, transparent);
        }
        .basket-empty-title {
          margin: 0 0 10px;
          font-family: var(--font-display, serif);
          font-size: 1.35rem;
          font-weight: 900;
          color: var(--ink, #302629);
        }
        .basket-empty-copy {
          max-width: 290px;
          margin: 0 0 24px;
          font-size: 0.88rem;
          line-height: 1.5;
          color: var(--ink-soft, #705D62);
        }
        .basket-empty-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 26px;
          border-radius: var(--radius-pill, 999px);
          background: var(--berry, #B94D68);
          color: var(--canvas-soft, #FFF8F5);
          font-family: var(--font-mono, monospace);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 18px color-mix(in srgb, var(--berry, #B94D68) 35%, transparent);
          transition: background-color 0.2s ease, transform 0.15s ease;
        }
        .basket-empty-cta:hover {
          background: var(--berry-deep, #963B54);
          transform: translateY(-2px);
        }
        .basket-drawer-footer {
          border-top: 1px solid color-mix(in srgb, var(--ink, #302629) 15%, transparent);
          background: color-mix(in srgb, var(--canvas-soft, #FFF8F5) 95%, transparent);
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .basket-aggregate-banner {
          padding: 12px 14px;
          border-radius: var(--radius-soft, 14px);
          background: color-mix(in srgb, var(--plum, #806174) 10%, var(--canvas-soft, #FFF8F5));
          border: 1px solid color-mix(in srgb, var(--plum, #806174) 25%, transparent);
          text-align: center;
        }
        .basket-aggregate-headline {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: var(--font-display, serif);
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--plum, #806174);
        }
        .basket-aggregate-subtext {
          margin: 4px 0 0;
          font-size: 0.72rem;
          line-height: 1.4;
          font-style: italic;
          color: var(--ink-soft, #705D62);
        }
        .basket-action-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .basket-btn-instagram {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          min-height: 46px;
          padding: 10px 18px;
          border-radius: var(--radius-pill, 999px);
          background: var(--berry, #B94D68);
          color: var(--canvas-soft, #FFF8F5);
          font-family: var(--font-body, sans-serif);
          font-size: 0.88rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 18px color-mix(in srgb, var(--berry, #B94D68) 30%, transparent);
          transition: background-color 0.2s ease, transform 0.15s ease;
        }
        .basket-btn-instagram:hover {
          background: var(--berry-deep, #963B54);
          transform: translateY(-1px);
        }
        .basket-btn-instagram:focus-visible {
          outline: 3px solid var(--ochre, #D49A72);
          outline-offset: 3px;
        }
        .basket-btn-gmail {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          width: 100%;
          min-height: 42px;
          padding: 8px 18px;
          border-radius: var(--radius-pill, 999px);
          background: transparent;
          color: var(--ink, #302629);
          font-family: var(--font-body, sans-serif);
          font-size: 0.84rem;
          font-weight: 600;
          border: 1.5px solid color-mix(in srgb, var(--ink, #302629) 25%, transparent);
          cursor: pointer;
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        .basket-btn-gmail:hover {
          background: color-mix(in srgb, var(--ink, #302629) 8%, transparent);
          border-color: var(--ink, #302629);
        }
        .basket-btn-gmail:focus-visible {
          outline: 3px solid var(--ochre, #D49A72);
          outline-offset: 2px;
        }
        .basket-footer-utils {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 4px;
        }
        .basket-util-btn {
          border: none;
          background: transparent;
          color: var(--ink-soft, #705D62);
          font-family: var(--font-mono, monospace);
          font-size: 0.7rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
          padding: 4px 6px;
          border-radius: 4px;
          transition: color 0.15s ease;
        }
        .basket-util-btn:hover {
          color: var(--ink, #302629);
        }
        .basket-util-btn.clear-btn:hover {
          color: var(--berry-deep, #963B54);
        }
        .basket-util-btn:focus-visible {
          outline: 2px solid var(--ochre, #D49A72);
        }
      `}</style>

      {/* Backdrop Scrim */}
      <div
        className="basket-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="basket-drawer-title"
        className={`basket-drawer-panel ${className}`}
        tabIndex="-1"
      >
        {/* Header */}
        <div className="basket-drawer-header">
          <div className="basket-drawer-title-group">
            <div className="basket-drawer-title-row">
              {/* Basket Icon */}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--berry, #B94D68)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m5 11 4-7" />
                <path d="m19 11-4-7" />
                <path d="M2 11h20l-2 9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
                <path d="m9 11 1 11" />
                <path d="m15 11-1 11" />
                <path d="M4.5 15.5h15" />
              </svg>
              <h2 id="basket-drawer-title" className="basket-drawer-title">
                Stitched Basket
              </h2>
            </div>
            <p className="basket-drawer-subtitle">
              {count === 0
                ? 'Your slow-craft wishlist'
                : `${count} handcrafted ${count === 1 ? 'piece' : 'pieces'} saved`}
            </p>
          </div>

          <button
            type="button"
            className="basket-drawer-close-btn"
            onClick={onClose}
            aria-label="Close Stitched Basket drawer"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Copy Notification Toast Banner */}
        {toastMessage && (
          <div role="status" aria-live="polite" className="basket-toast-banner">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Drawer Body */}
        {count === 0 ? (
          /* Empty State */
          <div className="basket-empty-state">
            <div className="basket-empty-icon-card" aria-hidden="true">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--ochre, #D49A72)"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
                <path d="m8 9 8 6" stroke="var(--berry, #B94D68)" strokeWidth="1.8" />
                <path d="m16 9-8 6" stroke="var(--moss, #74816C)" strokeWidth="1.8" />
                <circle cx="12" cy="12" r="3" fill="var(--canvas-soft, #FFF8F5)" stroke="var(--ink, #302629)" />
              </svg>
            </div>
            <h3 className="basket-empty-title">Your basket is empty</h3>
            <p className="basket-empty-copy">
              Browse our collection and bookmark pieces you'd love to ask about or commission.
            </p>
            <button
              type="button"
              className="basket-empty-cta"
              onClick={handleExploreShowcase}
            >
              Explore Collection ↗
            </button>
          </div>
        ) : (
          /* Populated Items List */
          <div className="basket-drawer-body">
            {basketItems.map((item) => {
              const imageSrc =
                Array.isArray(item.images) && item.images.length > 0
                  ? item.images[0]
                  : item.image || null

              return (
                <div key={item.id} className="basket-item-card">
                  {/* Thumbnail */}
                  <div className="basket-item-thumb-wrapper">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={item.title || 'Crochet piece'}
                        className="basket-item-thumb-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="basket-item-thumb-placeholder">🧶</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="basket-item-details">
                    <span className="basket-item-category-pill">
                      {item.category || 'Handmade'}
                    </span>
                    <h4 className="basket-item-title" title={item.title}>
                      {item.title || 'Handcrafted Piece'}
                    </h4>
                    {item.materials && (
                      <p className="basket-item-materials" title={item.materials}>
                        {item.materials}
                      </p>
                    )}
                    <div className="basket-item-meta-chips">
                      {item.estimatedCraftingHours != null && (
                        <span className="basket-item-chip">
                          ⏱️ ~{item.estimatedCraftingHours} hrs
                        </span>
                      )}
                      {item.hookSpecs && (
                        <span className="basket-item-chip">
                          🪝 {item.hookSpecs}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    className="basket-item-remove-btn"
                    onClick={() => removeFromBasket(item.id)}
                    aria-label={`Remove ${item.title || 'piece'} from basket`}
                    title="Remove from basket"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer & Inquiry Suite */}
        {count > 0 && (
          <div className="basket-drawer-footer">
            {/* Slow-crafting hours aggregate banner */}
            <div className="basket-aggregate-banner">
              <div className="basket-aggregate-headline">
                <span aria-hidden="true">⏱️</span>
                <span>
                  Total: ~{totalCraftingHours} hours of artisan handcrafting
                </span>
              </div>
              <p className="basket-aggregate-subtext">
                Every piece is made slowly loop-by-loop by Neha Jose in Mumbai. Custom sizing &amp; palettes welcome.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="basket-action-stack">
              {/* Instagram DM with copy notification */}
              <button
                type="button"
                className="basket-btn-instagram"
                onClick={handleInstagramInquiry}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                <span>Inquire on Instagram DM ↗</span>
              </button>

              {/* Gmail Compose */}
              <button
                type="button"
                className="basket-btn-gmail"
                onClick={handleGmailInquiry}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>Inquire via Gmail ↗</span>
              </button>
            </div>

            {/* Utility Links Row */}
            <div className="basket-footer-utils">
              <button
                type="button"
                className="basket-util-btn"
                onClick={handleCopySummary}
              >
                📋 Copy Summary
              </button>
              <button
                type="button"
                className="basket-util-btn"
                onClick={handleFillContactForm}
              >
                ✉️ Website Form
              </button>
              <button
                type="button"
                className="basket-util-btn clear-btn"
                onClick={handleClearBasket}
              >
                Clear Basket
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default BasketDrawer
