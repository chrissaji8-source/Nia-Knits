import ScrapbookAbout from '../components/About/ScrapbookAbout'
import { useRouter } from '../context/RouterContext'

export default function AboutPage({ onOpenImage }) {
  const { navigate } = useRouter()

  return (
    <div className="page-about py-6 pb-24 space-y-12">
      <ScrapbookAbout onOpenImage={onOpenImage} />

      {/* Studio Philosophy & FAQ Callout */}
      <div className="section-shell">
        <div className="rounded-3xl border border-[var(--ink)]/15 bg-[var(--canvas-soft)] p-8 sm:p-12 shadow-sm space-y-8">
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--moss)] font-bold">
              Artisan Principles & Fiber Care
            </span>
            <h3 className="font-['Coustard',serif] text-2xl sm:text-3xl text-[var(--ink)] font-bold mt-1">
              Why Slow Fashion & Handcraft Matter
            </h3>
            <p className="text-sm sm:text-base text-[var(--ink-soft)] leading-relaxed mt-3">
              Unlike machine knitting, genuine crochet cannot be manufactured by commercial automated machinery. Every loop is pulled with human hands, deliberate tension, and intentional care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[var(--ink)]/10">
            <div className="space-y-2">
              <span className="text-xl" aria-hidden="true">🌱</span>
              <h4 className="font-['Coustard',serif] text-base font-bold text-[var(--ink)]">
                100% Sustainable Cotton
              </h4>
              <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                We select premium, breathable, OEKO-TEX certified cotton yarns that soften with age and hold structural integrity.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xl" aria-hidden="true">💧</span>
              <h4 className="font-['Coustard',serif] text-base font-bold text-[var(--ink)]">
                Gentle Handwash Care
              </h4>
              <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                Handwash gently in cold water with mild detergent. Lay flat on a clean towel to dry to preserve original measurements.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xl" aria-hidden="true">✨</span>
              <h4 className="font-['Coustard',serif] text-base font-bold text-[var(--ink)]">
                Heirloom Construction
              </h4>
              <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                With 5-pass tail locking and reinforced seam finishes, our wearables and home drapes are crafted to be cherished for years.
              </p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between flex-wrap gap-4 border-t border-[var(--ink)]/10">
            <p className="text-xs text-[var(--ink-soft)] font-mono">
              Have a specific question about our materials or process?
            </p>
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="py-2.5 px-5 rounded-full font-mono text-xs font-semibold uppercase tracking-wider bg-[var(--ink)] text-[var(--canvas-soft)] hover:bg-[var(--berry)] transition-colors cursor-pointer"
            >
              Ask a Question ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
