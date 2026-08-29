import { useEffect, useMemo, useRef, useState } from 'react'
import works from './data/works.json'

// The maker's Instagram username (without the @).
const instagramHandle = 'nia_knits_27'
const instagramProfileUrl = `https://www.instagram.com/${instagramHandle.replace(/^@/, '')}/`
const instagramDmUrl = `https://ig.me/m/${instagramHandle.replace(/^@/, '')}`
const placeholderEmail = 'Joseneha55@gmail.com'
const getGmailComposeUrl = ({ subject = '', body = '' } = {}) => {
  const params = new URLSearchParams({ view: 'cm', fs: '1', to: placeholderEmail })
  if (subject) params.set('su', subject)
  if (body) params.set('body', body)
  return `https://mail.google.com/mail/?${params.toString()}`
}

const getInstagramMessage = (work) => `Hi! I’d love to ask about “${work.title}”. Is it available, and what is the price?`

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle className="instagram-dot" cx="17.4" cy="6.6" r="1" />
    </svg>
  )
}

function ChainLine({ className = '' }) {
  return (
    <svg className={`chain-line ${className}`} viewBox="0 0 430 34" aria-hidden="true" focusable="false">
      <path d="M3 18c8-17 22-17 30 0s22 17 30 0 22-17 30 0 22 17 30 0 22-17 30 0 22 17 30 0 22-17 30 0 22 17 30 0 22-17 30 0 22 17 30 0 22-17 30 0 22 17 30 0 22-17 30 0 22 17 30 0 22-17 30 0 22 17 30 0 22-17 30 0 22 17 30 0" />
    </svg>
  )
}

function ThreadNeedle({ variation = 0 }) {
  return (
    <svg className={`thread-needle thread-needle-${variation}`} viewBox="0 0 124 70" aria-hidden="true" focusable="false">
      <path className="thread-path" d="M5 53C19 20 32 19 44 42s24 26 37 4 20-27 38-16" />
      <path className="needle-path" d="M28 54L86 12" />
      <circle className="needle-eye" cx="28" cy="54" r="3.2" />
    </svg>
  )
}

function WorkMedia({ work, onOpenImage }) {
  const altText = `${work.title}. ${work.description}`
  if (work.video) {
    return (
      <video autoPlay muted loop playsInline poster={work.images?.[0]} aria-label={altText}>
        <source src={work.video} type="video/mp4" />
      </video>
    )
  }
  return (
    <button className="photo-button" type="button" onClick={() => onOpenImage({ src: work.images?.[0], alt: altText, title: work.title })}>
      <img src={work.images?.[0]} alt={altText} />
    </button>
  )
}

