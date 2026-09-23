import { useContext, useEffect, useRef, useState } from 'react'
import { BasketContext } from '../../context/BasketContext'

/**
 * FloatingBasketTrigger component
 * Fixed floating trigger button at bottom-right of viewport.
 * Displays live saved count badge with animated pulse/bounce when items are added.
 * Clicking opens the slide-over drawer (setIsDrawerOpen(true)).
 */
export function FloatingBasketTrigger({ className = '', onClick }) {
  const basket = useContext(BasketContext)

  const totalPieces = basket ? basket.totalPieces : 0
  const isDrawerOpen = basket ? basket.isDrawerOpen : false
  const setIsDrawerOpen = basket?.setIsDrawerOpen || (() => {})

  const [isBouncing, setIsBouncing] = useState(false)
  const prevCountRef = useRef(totalPieces)

  useEffect(() => {
    if (totalPieces > prevCountRef.current) {
      setIsBouncing(true)
      const timer = setTimeout(() => setIsBouncing(false), 600)
      return () => clearTimeout(timer)
    }
    prevCountRef.current = totalPieces
  }, [totalPieces])

  const handleClick = (e) => {
    if (onClick) {
      onClick(e)
    } else {
      setIsDrawerOpen(true)
    }
  }

  const label = `Open Stitched Basket, ${totalPieces} ${totalPieces === 1 ? 'piece' : 'pieces'} saved`

  return (
    <>
      <style>{`
        @keyframes basketPulseBounce {
          0% { transform: scale(1); }
          25% { transform: scale(1.18) rotate(-5deg); }
          50% { transform: scale(0.95) rotate(3deg); }
          75% { transform: scale(1.08) rotate(-1deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes badgePop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
        .basket-trigger-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 40;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-height: 52px;
          padding: 10px 18px;
          border-radius: var(--radius-pill, 999px);
          background: var(--ink, #302629);
          color: var(--canvas-soft, #FFF8F5);
          border: 1.5px solid color-mix(in srgb, var(--ochre, #D49A72) 45%, transparent);
          box-shadow: 0 10px 28px color-mix(in srgb, var(--ink, #302629) 35%, transparent);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
          user-select: none;
          outline: none;
        }
        .basket-trigger-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px color-mix(in srgb, var(--ink, #302629) 45%, transparent);
          background: color-mix(in srgb, var(--ink, #302629) 92%, white);
        }
        .basket-trigger-btn:active {
          transform: translateY(1px) scale(0.98);
        }
        .basket-trigger-btn:focus-visible {
          outline: 3px solid var(--ochre, #D49A72);
          outline-offset: 4px;
        }
        .basket-trigger-btn.is-bouncing {
          animation: basketPulseBounce 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .basket-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 22px;
          height: 22px;
          padding: 0 6px;
          border-radius: var(--radius-pill, 999px);
          background: var(--berry, #B94D68);
          color: var(--canvas-soft, #FFF8F5);
          font-family: var(--font-mono, monospace);
          font-size: 0.75rem;
          font-weight: 700;
          line-height: 1;
          box-shadow: 0 2px 6px color-mix(in srgb, var(--berry, #B94D68) 40%, transparent);
          animation: badgePop 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @media (max-width: 480px) {
          .basket-trigger-label {
            display: none;
          }
          .basket-trigger-btn {
            padding: 12px;
            min-height: 48px;
            bottom: 18px;
            right: 18px;
          }
        }
      `}</style>

      <button
        type="button"
        className={`basket-trigger-btn ${isBouncing ? 'is-bouncing' : ''} ${className}`}
        onClick={handleClick}
        aria-label={label}
        aria-expanded={isDrawerOpen}
        aria-haspopup="dialog"
      >
        {/* Basket SVG Icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
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

        <span
          className="basket-trigger-label"
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.76rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          Stitched Basket
        </span>

        <span className="basket-badge" aria-hidden="true">
          {totalPieces}
        </span>
      </button>
    </>
  )
}

export default FloatingBasketTrigger
