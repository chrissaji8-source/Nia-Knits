import { useState } from 'react'
import { useRouter } from '../context/RouterContext'
import defaultWorks from '../data/works.json'

const HERO_POLAROIDS = [
  {
    id: 'hero-1',
    title: 'Everlasting Crimson Rose',
    category: 'Bouquets',
    hook: '3.5mm Hook · 100% Cotton',
    image: '/work/WhatsApp Image 2026-08-29 at 11.26.58 AM.jpeg',
    alt: 'Deep red hand-crocheted rose nestled among delicate foliage',
    angle: '-4deg',
    fanAngle: '-8deg',
    badge: '🌸 Hand-Tied',
  },
  {
    id: 'hero-2',
    title: 'Lavender Haze Ruffle Top',
    category: 'Wearables',
    hook: 'Granny Stitch · Ribbed Bodice',
    image: '/work/WhatsApp Image 2026-08-29 at 11.26.34 AM.jpeg',
    alt: 'Multi-toned purple and lavender crochet halter top',
    angle: '3deg',
    fanAngle: '0deg',
    badge: '👗 Custom Fit',
  },
  {
    id: 'hero-3',
    title: 'Midnight Lace Table Drape',
    category: 'Home & Decor',
    hook: 'Lace Thread · Floral Lattice',
    image: '/work/WhatsApp Image 2026-08-29 at 11.27.02 AM.jpeg',
    alt: 'Midnight black hand-crocheted lace table runner with intricate stitch pattern',
    angle: '-2deg',
    fanAngle: '8deg',
    badge: '🪴 Artisan Decor',
  },
]

const MARQUEE_ITEMS = [
  { icon: '🌸', text: '100% Hand-Crocheted Pieces' },
  { icon: '🧶', text: 'Small-Batch & Made Slowly' },
  { icon: '🟢', text: 'Custom Commissions Open' },
  { icon: '💐', text: 'Everlasting Floral Bouquets' },
  { icon: '👗', text: 'Wearables & Statement Tops' },
  { icon: '🌿', text: 'Mindfully Crafted in Mumbai' },
  { icon: '✨', text: 'Made for Keeping & Gifting' },
  { icon: '💌', text: 'Worldwide Inquiries Welcome' },
]

function HeroMarquee() {
  return (
    <div className="hero-marquee-wrapper" aria-label="Nia Knits craft highlights">
      <div className="hero-marquee-track">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => (
          <div className="marquee-item" key={index}>
            <span className="marquee-icon" aria-hidden="true">{item.icon}</span>
            <span className="marquee-text">{item.text}</span>
            <span className="marquee-separator" aria-hidden="true">✦</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HeroPolaroids({ onOpenImage }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % HERO_POLAROIDS.length)
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + HERO_POLAROIDS.length) % HERO_POLAROIDS.length)
  }

  return (
    <div
      className={`hero-polaroid-stage ${isHovered ? 'is-fanned' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Interactive gallery of Nia Knits handmade pieces"
    >
      <div className="polaroid-stack">
        {HERO_POLAROIDS.map((item, index) => {
          const isActive = index === activeIndex
          const offset = (index - activeIndex + HERO_POLAROIDS.length) % HERO_POLAROIDS.length

          return (
            <div
              key={item.id}
              className={`polaroid-card polaroid-pos-${offset} ${isActive ? 'is-active' : ''}`}
              style={{
                '--base-rotate': item.angle,
                '--fan-rotate': item.fanAngle,
              }}
              onClick={() => {
                if (isActive) {
                  onOpenImage?.({ src: item.image, alt: item.alt, title: item.title })
                } else {
                  setActiveIndex(index)
                }
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (isActive) {
                    onOpenImage?.({ src: item.image, alt: item.alt, title: item.title })
                  } else {
                    setActiveIndex(index)
                  }
                }
              }}
              aria-label={`${item.title}, ${item.category}. ${isActive ? 'Click to enlarge' : 'Click to bring to front'}`}
            >
              <div className="polaroid-washi-tape" aria-hidden="true" />
              <div className="polaroid-badge">{item.badge}</div>
              <div className="polaroid-photo-frame">
                <img src={item.image} alt={item.alt} loading="eager" />
                <button
                  type="button"
                  className="polaroid-zoom-trigger"
                  aria-label={`Enlarge ${item.title}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenImage?.({ src: item.image, alt: item.alt, title: item.title })
                  }}
                >
                  <span>🔍 Zoom</span>
                </button>
              </div>
              <div className="polaroid-caption">
                <p className="polaroid-title">{item.title}</p>
                <div className="polaroid-meta">
                  <span className="polaroid-cat">{item.category}</span>
                  <span className="polaroid-hook">{item.hook}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="polaroid-controls">
        <button
          type="button"
          className="polaroid-nav-btn"
          onClick={handlePrev}
          aria-label="Previous featured piece"
        >
          ‹
        </button>
        <div className="polaroid-dots">
          {HERO_POLAROIDS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              className={`polaroid-dot ${idx === activeIndex ? 'is-active' : ''}`}
              aria-label={`Show ${item.title}`}
              aria-pressed={idx === activeIndex}
              onClick={() => setActiveIndex(idx)}
            />
          ))}
        </div>
        <button
          type="button"
          className="polaroid-nav-btn"
          onClick={handleNext}
          aria-label="Next featured piece"
        >
          ›
        </button>
      </div>
      <p className="polaroid-instruction-hint">
        <span aria-hidden="true">✨</span> Hover to fan out · Click any piece to view
      </p>
    </div>
  )
}

