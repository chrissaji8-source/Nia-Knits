import React from 'react'

/**
 * OrderSlipPreview - Live perforated artisan receipt preview
 * Displays real-time ticket of selected commission specs with vintage tailor-slip aesthetic.
 *
 * @param {Object} props
 * @param {Object} props.config - Current configurator state
 * @param {string} [props.ticketId] - Optional custom ticket ID
 * @param {string} [props.className] - Optional container classes
 */
export default function OrderSlipPreview({ config = {}, ticketId, className = '' }) {
  const {
    itemType = '',
    itemTitle = '',
    leadTime = '',
    paletteTitle = '',
    customPaletteText = '',
    swatches = [],
    sizeLabel = '',
    customSizeText = '',
    materialLabel = '',
    targetDateValue = '',
    specialRequests = '',
    estimatedHours = ''
  } = config

  const activeTicketId = ticketId || `NK-CUSTOM-${(itemType || 'PIECE').toUpperCase().slice(0, 4)}-${new Date().getFullYear()}`

  const displayItem = itemTitle || (itemType ? itemType.charAt(0).toUpperCase() + itemType.slice(1) : 'Piece to be selected')
  const displayPalette = customPaletteText ? `Custom: ${customPaletteText}` : (paletteTitle || 'Artist Choice')
  const displaySize = customSizeText ? `Custom: ${customSizeText}` : (sizeLabel || 'Standard Fit')
  const displayMaterial = materialLabel || '100% Breathable Cotton'
  const displayTargetDate = targetDateValue || 'Flexible / No rush'
  const displayHours = estimatedHours || (itemType ? '~10–18 Hours of Hand-Stitching' : 'Calculated upon item selection')

  return (
    <article
      className={`order-slip-ticket relative bg-[#FFFDF9] border border-[#302629]/15 rounded-sm p-6 shadow-md text-[#302629] overflow-hidden max-w-md mx-auto ${className}`}
      aria-label="Artisan Maker's Order Slip Preview"
      style={{
        boxShadow: '0 10px 25px -5px rgba(48, 38, 41, 0.08), 0 8px 10px -6px rgba(48, 38, 41, 0.04)',
      }}
    >
      {/* Brass eyelet & hanging hole simulation */}
      <div className="flex justify-center -mt-2 mb-4">
        <div className="w-5 h-5 rounded-full border-2 border-[#D49A72] bg-[#F1E5E3] flex items-center justify-center shadow-inner">
          <div className="w-2.5 h-2.5 rounded-full bg-[#302629]/25" />
        </div>
      </div>

      {/* Perforated top dashed stitch line */}
      <div className="border-t border-dashed border-[#302629]/30 mb-4" />

      {/* Slip Header */}
      <div className="text-center pb-4 border-b border-[#302629]/15">
        <span className="inline-block px-2.5 py-0.5 mb-1.5 text-[0.6rem] font-mono tracking-widest uppercase bg-[#B94D68]/10 text-[#963B54] rounded font-semibold">
          Artisan Commission Ticket
        </span>
        <h3
          className="text-lg font-bold tracking-tight text-[#302629]"
          style={{ fontFamily: "var(--font-display, 'Coustard', serif)" }}
        >
          NIA KNITS · MAKER’S SLIP
        </h3>
        <p className="text-[0.68rem] font-mono tracking-wider text-[#705D62] uppercase mt-0.5">
          {activeTicketId} · Studio Mumbai
        </p>
      </div>

      {/* Slip Body: Key-Value Spec Matrix */}
      <div className="py-4 space-y-3.5 text-xs font-mono">
        {/* Item row */}
        <div className="flex items-start justify-between gap-3 border-b border-[#302629]/10 pb-2">
          <span className="text-[#705D62] uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <span>🏷️</span> Item
          </span>
          <div className="text-right">
            <span className="font-semibold text-[#302629] block text-[0.82rem]">
              {displayItem}
            </span>
            {leadTime ? (
              <span className="text-[0.68rem] text-[#963B54] bg-[#B94D68]/10 px-1.5 py-0.5 rounded inline-block mt-0.5">
                ⏳ {leadTime} lead
              </span>
            ) : null}
          </div>
        </div>

        {/* Color Palette row */}
        <div className="flex items-start justify-between gap-3 border-b border-[#302629]/10 pb-2">
          <span className="text-[#705D62] uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <span>🎨</span> Palette
          </span>
          <div className="text-right max-w-[65%]">
            <span className="font-semibold text-[#302629] block text-[0.82rem] break-words">
              {displayPalette}
            </span>
            {swatches && swatches.length > 0 ? (
              <div className="flex items-center justify-end gap-1.5 mt-1" aria-label="Color swatches">
                {swatches.map((hex, i) => (
                  <span
                    key={i}
                    className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-sm inline-block"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Sizing row */}
        <div className="flex items-start justify-between gap-3 border-b border-[#302629]/10 pb-2">
          <span className="text-[#705D62] uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <span>📏</span> Sizing
          </span>
          <span className="font-semibold text-[#302629] text-right text-[0.82rem] max-w-[65%] break-words">
            {displaySize}
          </span>
        </div>

        {/* Material row */}
        <div className="flex items-start justify-between gap-3 border-b border-[#302629]/10 pb-2">
          <span className="text-[#705D62] uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <span>🧶</span> Yarn
          </span>
          <span className="font-semibold text-[#302629] text-right text-[0.82rem] max-w-[65%]">
            {displayMaterial}
          </span>
        </div>

        {/* Target Timeline row */}
        <div className="flex items-start justify-between gap-3 border-b border-[#302629]/10 pb-2">
          <span className="text-[#705D62] uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <span>📅</span> Target
          </span>
          <span className="font-semibold text-[#302629] text-right text-[0.82rem]">
            {displayTargetDate}
          </span>
        </div>

        {/* Estimated Crafting Hours row */}
        <div className="flex items-start justify-between gap-3 border-b border-[#302629]/10 pb-2">
          <span className="text-[#705D62] uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <span>⏱️</span> Est. Craft
          </span>
          <span className="font-bold text-[#963B54] text-right text-[0.82rem]">
            {displayHours}
          </span>
        </div>

        {/* Special Requests row */}
        <div className="pt-1">
          <span className="text-[#705D62] uppercase tracking-wider flex items-center gap-1.5 mb-1 text-[0.7rem]">
            <span>📝</span> Special Requests & Notes:
          </span>
          <div className="bg-[#FFF8F5] p-2.5 rounded border border-[#302629]/10 text-[#302629] text-[0.78rem] font-sans leading-relaxed break-words min-h-[48px] italic">
            {specialRequests ? specialRequests : 'No additional requests. Standard artisan finish.'}
          </div>
        </div>
      </div>

      {/* Perforated tear line with notch cuts */}
      <div className="relative my-4">
        <div className="border-t-2 border-dashed border-[#302629]/25" />
        <span className="absolute -left-8 -top-3 w-5 h-5 rounded-full bg-[#F1E5E3] border border-[#302629]/15" aria-hidden="true" />
        <span className="absolute -right-8 -top-3 w-5 h-5 rounded-full bg-[#F1E5E3] border border-[#302629]/15" aria-hidden="true" />
      </div>

      {/* Tear-Off Ticket Stub Footer */}
      <div className="pt-1 text-center font-mono">
        <div className="text-[0.62rem] text-[#705D62] tracking-wider uppercase mb-1">
          100% Hand-Crocheted · Zero Automation · Loop by Loop
        </div>
        {/* Simulated artisan stitch barcode */}
        <div
          className="tracking-[0.25em] text-[#302629]/40 text-xs font-bold select-none"
          aria-hidden="true"
        >
          || | | ||| || ||| | |||| | |||
        </div>
        <p className="text-[0.62rem] text-[#963B54] font-medium mt-1">
          Crafted slowly with intention by Neha Jose
        </p>
      </div>
    </article>
  )
}
