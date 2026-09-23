import { useEffect, useMemo, useRef, useState } from 'react'
import works from './data/works.json'
import { fetchLikes, getVisitorId, saveLike } from './lib/likes'
import { BasketProvider } from './context/BasketContext'
import { RouterProvider, useRouter } from './context/RouterContext'
import Navbar from './components/Navigation/Navbar'
import HomePage from './pages/HomePage'
import WorkPage from './pages/WorkPage'
import AboutPage from './pages/AboutPage'
import CustomPage from './pages/CustomPage'
import ContactPage from './pages/ContactPage'
import FloatingBasketTrigger from './components/Basket/FloatingBasketTrigger'
import BasketDrawer from './components/Basket/BasketDrawer'

const instagramHandle = 'nia_knits_27'
const instagramProfileUrl = `https://www.instagram.com/${instagramHandle.replace(/^@/, '')}/`
const contactEmail = 'Joseneha55@gmail.com'

const getMailtoUrl = ({ subject = '', body = '' } = {}) => {
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  const query = params.toString()
  return `mailto:${contactEmail}${query ? `?${query}` : ''}`
}

function ChainLine({ className = '' }) {
  return (
    <svg className={`chain-line ${className}`} viewBox="0 0 430 34" aria-hidden="true" focusable="false">
      <path d="M3 18c8-17 22-17 30 0s22 17 30 0 22-17 30 0 22 17 30 0 22-17 30 0 22 17 30 0 22-17 30 0 22 17 30 0 22-17 30 0 22 17 30 0 22 17 30 0 22 17 30 0 22 17 30 0" />
    </svg>
  )
}

