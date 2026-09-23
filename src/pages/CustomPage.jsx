import CommissionConfigurator from '../components/CustomCommission/CommissionConfigurator'
import { useRouter } from '../context/RouterContext'

export default function CustomPage({ onApplyCommission }) {
  const { navigate } = useRouter()

  const handleApply = (orderText, regardingText) => {
    if (typeof onApplyCommission === 'function') {
      onApplyCommission(orderText, regardingText)
    }
    navigate('/contact')
  }

  return (
    <div className="page-custom py-6 pb-24 space-y-12">
      <CommissionConfigurator onApplyToContact={handleApply} />

      {/* Commission Guide & Turnaround FAQs */}
      <div className="section-shell">
        <div className="rounded-3xl border border-dashed border-[var(--berry)]/30 bg-[#FFF8F5] p-8 sm:p-12 shadow-sm space-y-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--berry-deep)] font-bold">
              Bespoke Studio Policies
            </span>
            <h3 className="font-['Coustard',serif] text-2xl sm:text-3xl text-[var(--ink)] font-bold mt-1">
              Custom Order Guidelines
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#302629]/10 space-y-2">
              <span className="font-mono text-xs font-bold text-[var(--berry-deep)] uppercase">
                01. Turnaround Time
              </span>
              <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                Small items & bouquets take 5–8 days; wearables and custom drapes take 10–18 days depending on stitch density.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#302629]/10 space-y-2">
              <span className="font-mono text-xs font-bold text-[var(--moss)] uppercase">
                02. Custom Sizing
              </span>
              <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                For wearables (halter tops, cardigans, sweaters), simply provide your bust and strap length measurements in the notes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#302629]/10 space-y-2">
              <span className="font-mono text-xs font-bold text-[var(--ochre)] uppercase">
                03. Palette Matching
              </span>
              <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                Have a specific outfit or room aesthetic? Share a reference photo or hex color codes and we will hand-match cotton swatches.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