function Lightbox({ image, onClose }) {
  useEffect(() => {
    if (!image) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [image, onClose])

  if (!image) return null

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${image.title} enlarged view`} onClick={onClose}>
      <button className="lightbox-close" type="button" aria-label="Close enlarged image" onClick={onClose}>×</button>
      <div className="lightbox-panel" onClick={(event) => event.stopPropagation()}>
        <div className="lightbox-frame">
          <img src={image.src} alt={image.alt} />
        </div>
        <p>{image.title}</p>
      </div>
    </div>
  )
}

function InstagramPrompt({ work, copied, onCopy, onClose }) {
  useEffect(() => {
    if (!work) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [work, onClose])

  if (!work) return null

  return (
    <div className="instagram-prompt" role="dialog" aria-modal="true" aria-labelledby="instagram-prompt-title" onClick={onClose}>
      <div className="instagram-prompt-panel" onClick={(event) => event.stopPropagation()}>
        <button className="instagram-prompt-close" type="button" aria-label="Close Instagram message prompt" onClick={onClose}>×</button>
        <p className="eyebrow">Message ready</p>
        <h2 id="instagram-prompt-title">Ask about {work.title}</h2>
        <p className="instagram-prompt-message">{getInstagramMessage(work)}</p>
        <div className="instagram-prompt-actions">
          <button className="instagram-copy-button" type="button" onClick={() => onCopy(work)}>{copied ? 'Copied ✓' : 'Copy message'}</button>
          <a className="instagram-open-button" href={instagramDmUrl} target="_blank" rel="noreferrer" onClick={onClose}>Open Instagram <span aria-hidden="true">↗</span></a>
        </div>
        <p className="instagram-prompt-note">Instagram may not pre-fill text from website links. If needed, open the chat and paste the copied message.</p>
      </div>
    </div>
  )
}

function BouquetReveal({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="bouquet-reveal" role="dialog" aria-modal="true" aria-labelledby="bouquet-reveal-title" onClick={onClose}>
      <div className="bouquet-reveal-panel" onClick={(event) => event.stopPropagation()}>
        <button className="bouquet-reveal-close" type="button" aria-label="Close bouquet message" onClick={onClose}>×</button>
        <div className="bouquet-art" aria-hidden="true">
          <svg viewBox="0 0 220 170" focusable="false">
            <path className="bouquet-stems" d="M108 157C105 119 88 79 61 48M109 157c2-44 3-78 3-117M111 157c13-39 32-75 62-105M108 157c-18-28-40-39-62-50M112 157c19-25 39-38 61-46" />
            <g className="bouquet-flower bouquet-flower-left">
              <circle className="flower-petal flower-petal-berry" cx="59" cy="43" r="15" />
              <circle className="flower-petal flower-petal-berry" cx="45" cy="53" r="15" />
              <circle className="flower-petal flower-petal-berry" cx="67" cy="58" r="15" />
              <circle className="flower-center" cx="57" cy="52" r="8" />
            </g>
            <g className="bouquet-flower bouquet-flower-center">
              <circle className="flower-petal flower-petal-ochre" cx="112" cy="31" r="16" />
              <circle className="flower-petal flower-petal-ochre" cx="96" cy="43" r="16" />
              <circle className="flower-petal flower-petal-ochre" cx="128" cy="44" r="16" />
              <circle className="flower-center" cx="112" cy="39" r="8" />
            </g>
            <g className="bouquet-flower bouquet-flower-right">
              <circle className="flower-petal flower-petal-plum" cx="173" cy="47" r="15" />
              <circle className="flower-petal flower-petal-plum" cx="158" cy="57" r="15" />
              <circle className="flower-petal flower-petal-plum" cx="181" cy="65" r="15" />
              <circle className="flower-center" cx="171" cy="56" r="8" />
            </g>
            <path className="bouquet-wrap" d="M77 119c21 7 43 9 67 1l-9 31c-17 7-39 7-56 0z" />
          </svg>
        </div>
        <p className="eyebrow">A little secret</p>
        <h2 id="bouquet-reveal-title">Would you like to get coffee with me?</h2>
        <p className="bouquet-reveal-note">I thought this was the sweetest way to ask. ☕<br /><span>For Nannu</span><br /><strong>By Chrissy</strong></p>
        <button className="bouquet-reveal-okay" type="button" onClick={onClose}>Keep browsing <span aria-hidden="true">↗</span></button>
      </div>
    </div>
  )
}

function LikeMeter({ work, liked, onToggle, highestLikes }) {
  const displayLikes = work.likes + (liked ? 1 : 0)
  const fillWidth = highestLikes ? (displayLikes / highestLikes) * 100 : 0

  return (
    <div className="likemeter">
      <button
        className={`like-button ${liked ? 'is-liked' : ''}`}
        type="button"
        aria-pressed={liked}
        aria-label={`${liked ? 'Unlike' : 'Like'} ${work.title}`}
        onClick={() => onToggle(work.id)}
      >
        <span aria-hidden="true">{liked ? '♥' : '♡'}</span>
        <span className="like-number">{displayLikes}</span>
      </button>
      <div className="meter-track" aria-label={`${displayLikes} likes, relative popularity meter`}>
        <div className="meter-fill" style={{ width: `${fillWidth}%` }} />
      </div>
    </div>
  )
}

function App() {
  const revealRoot = useRef(null)
  const bouquetClickCount = useRef(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [likedPieces, setLikedPieces] = useState(() => {
    try {
      const storedLikes = JSON.parse(localStorage.getItem('nia-knits-liked-pieces') || '[]')
      return Array.isArray(storedLikes) ? storedLikes : []
    } catch {
      return []
    }
  })
  const [regarding, setRegarding] = useState(() => new URLSearchParams(window.location.search).get('piece') || '')
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightboxImage, setLightboxImage] = useState(null)
  const [instagramPiece, setInstagramPiece] = useState(null)
  const [copiedPiece, setCopiedPiece] = useState('')
  const [bouquetRevealOpen, setBouquetRevealOpen] = useState(false)

  useEffect(() => {
    const root = revealRoot.current
    if (!root) return undefined
    const revealables = root.querySelectorAll('[data-reveal]')
    if (!('IntersectionObserver' in window)) {
      revealables.forEach((element) => element.classList.add('is-revealed'))
      return undefined
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' })
    revealables.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [activeCategory])

  const highestLikes = useMemo(
    () => Math.max(...works.map((work) => work.likes + (likedPieces.includes(work.id) ? 1 : 0))),
    [likedPieces],
  )

  const categories = useMemo(
    () => ['All', ...new Set(works.map((work) => work.category).filter(Boolean))],
    [],
  )

  const visibleWorks = useMemo(
    () => activeCategory === 'All' ? works : works.filter((work) => work.category === activeCategory),
    [activeCategory],
  )

  const toggleLike = (id) => {
    // To make likes shared between visitors, replace this localStorage layer with a small backend (for example Supabase); the UI can keep this interface.
    setLikedPieces((current) => {
      const next = current.includes(id) ? current.filter((pieceId) => pieceId !== id) : [...current, id]
      localStorage.setItem('nia-knits-liked-pieces', JSON.stringify(next))
      return next
    })
  }

  const closeMenu = () => setMenuOpen(false)

  const handleCategoryClick = (category) => {
    if (category === 'Bouquets') {
      bouquetClickCount.current += 1
      if (bouquetClickCount.current === 5) {
        setBouquetRevealOpen(true)
        bouquetClickCount.current = 0
      }
    } else {
      bouquetClickCount.current = 0
    }
    setActiveCategory(category)
  }

  const copyInstagramMessage = async (work) => {
    const message = getInstagramMessage(work)
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message)
      } else {
        const helper = document.createElement('textarea')
        helper.value = message
        helper.setAttribute('readonly', '')
        helper.style.position = 'fixed'
        helper.style.opacity = '0'
        document.body.appendChild(helper)
        helper.select()
        const copied = document.execCommand('copy')
        helper.remove()
        if (!copied) throw new Error('Clipboard copy failed')
      }
      setCopiedPiece(work.id)
    } catch {
      setCopiedPiece('')
    }
  }

  const onContactSubmit = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const subject = `Nia Knits inquiry: ${form.get('regarding') || 'a crochet piece'}`
    const body = `Name: ${form.get('name')}\nEmail: ${form.get('email')}\n\n${form.get('message')}`
    const composeWindow = window.open(getGmailComposeUrl({ subject, body }), '_blank', 'noopener,noreferrer')
    if (!composeWindow) window.location.href = getGmailComposeUrl({ subject, body })
  }

  return (
    <>
      <a className="skip-link" href="#work">Skip to the work</a>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Nia Knits home" onClick={closeMenu}>Nia Knits</a>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen((open) => !open)}>
          <span className="sr-only">Toggle navigation</span><span /><span />
        </button>
        <nav id="site-navigation" className={menuOpen ? 'is-open' : ''} aria-label="Main navigation">
          <a href="#work" onClick={closeMenu}>Work</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
          <a className="nav-instagram" href={instagramProfileUrl} target="_blank" rel="noreferrer" aria-label="Nia Knits on Instagram"><InstagramIcon /></a>
        </nav>
      </header>

      <main id="top" ref={revealRoot}>
        <section className="hero section-shell" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Small-batch crochet · made slowly</p>
            <h1 id="hero-title">Nia<br />Knits</h1>
            <p className="hero-tagline">"For the little rituals, the big feelings, and everything made by hand."</p>
            <a className="quiet-link" href="#work">See the work <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-visual" aria-label="A collection of Nia Knits crochet work">
            <figure className="hero-photo photo-tote"><button className="photo-button" type="button" onClick={() => setLightboxImage({ src: '/work/WhatsApp Image 2026-08-29 at 11.27.01 AM (2).jpeg', alt: 'Berry and cream crochet work', title: 'Hero work' })}><img src="/work/WhatsApp Image 2026-08-29 at 11.27.01 AM (2).jpeg" alt="Berry and cream crochet work" /></button></figure>
            <figure className="hero-photo photo-hat"><button className="photo-button" type="button" onClick={() => setLightboxImage({ src: '/work/WhatsApp Image 2026-08-29 at 11.27.01 AM (1).jpeg', alt: 'Soft lavender crochet work', title: 'Hero work' })}><img src="/work/WhatsApp Image 2026-08-29 at 11.27.01 AM (1).jpeg" alt="Soft lavender crochet work" /></button></figure>
            <figure className="hero-photo photo-bag"><button className="photo-button" type="button" onClick={() => setLightboxImage({ src: '/work/WhatsApp Image 2026-08-29 at 11.27.02 AM.jpeg', alt: 'Moss green open stitch crochet shoulder bag on a stone surface', title: 'Hero work' })}><img src="/work/WhatsApp Image 2026-08-29 at 11.27.02 AM.jpeg" alt="Moss green open stitch crochet shoulder bag on a stone surface" /></button></figure>
          </div>
          <ChainLine className="hero-chain" />
        </section>

        <section id="work" className="work-section section-shell" aria-labelledby="work-title">
          <div className="section-heading" data-reveal="heading">
            <p className="eyebrow">Selected work · {works.length} pieces</p><h2 id="work-title">Made for keeping</h2><p>Little crochet objects with a generous point of view.</p>
          </div>
          <div className="category-filters" role="group" aria-label="Filter work by category">
            {categories.map((category) => (
              <button key={category} type="button" className={activeCategory === category ? 'is-active' : ''} aria-pressed={activeCategory === category} onClick={() => handleCategoryClick(category)}>{category}</button>
            ))}
          </div>
          <div className="work-grid">
            {visibleWorks.map((work, index) => (
              <article className={`work-card work-card-pattern-${index % 6}`} data-reveal="card" style={{ '--stitch-delay': `${index * 90}ms` }} key={work.id}>
                <div className={`work-image crop-${work.id}`}>
                  <WorkMedia work={work} onOpenImage={setLightboxImage} /><span className="piece-number">{String(index + 1).padStart(2, '0')}</span><ThreadNeedle variation={index % 3} />
                </div>
                <div className="card-content">
                  <h3>{work.title}</h3><p className="work-description">{work.description}</p><p className="materials">{work.materials}</p>
                  <LikeMeter work={work} liked={likedPieces.includes(work.id)} onToggle={toggleLike} highestLikes={highestLikes} />
                  <div className="card-actions">
                    <a className="inquire-link" href={`?piece=${encodeURIComponent(work.title)}#contact`}>Inquire about this piece <span aria-hidden="true">↗</span></a>
                    <button className="instagram-inquire-link" type="button" title="Shows a ready message and opens Instagram" aria-label={copiedPiece === work.id ? 'Message ready for Instagram' : `Ask about ${work.title} on Instagram`} onClick={() => { setInstagramPiece(work); void copyInstagramMessage(work) }}>
                      <InstagramIcon />
                      <span>{copiedPiece === work.id ? 'Message ready' : 'Ask on Instagram'}</span>
                      <span aria-hidden="true">↗</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="about-section section-shell" aria-labelledby="about-title">
          <div className="about-image" data-reveal="image"><button className="photo-button" type="button" onClick={() => setLightboxImage({ src: '/work/WhatsApp Image 2026-08-29 at 2.04.37 PM.jpeg', alt: 'A selection of colourful handmade crochet pieces by Nia Knits', title: 'The maker' })}><img src="/work/WhatsApp Image 2026-08-29 at 2.04.37 PM.jpeg" alt="A selection of colourful handmade crochet pieces by Nia Knits" /></button><span className="about-stamp">Made<br />by hand<br />with care</span></div>
          <div className="about-copy" data-reveal="copy">
            <p className="eyebrow">The maker</p><h2 id="about-title">Loops, colour, and a little bit of magic.</h2>
            <p>
              Hi, I’m <strong className="maker-name">Neha Jose</strong> — the hands behind Nia Knits.<br /><br />
              I’m a girl with lots of hobbies and a heart full of creativity 💕 I love expressing myself through crochet, sewing, cooking, singing, and playing the guitar (still learning — no bar chords yet! 🎸).<br /><br />
              I’m always curious, always creating, and always excited to learn something new. For me, every little idea is a chance to turn creativity into something beautiful ✨<br /><br />
              I’ve just completed my SYBCom from St. Xavier’s and I’m currently doing an internship 🌸 While stepping into the professional world, I’m making sure my creative side never fades ✨.
            </p>
          </div>
        </section>

        <section id="contact" className="contact-section section-shell" aria-labelledby="contact-title">
          <div className="contact-intro" data-reveal="copy">
            <p className="eyebrow">Say hello</p><h2 id="contact-title">Have a piece in mind?</h2><p>For commissions, stockists, or a friendly question about something you spotted here, leave a note.</p>
            <a className="instagram-card" href={instagramProfileUrl} target="_blank" rel="noreferrer"><InstagramIcon /><span><small>Follow along</small><strong>@{instagramHandle.replace(/^@/, '')}</strong></span><span aria-hidden="true">↗</span></a>
          </div>
          <form className="contact-form" data-reveal="form" onSubmit={onContactSubmit}>
            <div className="form-pair"><label>Name<input name="name" type="text" autoComplete="name" required /></label><label>Email<input name="email" type="email" autoComplete="email" required /></label></div>
            <label>Regarding<input name="regarding" type="text" value={regarding} onChange={(event) => setRegarding(event.target.value)} placeholder="A piece, a commission, a question…" /></label>
            <label>Message<textarea name="message" rows="5" required placeholder="Tell me what you have in mind." /></label>
            <div className="form-footer"><p>Messages open in Gmail and are sent to <span>{placeholderEmail}</span>.</p><button type="submit">Send a note <span aria-hidden="true">↗</span></button></div>
          </form>
        </section>
      </main>

      <footer className="site-footer section-shell"><ChainLine className="footer-chain" /><div><span>© {new Date().getFullYear()} Nia Knits</span><a href={instagramProfileUrl} target="_blank" rel="noreferrer">Instagram</a><a href={getGmailComposeUrl()} target="_blank" rel="noreferrer">{placeholderEmail}</a></div></footer>
      <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
      <InstagramPrompt work={instagramPiece} copied={copiedPiece === instagramPiece?.id} onCopy={copyInstagramMessage} onClose={() => setInstagramPiece(null)} />
      <BouquetReveal open={bouquetRevealOpen} onClose={() => setBouquetRevealOpen(false)} />
    </>
  )
}

export default App