function Lightbox({ image, onClose }) {
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const previousActiveElement = useRef(null)

  useEffect(() => {
    if (!image) return undefined
    previousActiveElement.current = document.activeElement
    closeButtonRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus()
      }
    }
  }, [image, onClose])

  if (!image) return null

  return (
    <div
      ref={dialogRef}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${image.title} enlarged view`}
      onClick={onClose}
    >
      <button
        ref={closeButtonRef}
        className="lightbox-close"
        type="button"
        aria-label="Close enlarged image"
        onClick={onClose}
      >
        ×
      </button>
      <div className="lightbox-panel" onClick={(event) => event.stopPropagation()}>
        <div className="lightbox-frame">
          <img src={image.src} alt={image.alt} />
        </div>
        <p>{image.title}</p>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="site-footer section-shell">
      <ChainLine className="footer-chain" />
      <div>
        <span>© {new Date().getFullYear()} Nia Knits</span>
        <a href={instagramProfileUrl} target="_blank" rel="noreferrer">
          Instagram
        </a>
        <a href={getMailtoUrl()} target="_blank" rel="noreferrer">
          {contactEmail}
        </a>
      </div>
    </footer>
  )
}

function NiaKnitsMain() {
  const { currentPath, navigate } = useRouter()
  const regardingInputRef = useRef(null)
  const messageTextareaRef = useRef(null)

  const [visitorId] = useState(getVisitorId)
  const [likedPieces, setLikedPieces] = useState([])
  const [likes, setLikes] = useState(() => Object.fromEntries(works.map((work) => [work.id, 0])))
  const [likesAvailable, setLikesAvailable] = useState(true)
  const [updatingLikeIds, setUpdatingLikeIds] = useState([])
  const [regarding, setRegarding] = useState(() => {
    if (typeof window === 'undefined') return ''
    return new URLSearchParams(window.location.search).get('piece') || ''
  })
  const [commissionOrder, setCommissionOrder] = useState('')
  const [lightboxImage, setLightboxImage] = useState(null)

  useEffect(() => {
    let isCurrent = true

    const refreshLikes = async () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
      try {
        const data = await fetchLikes(visitorId)
        if (!isCurrent) return
        setLikes(data.likes)
        setLikedPieces(data.likedPieceIds)
        setLikesAvailable(true)
      } catch {
        if (isCurrent) setLikesAvailable(false)
      }
    }

    void refreshLikes()
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refreshLikes()
    }, 15000)

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void refreshLikes()
    }
    document.addEventListener('visibilitychange', refreshWhenVisible)

    return () => {
      isCurrent = false
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [visitorId])

  const highestLikes = useMemo(
    () => Math.max(1, ...works.map((work) => likes[work.id] || 0)),
    [likes]
  )
  const userLikeCount = likedPieces.length

  const toggleLike = async (id) => {
    if (!likesAvailable || updatingLikeIds.includes(id)) return

    const previouslyLikedPieces = likedPieces
    const previousLikeCount = likes[id] || 0
    const liked = !previouslyLikedPieces.includes(id)

    setUpdatingLikeIds((current) => [...current, id])
    setLikedPieces(liked ? [...previouslyLikedPieces, id] : previouslyLikedPieces.filter((pieceId) => pieceId !== id))
    setLikes((current) => ({ ...current, [id]: Math.max(0, previousLikeCount + (liked ? 1 : -1)) }))

    try {
      const data = await saveLike(visitorId, id, liked)
      setLikes(data.likes)
      setLikedPieces(data.likedPieceIds)
      setLikesAvailable(true)
    } catch {
      setLikes((current) => ({ ...current, [id]: previousLikeCount }))
      setLikedPieces(previouslyLikedPieces)
      setLikesAvailable(false)
    } finally {
      setUpdatingLikeIds((current) => current.filter((pieceId) => pieceId !== id))
    }
  }

  const handleInquire = (pieceTitle) => {
    const value = pieceTitle.startsWith('Inquiry:')
      ? pieceTitle
      : pieceTitle === 'Custom Commission'
      ? pieceTitle
      : `Inquiry: ${pieceTitle}`

    setRegarding(value)
    navigate('/contact')

    setTimeout(() => {
      if (regardingInputRef.current) {
        regardingInputRef.current.value = value
      }
      const nameInput = document.querySelector('input[name="name"]')
      nameInput?.focus()
    }, 100)
  }

  const handleApplyCommissionToContact = (orderText, regardingText) => {
    setRegarding(regardingText)
    setCommissionOrder(orderText)
    navigate('/contact')

    setTimeout(() => {
      if (regardingInputRef.current) {
        regardingInputRef.current.value = regardingText
      }
      if (messageTextareaRef.current) {
        messageTextareaRef.current.value = orderText
      }
      const nameInput = document.querySelector('input[name="name"]')
      nameInput?.focus()
    }, 100)
  }

  // Multi-page Route Rendering
  const renderCurrentPage = () => {
    const normalized = currentPath.toLowerCase().replace(/\/$/, '') || '/'

    switch (normalized) {
      case '/':
        return <HomePage onOpenImage={setLightboxImage} />

      case '/work':
      case '/collection':
        return (
          <WorkPage
            works={works}
            likes={likes}
            likedPieces={likedPieces}
            onToggleLike={toggleLike}
            highestLikes={highestLikes}
            likesAvailable={likesAvailable}
            updatingLikeIds={updatingLikeIds}
            userLikeCount={userLikeCount}
            onInquire={handleInquire}
          />
        )

      case '/about':
      case '/story':
        return <AboutPage onOpenImage={setLightboxImage} />

      case '/custom':
      case '/commissions':
        return <CustomPage onApplyCommission={handleApplyCommissionToContact} />

      case '/contact':
        return (
          <ContactPage
            regarding={regarding}
            setRegarding={setRegarding}
            initialMessage={commissionOrder}
            regardingInputRef={regardingInputRef}
            messageTextareaRef={messageTextareaRef}
          />
        )

      default:
        return <HomePage onOpenImage={setLightboxImage} />
    }
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      {/* Global Sticky Multi-page Navbar */}
      <Navbar />

      {/* Page Content Container with Smooth Fade */}
      <main id="main-content" className="site-main">
        {renderCurrentPage()}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Global Modals & Floating Triggers */}
      <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
      <FloatingBasketTrigger />
      <BasketDrawer />
    </>
  )
}

export default function App() {
  return (
    <BasketProvider>
      <RouterProvider>
        <NiaKnitsMain />
      </RouterProvider>
    </BasketProvider>
  )
}
