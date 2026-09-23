import { useState, useEffect } from 'react'
import { useRouter } from '../../context/RouterContext'

const instagramHandle = 'nia_knits_27'
const instagramProfileUrl = `https://www.instagram.com/${instagramHandle.replace(/^@/, '')}/`

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle className="instagram-dot" cx="17.4" cy="6.6" r="1" />
    </svg>
  )
}

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Collection', path: '/work' },
  { label: 'About', path: '/about' },
  { label: 'Commissions', path: '/custom' },
  { label: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const { currentPath, navigate } = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return undefined
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  const handleNavClick = (e, path) => {
    e.preventDefault()
    setMenuOpen(false)
    navigate(path)
  }

  return (
    <header className="site-header">
      <a
        className="wordmark"
        href="/"
        aria-label="Nia Knits home"
        onClick={(e) => handleNavClick(e, '/')}
      >
        Nia Knits
      </a>

      <button
        className="menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="site-navigation"
        aria-label="Toggle navigation menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="sr-only">Toggle navigation</span>
        <span />
        <span />
      </button>

      <nav
        id="site-navigation"
        className={menuOpen ? 'is-open' : ''}
        aria-label="Main navigation"
      >
        {NAV_LINKS.map((link) => {
          const isActive =
            link.path === '/'
              ? currentPath === '/'
              : currentPath.startsWith(link.path)

          return (
            <a
              key={link.path}
              href={link.path}
              className={`nav-link ${isActive ? 'is-active-route' : ''}`}
              onClick={(e) => handleNavClick(e, link.path)}
            >
              {link.label}
            </a>
          )
        })}

        <a
          className="nav-instagram"
          href={instagramProfileUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Nia Knits on Instagram"
        >
          <InstagramIcon />
        </a>
      </nav>
    </header>
  )
}