function ChainLine({ className = '' }) {
  return (
    <svg className={`chain-line ${className}`} viewBox="0 0 430 34" aria-hidden="true" focusable="false">
      <path d="M3 18c8-17 22-17 30 0s22 17 30 0 22-17 30 0 22 17 30 0 22-17 30 0 22 17 30 0 22-17 30 0 22 17 30 0 22-17 30 0 22 17 30 0 22 17 30 0 22-17 30 0" />
    </svg>
  )
}

export default function HomePage({ onOpenImage }) {
  const { navigate } = useRouter()
  const featuredWorks = defaultWorks.slice(0, 3)

  return (
    <div className="page-home space-y-16 sm:space-y-20 pb-20">
      {/* 1. Hero Landing */}
      <section className="hero section-shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="hero-status-pill" aria-label="Custom commission status">
            <span className="status-indicator-dot" aria-hidden="true" />
            <span>Custom Commissions · <strong>3 Slots Open</strong></span>
          </div>

          <p className="eyebrow">Small-batch crochet · made slowly in Mumbai</p>
          <h1 id="hero-title">
            Nia<br />
            <span className="title-accent">Knits</span>
          </h1>

          <p className="hero-tagline">
            &ldquo;For the little rituals, the big feelings, and everything made loop by loop.&rdquo;
          </p>

          <div className="hero-feature-tags" aria-label="Craft ethos">
            <span className="hero-tag">🧶 100% Handcrafted</span>
            <span className="hero-tag">🌸 Custom Colorways</span>
            <span className="hero-tag">🧵 Made to Keep</span>
          </div>

          <div className="hero-actions">
            <button
              className="hero-btn-primary cursor-pointer"
              type="button"
              onClick={() => navigate('/work')}
            >
              Explore Collection <span aria-hidden="true">→</span>
            </button>
            <button
              className="hero-btn-secondary cursor-pointer"
              type="button"
              onClick={() => navigate('/custom')}
            >
              Request Custom Piece <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>

        <div className="hero-visual" aria-label="Interactive showcase of featured handmade crochet pieces">
          <HeroPolaroids onOpenImage={onOpenImage} />
        </div>

        <ChainLine className="hero-chain" />
      </section>

      {/* 2. Infinite Craft Marquee Ribbon */}
      <HeroMarquee />

      {/* 3. Featured Drops Spotlight Section */}
      <section className="section-shell">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="eyebrow m-0 mb-1.5">Selected Handcrafted Pieces</p>
            <h2 className="font-['Coustard',serif] text-2xl sm:text-3xl lg:text-4xl text-[var(--ink)] font-bold tracking-tight">
              Featured Creations
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/work')}
            className="self-start sm:self-auto font-mono text-xs font-semibold uppercase tracking-wider text-[var(--berry-deep)] hover:text-[var(--berry)] hover:underline underline-offset-4 cursor-pointer"
          >
            View All {defaultWorks.length} Pieces →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredWorks.map((work) => (
            <div
              key={work.id}
              className="rounded-2xl border border-[var(--ink)]/15 bg-[var(--canvas-soft)] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div
                className="aspect-[4/5] relative overflow-hidden bg-[var(--canvas)] cursor-pointer"
                onClick={() => navigate('/work')}
              >
                <img
                  src={work.images?.[0]}
                  alt={work.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[var(--canvas-soft)]/90 backdrop-blur-xs font-mono text-[10px] font-semibold text-[var(--ink)] border border-[var(--ink)]/10">
                  {work.category}
                </span>
                <span className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-[var(--ink)]/80 text-[var(--canvas-soft)] font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
                  Inspect in Gallery →
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-['Coustard',serif] text-lg font-bold text-[var(--ink)] mb-1.5">
                  {work.title}
                </h3>
                <p className="text-xs text-[var(--ink-soft)] line-clamp-2 leading-relaxed mb-4">
                  {work.description}
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/work')}
                  className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--berry-deep)] hover:underline"
                >
                  View Details & Inquire ↗
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Maker & Studio Teaser Banner */}
      <section className="section-shell">
        <div className="rounded-3xl border border-dashed border-[var(--berry)]/30 bg-[#FFF8F5] p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="w-48 sm:w-56 flex-shrink-0 relative">
            <div className="rounded-sm bg-[#FFFDF9] p-3 shadow-lg border border-[#302629]/15 rotate-[-2deg]">
              <img
                src="/work/WhatsApp Image 2026-08-29 at 2.04.37 PM.jpeg"
                alt="Neha Jose, maker of Nia Knits"
                className="w-full aspect-square object-cover rounded-xs"
              />
              <p className="font-mono text-[10px] font-bold text-center mt-2 text-[var(--ink)] uppercase tracking-wider">
                Neha Jose · Mumbai
              </p>
            </div>
          </div>

          <div className="space-y-4 text-center md:text-left">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--berry-deep)] font-bold">
              The Hands Behind Nia Knits
            </p>
            <h2 className="font-['Coustard',serif] text-2xl sm:text-3xl text-[var(--ink)] font-bold">
              &ldquo;No machines. Just loops, colour, and a little bit of magic.&rdquo;
            </h2>
            <p className="text-sm sm:text-base text-[var(--ink-soft)] leading-relaxed max-w-xl">
              Every creation is looped patiently by hand in Mumbai. Explore the 4-step craft journey from yarn curation to custom packaging, along with Neha&apos;s story.
            </p>
            <div>
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="inline-flex items-center gap-2 py-3 px-6 rounded-full font-mono text-xs font-semibold uppercase tracking-wider bg-[var(--ink)] text-[var(--canvas-soft)] hover:bg-[var(--berry)] transition-colors cursor-pointer shadow-md"
              >
                <span>Read Neha&apos;s Story</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Custom Commissions CTA Callout */}
      <section className="section-shell">
        <div className="rounded-3xl bg-[var(--berry)] text-[var(--canvas-soft)] p-8 sm:p-12 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--ochre)] font-semibold">
              Bespoke Made-To-Order
            </span>
            <h2 className="font-['Coustard',serif] text-2xl sm:text-3xl font-bold text-[#FFFDF9]">
              Have a dream piece in mind?
            </h2>
            <p className="text-sm text-[#FFFDF9]/85 max-w-lg leading-relaxed">
              Design your custom halter top, handmade bag, bouquet, or amigurumi in 3 easy steps with our interactive configurator.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/custom')}
            className="py-3.5 px-7 rounded-full font-mono text-xs font-bold uppercase tracking-wider bg-[var(--canvas-soft)] text-[var(--berry-deep)] hover:bg-[#FFFDF9] hover:scale-105 transition-all shadow-md cursor-pointer flex-shrink-0"
          >
            Open Commission Builder →
          </button>
        </div>
      </section>
    </div>
  )
}
