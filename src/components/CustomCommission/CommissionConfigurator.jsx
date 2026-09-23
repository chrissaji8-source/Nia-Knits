import React, { useState, useId, useMemo } from 'react'
import OrderSlipPreview from './OrderSlipPreview'
import {
  formatCustomCommissionInquiry,
  openInstagramDM
} from '../../utils/inquiry'

/**
 * Custom Commission Item Types
 */
const COMMISSION_ITEM_TYPES = [
  {
    id: 'wearable',
    title: 'Cardigan / Wearable',
    leadTime: '2–3 weeks',
    icon: '👗',
    badge: 'Popular',
    desc: 'Bespoke halter tops, tie-front cardigans, vests, and open-mesh tops.',
    sizes: [
      { id: 'xs', label: 'XS (30-32")' },
      { id: 's', label: 'S (32-34")' },
      { id: 'm', label: 'M (36-38")' },
      { id: 'l', label: 'L (40-42")' },
      { id: 'xl', label: 'XL (44-46")' },
      { id: 'custom', label: 'Custom Measurements' },
    ],
  },
  {
    id: 'headwear',
    title: 'Beanie / Headwear',
    leadTime: '5–7 days',
    icon: '🧢',
    badge: 'Quick Craft',
    desc: 'Slouchy beanies, bucket hats, scalloped headbands, and hair ties.',
    sizes: [
      { id: 'adult', label: 'Standard Adult (21-22")' },
      { id: 'slouchy', label: 'Slouchy / Oversized (23-24")' },
      { id: 'petite', label: 'Petite / Youth (19-20")' },
      { id: 'custom', label: 'Custom Circumference' },
    ],
  },
  {
    id: 'bouquet',
    title: 'Everlasting Bouquet',
    leadTime: '1–2 weeks',
    icon: '💐',
    badge: 'Keepsake',
    desc: 'Hand-crocheted roses, daisies, baby’s breath, and bespoke foliage.',
    sizes: [
      { id: 'single', label: 'Single Bloom Stem' },
      { id: 'trio', label: 'Petite Trio (3 blooms + greenery)' },
      { id: 'grand', label: 'Grand Arrangement (6-8 blooms)' },
    ],
  },
  {
    id: 'amigurumi',
    title: 'Amigurumi / Plush',
    leadTime: '1–2 weeks',
    icon: '🧸',
    badge: 'Pocket Buddy',
    desc: 'Pocket buddies, mini succulents, comic figurines, and bag charms.',
    sizes: [
      { id: 'pocket', label: 'Pocket Companion (4-5")' },
      { id: 'medium', label: 'Medium Buddy (8-10")' },
      { id: 'custom', label: 'Custom Dimensions' },
    ],
  },
  {
    id: 'decor',
    title: 'Blanket / Home Decor',
    leadTime: '3–4 weeks',
    icon: '🛋️',
    badge: 'Heirloom',
    desc: 'Lace table runners, coasters, drapes, and granny-square throws.',
    sizes: [
      { id: 'runner', label: 'Table Runner (14x48")' },
      { id: 'lap', label: 'Lap Blanket (36x48")' },
      { id: 'throw', label: 'Throw Blanket (48x60")' },
      { id: 'custom', label: 'Custom Dimensions' },
    ],
  },
]

/**
 * Custom Commission Palettes
 */
const COMMISSION_PALETTES = [
  {
    id: 'berry',
    title: 'Berry Blossom',
    swatches: ['#B94D68', '#E8A598', '#FFF8F5'],
    desc: 'Romantic, warm, and vintage floral tones',
  },
  {
    id: 'forest',
    title: 'Forest & Sage',
    swatches: ['#74816C', '#A3B19B', '#E7E1D3'],
    desc: 'Earthy, calming, and natural foliage aesthetic',
  },
  {
    id: 'sunset',
    title: 'Sunset Ochre',
    swatches: ['#D49A72', '#C46D4E', '#F6D8A8'],
    desc: 'Golden hour warmth with rich Mediterranean accents',
  },
  {
    id: 'plum',
    title: 'Midnight Plum',
    swatches: ['#806174', '#302629', '#D9D2E9'],
    desc: 'Moody, sophisticated, and dramatic lace contrast',
  },
  {
    id: 'custom',
    title: 'Custom Palette',
    swatches: [],
    desc: 'Describe your dream colors or specific aesthetic',
  },
]

/**
 * Custom Commission Yarn Materials
 */
const COMMISSION_MATERIALS = [
  {
    id: 'cotton',
    label: '100% Breathable Cotton',
    desc: 'Crisp stitch definition, cool against skin, machine hand-washable.',
  },
  {
    id: 'acrylic',
    label: 'Soft Acrylic Blend',
    desc: 'Lightweight warmth, vivid saturation, pill-resistant.',
  },
  {
    id: 'lace',
    label: 'Fine Lace Thread',
    desc: 'Delicate openwork, silky drape, heirloom quality.',
  },
]

// Module-level 10-day buffer calculation
const MIN_DATE_STRING = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

/**
 * Validates target date with minimum buffer (10 days)
 */
function validateCommissionTargetDate(dateStr, minDaysBuffer = 10) {
  if (!dateStr || dateStr === 'no-rush' || dateStr === '3-weeks') {
    return { valid: true, error: null }
  }
  const target = new Date(dateStr)
  if (isNaN(target.getTime())) {
    return { valid: false, error: 'Invalid date format' }
  }
  const now = new Date()
  const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < minDaysBuffer) {
    return {
      valid: false,
      error: `Target date must be at least ${minDaysBuffer} days in advance (artisan slow-craft buffer).`,
    }
  }
  return { valid: true, error: null }
}

/**
 * Estimates slow-craft hand-stitching hours
 */
function getEstimatedHours(itemType, sizeId) {
  switch (itemType) {
    case 'wearable':
      if (sizeId === 'xl') return '~18–24 Hours of Hand-Stitching'
      return '~14–18 Hours of Hand-Stitching'
    case 'headwear':
      return '~4–6 Hours of Hand-Stitching'
    case 'bouquet':
      if (sizeId === 'grand') return '~10–14 Hours of Hand-Stitching'
      if (sizeId === 'trio') return '~6–10 Hours of Hand-Stitching'
      return '~3–5 Hours of Hand-Stitching'
    case 'amigurumi':
      if (sizeId === 'medium') return '~8–12 Hours of Hand-Stitching'
      return '~5–8 Hours of Hand-Stitching'
    case 'decor':
      if (sizeId === 'throw') return '~28–36 Hours of Hand-Stitching'
      return '~20–30 Hours of Hand-Stitching'
    default:
      return '~10–18 Hours of Hand-Stitching'
  }
}

/**
 * CommissionConfigurator - 3-Step Interactive Custom Order Builder
 *
 * @param {Object} props
 * @param {function(string, string, Object): void} [props.onApplyToContact] - Triggered when transferring config to contact form
 * @param {function(Object, string, string): void} [props.onApplyConfig] - Optional alternative handler
 * @param {function(Object): void} [props.onInstagramDispatch] - Optional handler for Instagram dispatch
 * @param {string} [props.initialItemType] - Optional pre-selected item type
 * @param {string} [props.className] - Optional custom class name
 */
export default function CommissionConfigurator({
  onApplyToContact,
  onApplyConfig,
  onInstagramDispatch,
  initialItemType = '',
  className = '',
}) {
  const formId = useId()

  // Step state (1: Item Type, 2: Palette & Sizing, 3: Special Requests & Slip)
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1: Item Type
  const [itemType, setItemType] = useState(initialItemType)

  // Step 2: Palette, Sizing, Yarn
  const [paletteId, setPaletteId] = useState('berry')
  const [customPaletteText, setCustomPaletteText] = useState('')
  const [sizeId, setSizeId] = useState('m')
  const [customSizeText, setCustomSizeText] = useState('')
  const [materialId, setMaterialId] = useState('cotton')

  // Step 3: Special Requests & Target Date
  const [targetTimeline, setTargetTimeline] = useState('3-weeks')
  const [specificDate, setSpecificDate] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')

  // UI state
  const [dateError, setDateError] = useState(null)
  const [notification, setNotification] = useState(null)
  const [isCopied, setIsCopied] = useState(false)

  // Derived current item details
  const activeItemObj = useMemo(() => {
    return COMMISSION_ITEM_TYPES.find((item) => item.id === itemType) || null
  }, [itemType])

  // Available sizing list for currently selected item type
  const availableSizes = useMemo(() => {
    if (!activeItemObj) return []
    return activeItemObj.sizes
  }, [activeItemObj])

  // Active palette object
  const activePaletteObj = useMemo(() => {
    return COMMISSION_PALETTES.find((p) => p.id === paletteId) || COMMISSION_PALETTES[0]
  }, [paletteId])

  // Active material object
  const activeMaterialObj = useMemo(() => {
    return COMMISSION_MATERIALS.find((m) => m.id === materialId) || COMMISSION_MATERIALS[0]
  }, [materialId])

  // Selected size label
  const activeSizeLabel = useMemo(() => {
    if (!availableSizes || availableSizes.length === 0) return 'Standard'
    const found = availableSizes.find((s) => s.id === sizeId)
    return found ? found.label : (availableSizes[0]?.label || 'Standard')
  }, [availableSizes, sizeId])

  // Derived target date text value
  const targetDateValue = useMemo(() => {
    if (targetTimeline === 'no-rush') return 'Flexible / No rush'
    if (targetTimeline === '3-weeks') return 'Within 3–4 weeks'
    if (targetTimeline === 'specific-date') {
      return specificDate ? `Specific Date: ${specificDate}` : 'Specific Date (To be confirmed)'
    }
    return 'Flexible / No rush'
  }, [targetTimeline, specificDate])

  // Estimated crafting hours
  const estimatedHours = useMemo(() => {
    return getEstimatedHours(itemType, sizeId)
  }, [itemType, sizeId])

  // Assembled config snapshot
  const commissionConfig = useMemo(() => {
    return {
      itemType,
      itemTitle: activeItemObj ? activeItemObj.title : 'Custom Piece',
      leadTime: activeItemObj ? activeItemObj.leadTime : '',
      paletteId,
      paletteTitle: activePaletteObj.title,
      customPaletteText: paletteId === 'custom' ? customPaletteText : '',
      swatches: activePaletteObj.swatches || [],
      sizeId,
      sizeLabel: activeSizeLabel,
      customSizeText: (sizeId === 'custom' || activeSizeLabel.includes('Custom')) ? customSizeText : '',
      materialId,
      materialLabel: activeMaterialObj.label,
      targetTimeline,
      targetDateValue,
      specialRequests: specialRequests.trim(),
      estimatedHours,
    }
  }, [
    itemType,
    activeItemObj,
    paletteId,
    activePaletteObj,
    customPaletteText,
    sizeId,
    activeSizeLabel,
    customSizeText,
    materialId,
    activeMaterialObj,
    targetTimeline,
    targetDateValue,
    specialRequests,
    estimatedHours,
  ])

  // Handle item selection in Step 1
  const handleSelectItemType = (typeId) => {
    setItemType(typeId)
    const newObj = COMMISSION_ITEM_TYPES.find((i) => i.id === typeId)
    if (newObj && newObj.sizes.length > 0) {
      // Default to medium or first available size
      const defaultSize = newObj.sizes.find((s) => s.id === 'm' || s.id === 'adult' || s.id === 'trio' || s.id === 'runner') || newObj.sizes[0]
      setSizeId(defaultSize.id)
    }
  }

  // Handle specific date change with live buffer validation
  const handleDateChange = (e) => {
    const val = e.target.value
    setSpecificDate(val)
    if (val) {
      const res = validateCommissionTargetDate(val, 10)
      if (!res.valid) {
        setDateError(res.error)
      } else {
        setDateError(null)
      }
    } else {
      setDateError(null)
    }
  }

  // Handle Reset action
  const handleReset = () => {
    setItemType('')
    setPaletteId('berry')
    setCustomPaletteText('')
    setSizeId('m')
    setCustomSizeText('')
    setMaterialId('cotton')
    setTargetTimeline('3-weeks')
    setSpecificDate('')
    setSpecialRequests('')
    setDateError(null)
    setCurrentStep(1)
    setNotification('Configurator reset to clean initial state.')
    setTimeout(() => setNotification(null), 3000)
  }

  // Handle Apply to Inquiry Form action
  const handleApplyToContact = () => {
    if (!itemType) {
      setCurrentStep(1)
      return
    }

    if (targetTimeline === 'specific-date' && specificDate) {
      const dateCheck = validateCommissionTargetDate(specificDate, 10)
      if (!dateCheck.valid) {
        setDateError(dateCheck.error)
        return
      }
    }

    const formattedOrderText = formatCustomCommissionInquiry(commissionConfig)
    const palettePart = paletteId === 'custom' && customPaletteText
      ? customPaletteText
      : activePaletteObj.title
    const regarding = `Custom Commission: ${commissionConfig.itemTitle} (${palettePart})`

    if (typeof onApplyToContact === 'function') {
      onApplyToContact(formattedOrderText, regarding, commissionConfig)
    }
    if (typeof onApplyConfig === 'function') {
      onApplyConfig(commissionConfig, formattedOrderText, regarding)
    }

    setNotification('✨ Your custom order slip was applied to the contact form!')

    // Smooth scroll and autofocus behavior in browser
    if (typeof window !== 'undefined') {
      const contactSection = document.getElementById('contact')
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.location.hash = '#contact'
      }

      setTimeout(() => {
        const nameInput = document.querySelector('input[name="name"]') || document.getElementById('name')
        if (nameInput) {
          nameInput.focus()
        }
      }, 400)
    }
  }

  // Handle Instagram dispatch
  const handleInstagramDispatch = async () => {
    const formattedOrderText = formatCustomCommissionInquiry(commissionConfig)
    await openInstagramDM(formattedOrderText)
    setIsCopied(true)
    setNotification('📋 Order slip copied to clipboard & opening Instagram DM!')
    setTimeout(() => {
      setIsCopied(false)
      setNotification(null)
    }, 4500)

    if (typeof onInstagramDispatch === 'function') {
      onInstagramDispatch(commissionConfig)
    }
  }

  return (
    <section
      id="custom-commissions"
      className={`configurator-section section-shell py-16 ${className}`}
      aria-labelledby="configurator-heading"
    >
      {/* Section Header */}
      <div className="section-heading mb-10 text-center max-w-2xl mx-auto">
        <p className="eyebrow uppercase font-mono tracking-widest text-xs text-[#B94D68] font-semibold mb-2">
          Bespoke & Made to Order
        </p>
        <h2
          id="configurator-heading"
          className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#302629] mb-3"
          style={{ fontFamily: "var(--font-display, 'Coustard', serif)" }}
        >
          Build Your Custom Piece
        </h2>
        <p className="text-sm sm:text-base text-[#705D62] leading-relaxed">
          Loop by loop, tailor-made for you. Select your preferred garment silhouette, curated color palette, and bespoke measurements.
        </p>
      </div>

      {/* Alert / Notification Banner */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="mb-8 p-4 bg-[#B94D68]/10 border border-[#B94D68]/30 rounded-xl text-center text-sm font-medium text-[#963B54] flex items-center justify-between gap-4 max-w-2xl mx-auto shadow-sm transition-all"
        >
          <span>{notification}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs uppercase font-mono tracking-wider underline hover:text-[#302629]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stepper Navigation Tabs */}
      <nav
        aria-label="Commission Configurator Steps"
        className="stepper-nav max-w-3xl mx-auto mb-10"
      >
        <div
          role="tablist"
          className="grid grid-cols-3 gap-2 sm:gap-4 p-1.5 bg-[#FFF8F5] border border-[#302629]/15 rounded-2xl shadow-sm"
        >
          {/* Step 1 Button */}
          <button
            role="tab"
            type="button"
            id={`${formId}-tab-1`}
            aria-selected={currentStep === 1}
            aria-controls={`${formId}-panel-1`}
            onClick={() => setCurrentStep(1)}
            className={`py-3 px-2 sm:px-4 rounded-xl text-center transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 font-mono text-xs ${
              currentStep === 1
                ? 'bg-[#B94D68] text-[#FFF8F5] shadow-sm font-bold'
                : 'text-[#705D62] hover:bg-[#F1E5E3] hover:text-[#302629]'
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[0.68rem] shrink-0 font-bold">
              {itemType ? '✓' : '1'}
            </span>
            <span className="truncate">1. Item Type</span>
          </button>

          {/* Step 2 Button */}
          <button
            role="tab"
            type="button"
            id={`${formId}-tab-2`}
            aria-selected={currentStep === 2}
            aria-controls={`${formId}-panel-2`}
            disabled={!itemType}
            onClick={() => itemType && setCurrentStep(2)}
            className={`py-3 px-2 sm:px-4 rounded-xl text-center transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 font-mono text-xs ${
              currentStep === 2
                ? 'bg-[#B94D68] text-[#FFF8F5] shadow-sm font-bold'
                : !itemType
                ? 'opacity-40 cursor-not-allowed text-[#705D62]'
                : 'text-[#705D62] hover:bg-[#F1E5E3] hover:text-[#302629]'
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[0.68rem] shrink-0 font-bold">
              2
            </span>
            <span className="truncate">2. Palette & Fit</span>
          </button>

          {/* Step 3 Button */}
          <button
            role="tab"
            type="button"
            id={`${formId}-tab-3`}
            aria-selected={currentStep === 3}
            aria-controls={`${formId}-panel-3`}
            disabled={!itemType}
            onClick={() => itemType && setCurrentStep(3)}
            className={`py-3 px-2 sm:px-4 rounded-xl text-center transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 font-mono text-xs ${
              currentStep === 3
                ? 'bg-[#B94D68] text-[#FFF8F5] shadow-sm font-bold'
                : !itemType
                ? 'opacity-40 cursor-not-allowed text-[#705D62]'
                : 'text-[#705D62] hover:bg-[#F1E5E3] hover:text-[#302629]'
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[0.68rem] shrink-0 font-bold">
              3
            </span>
            <span className="truncate">3. Notes & Slip</span>
          </button>
        </div>
      </nav>

      {/* Main Stepper Panels */}
      <div className="configurator-content max-w-5xl mx-auto">
        {/* STEP 1: Select Item Type */}
        {currentStep === 1 && (
          <div
            role="tabpanel"
            id={`${formId}-panel-1`}
            aria-labelledby={`${formId}-tab-1`}
            className="step-panel animate-fadeIn"
          >
            <div className="mb-6 text-center">
              <h3
                className="text-xl sm:text-2xl font-bold text-[#302629] mb-1"
                style={{ fontFamily: "var(--font-display, 'Coustard', serif)" }}
              >
                Choose Foundation Piece
              </h3>
              <p className="text-xs sm:text-sm text-[#705D62]">
                Select the base piece you’d love Neha to craft for you.
              </p>
            </div>

            {/* 5 Selectable Item Cards */}
            <div
              role="radiogroup"
              aria-label="Select Foundation Item Type"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
            >
              {COMMISSION_ITEM_TYPES.map((type) => {
                const isSelected = itemType === type.id
                return (
                  <div
                    key={type.id}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => handleSelectItemType(type.id)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault()
                        handleSelectItemType(type.id)
                      }
                    }}
                    className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#B94D68] bg-[#FFF8F5] shadow-md ring-2 ring-[#B94D68]/20'
                        : 'border-[#302629]/15 bg-[#FFFDF9] hover:border-[#D49A72] hover:bg-[#FFF8F5]/50 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="text-3xl p-2 bg-[#F1E5E3] rounded-xl inline-block" aria-hidden="true">
                          {type.icon}
                        </span>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[0.68rem] font-mono tracking-wider px-2 py-0.5 rounded-full font-semibold uppercase bg-[#74816C]/15 text-[#74816C]">
                            ⏳ {type.leadTime}
                          </span>
                          {type.badge && (
                            <span className="text-[0.62rem] font-mono tracking-widest px-2 py-0.5 rounded-full uppercase bg-[#B94D68]/10 text-[#963B54] font-semibold">
                              {type.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      <h4
                        className="text-lg font-bold text-[#302629] mb-1.5"
                        style={{ fontFamily: "var(--font-display, 'Coustard', serif)" }}
                      >
                        {type.title}
                      </h4>
                      <p className="text-xs text-[#705D62] leading-relaxed mb-4">
                        {type.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#302629]/10 flex items-center justify-between text-xs font-mono">
                      <span className="text-[#705D62]">
                        {isSelected ? '✓ Selected' : 'Click to select'}
                      </span>
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                          isSelected
                            ? 'border-[#B94D68] bg-[#B94D68] text-white font-bold'
                            : 'border-[#302629]/30'
                        }`}
                      >
                        {isSelected ? '✓' : ''}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Step 1 Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#302629]/15">
              <button
                type="button"
                disabled={!itemType}
                onClick={() => setCurrentStep(2)}
                className={`px-6 py-3 rounded-full font-mono text-xs uppercase tracking-wider font-semibold transition-all ${
                  itemType
                    ? 'bg-[#B94D68] text-[#FFF8F5] hover:bg-[#963B54] shadow-md hover:shadow-lg'
                    : 'bg-[#302629]/15 text-[#705D62] cursor-not-allowed'
                }`}
              >
                Continue to Palette & Sizing →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Palette & Sizing & Yarn */}
        {currentStep === 2 && (
          <div
            role="tabpanel"
            id={`${formId}-panel-2`}
            aria-labelledby={`${formId}-tab-2`}
            className="step-panel animate-fadeIn"
          >
            <div className="mb-6 text-center">
              <h3
                className="text-xl sm:text-2xl font-bold text-[#302629] mb-1"
                style={{ fontFamily: "var(--font-display, 'Coustard', serif)" }}
              >
                Palette, Sizing & Yarn Preference
              </h3>
              <p className="text-xs sm:text-sm text-[#705D62]">
                Customizing {activeItemObj?.title || 'your piece'}. Pick a signature colorway or enter your dream palette.
              </p>
            </div>

            <div className="space-y-8 bg-[#FFFDF9] border border-[#302629]/15 rounded-3xl p-6 sm:p-8 shadow-sm">
              {/* Part 1: Color Palette Selection */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[#302629] font-bold mb-3">
                  1. Color Palette ({COMMISSION_PALETTES.length} Curated Options)
                </label>
                <div
                  role="radiogroup"
                  aria-label="Color Palette"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                >
                  {COMMISSION_PALETTES.map((palette) => {
                    const isSelected = paletteId === palette.id
                    return (
                      <div
                        key={palette.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onClick={() => setPaletteId(palette.id)}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault()
                            setPaletteId(palette.id)
                          }
                        }}
                        className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${
                          isSelected
                            ? 'border-[#B94D68] bg-[#FFF8F5] shadow-sm ring-1 ring-[#B94D68]'
                            : 'border-[#302629]/15 bg-white hover:border-[#D49A72]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-xs font-mono text-[#302629]">
                            {palette.title}
                          </span>
                          {palette.swatches.length > 0 ? (
                            <div className="flex items-center gap-1">
                              {palette.swatches.map((hex, idx) => (
                                <span
                                  key={idx}
                                  className="w-4 h-4 rounded-full border border-black/15 shadow-inner"
                                  style={{ backgroundColor: hex }}
                                  title={hex}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs">🎨</span>
                          )}
                        </div>
                        <p className="text-[0.72rem] text-[#705D62] leading-tight">
                          {palette.desc}
                        </p>
                      </div>
                    )
                  })}
                </div>

                {/* Custom Palette input if selected */}
                {paletteId === 'custom' && (
                  <div className="mt-4 p-4 bg-[#FFF8F5] border border-[#B94D68]/30 rounded-2xl animate-fadeIn">
                    <label
                      htmlFor={`${formId}-custom-palette`}
                      className="block text-xs font-mono uppercase tracking-wider text-[#963B54] font-semibold mb-1.5"
                    >
                      Describe your custom color vision:
                    </label>
                    <input
                      id={`${formId}-custom-palette`}
                      type="text"
                      value={customPaletteText}
                      onChange={(e) => setCustomPaletteText(e.target.value)}
                      placeholder="e.g. Sage green body with blush scallops, or vintage mustard with cream borders"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#302629]/20 rounded-xl text-xs sm:text-sm text-[#302629] focus:outline-none focus:border-[#B94D68] focus:ring-1 focus:ring-[#B94D68]"
                    />
                  </div>
                )}
              </div>

              {/* Part 2: Dynamic Sizing Selection */}
              <div className="pt-6 border-t border-[#302629]/10">
                <div className="flex items-baseline justify-between mb-3">
                  <label className="block text-xs font-mono uppercase tracking-widest text-[#302629] font-bold">
                    2. Sizing & Fit for {activeItemObj?.title || 'Item'}
                  </label>
                  <span className="text-[0.68rem] font-mono text-[#705D62]">
                    Tailored options
                  </span>
                </div>

                <div
                  role="radiogroup"
                  aria-label="Sizing Options"
                  className="flex flex-wrap gap-2.5"
                >
                  {availableSizes.map((size) => {
                    const isSelected = sizeId === size.id
                    return (
                      <button
                        key={size.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSizeId(size.id)}
                        className={`px-4 py-2.5 rounded-full font-mono text-xs transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-[#B94D68] text-white shadow-sm font-semibold'
                            : 'bg-white border border-[#302629]/20 text-[#302629] hover:border-[#B94D68] hover:bg-[#FFF8F5]'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full border ${isSelected ? 'border-white bg-white' : 'border-[#302629]/40'}`} />
                        <span>{size.label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Custom Sizing input if selected */}
                {(sizeId === 'custom' || activeSizeLabel.includes('Custom')) && (
                  <div className="mt-4 p-4 bg-[#FFF8F5] border border-[#B94D68]/30 rounded-2xl animate-fadeIn">
                    <label
                      htmlFor={`${formId}-custom-size`}
                      className="block text-xs font-mono uppercase tracking-wider text-[#963B54] font-semibold mb-1.5"
                    >
                      Enter your custom dimensions / fit specs:
                    </label>
                    <input
                      id={`${formId}-custom-size`}
                      type="text"
                      value={customSizeText}
                      onChange={(e) => setCustomSizeText(e.target.value)}
                      placeholder="e.g. Bust: 36 inches, Waist: 28 inches, Length: 20 inches"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#302629]/20 rounded-xl text-xs sm:text-sm text-[#302629] focus:outline-none focus:border-[#B94D68] focus:ring-1 focus:ring-[#B94D68]"
                    />
                  </div>
                )}
              </div>

              {/* Part 3: Yarn Material Selection */}
              <div className="pt-6 border-t border-[#302629]/10">
                <label className="block text-xs font-mono uppercase tracking-widest text-[#302629] font-bold mb-3">
                  3. Yarn Material Preference
                </label>
                <div
                  role="radiogroup"
                  aria-label="Yarn Material"
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  {COMMISSION_MATERIALS.map((mat) => {
                    const isSelected = materialId === mat.id
                    return (
                      <div
                        key={mat.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onClick={() => setMaterialId(mat.id)}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault()
                            setMaterialId(mat.id)
                          }
                        }}
                        className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${
                          isSelected
                            ? 'border-[#B94D68] bg-[#FFF8F5] shadow-sm ring-1 ring-[#B94D68]'
                            : 'border-[#302629]/15 bg-white hover:border-[#D49A72]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-xs font-mono text-[#302629]">
                            {mat.label}
                          </span>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center text-[0.65rem] ${
                              isSelected
                                ? 'border-[#B94D68] bg-[#B94D68] text-white'
                                : 'border-[#302629]/30'
                            }`}
                          >
                            {isSelected ? '✓' : ''}
                          </span>
                        </div>
                        <p className="text-[0.72rem] text-[#705D62] leading-relaxed">
                          {mat.desc}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between gap-4 pt-6 border-t border-[#302629]/15 mt-8">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-full border border-[#302629]/25 text-[#302629] font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#F1E5E3] transition-all"
              >
                ← Back to Item Type
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 rounded-full bg-[#B94D68] text-[#FFF8F5] font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#963B54] shadow-md hover:shadow-lg transition-all"
              >
                Continue to Details & Order Slip →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Special Requests, Target Date & Live Order Slip */}
        {currentStep === 3 && (
          <div
            role="tabpanel"
            id={`${formId}-panel-3`}
            aria-labelledby={`${formId}-tab-3`}
            className="step-panel animate-fadeIn"
          >
            <div className="mb-6 text-center">
              <h3
                className="text-xl sm:text-2xl font-bold text-[#302629] mb-1"
                style={{ fontFamily: "var(--font-display, 'Coustard', serif)" }}
              >
                Finishing Details & Live Order Slip
              </h3>
              <p className="text-xs sm:text-sm text-[#705D62]">
                Specify turnaround expectations, personal design notes, and review your artisan receipt ticket.
              </p>
            </div>

            {/* Dual Column Layout: Form Inputs on Left, Live Order Slip on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
              {/* Left Column: Target Date & Requests (7 cols) */}
              <div className="lg:col-span-7 space-y-6 bg-[#FFFDF9] border border-[#302629]/15 rounded-3xl p-6 sm:p-7 shadow-sm">
                {/* 1. Target Timeline Selection */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-[#302629] font-bold mb-2">
                    1. Target Completion Timeline
                  </label>
                  <p className="text-[0.72rem] text-[#705D62] mb-3">
                    Each piece is hand-crocheted slowly by Neha Jose in Mumbai. Please allow adequate time for loop-by-loop crafting.
                  </p>

                  <div className="space-y-2.5">
                    {/* Flexible / No rush */}
                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      targetTimeline === 'no-rush'
                        ? 'border-[#B94D68] bg-[#FFF8F5]'
                        : 'border-[#302629]/15 bg-white hover:border-[#D49A72]'
                    }`}>
                      <input
                        type="radio"
                        name="targetTimeline"
                        value="no-rush"
                        checked={targetTimeline === 'no-rush'}
                        onChange={() => {
                          setTargetTimeline('no-rush')
                          setDateError(null)
                        }}
                        className="mt-0.5 accent-[#B94D68]"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-[#302629] font-mono block">
                          No rush — take your time
                        </span>
                        <span className="text-[#705D62]">
                          Standard mindful craft queue without urgent deadline.
                        </span>
                      </div>
                    </label>

                    {/* Within 3-4 weeks */}
                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      targetTimeline === '3-weeks'
                        ? 'border-[#B94D68] bg-[#FFF8F5]'
                        : 'border-[#302629]/15 bg-white hover:border-[#D49A72]'
                    }`}>
                      <input
                        type="radio"
                        name="targetTimeline"
                        value="3-weeks"
                        checked={targetTimeline === '3-weeks'}
                        onChange={() => {
                          setTargetTimeline('3-weeks')
                          setDateError(null)
                        }}
                        className="mt-0.5 accent-[#B94D68]"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-[#302629] font-mono block">
                          Within 3–4 weeks
                        </span>
                        <span className="text-[#705D62]">
                          Recommended timeline for wearables, bouquets, and home accents.
                        </span>
                      </div>
                    </label>

                    {/* Specific Event Date */}
                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      targetTimeline === 'specific-date'
                        ? 'border-[#B94D68] bg-[#FFF8F5]'
                        : 'border-[#302629]/15 bg-white hover:border-[#D49A72]'
                    }`}>
                      <input
                        type="radio"
                        name="targetTimeline"
                        value="specific-date"
                        checked={targetTimeline === 'specific-date'}
                        onChange={() => setTargetTimeline('specific-date')}
                        className="mt-0.5 accent-[#B94D68]"
                      />
                      <div className="text-xs flex-1">
                        <span className="font-bold text-[#302629] font-mono block">
                          Specific Event Date (Minimum 10-day buffer)
                        </span>
                        <span className="text-[#705D62]">
                          Target delivery date for birthdays, weddings, or gifting.
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Specific Date Picker input */}
                  {targetTimeline === 'specific-date' && (
                    <div className="mt-4 p-4 bg-[#FFF8F5] border border-[#B94D68]/30 rounded-2xl animate-fadeIn">
                      <label
                        htmlFor={`${formId}-date-picker`}
                        className="block text-xs font-mono uppercase tracking-wider text-[#963B54] font-semibold mb-1.5"
                      >
                        Select your target date (min. 10 days ahead):
                      </label>
                      <input
                        id={`${formId}-date-picker`}
                        type="date"
                        min={MIN_DATE_STRING}
                        value={specificDate}
                        onChange={handleDateChange}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#302629]/20 rounded-xl text-xs sm:text-sm text-[#302629] focus:outline-none focus:border-[#B94D68]"
                      />
                      {dateError ? (
                        <p className="mt-2 text-xs font-mono text-[#B94D68] font-medium flex items-center gap-1.5" role="alert">
                          <span>⚠️</span> {dateError}
                        </p>
                      ) : (
                        <p className="mt-1.5 text-[0.7rem] font-mono text-[#74816C]">
                          ✓ 10-day slow-craft minimum buffer validated.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Special Requests & Notes Textarea */}
                <div className="pt-6 border-t border-[#302629]/10">
                  <label
                    htmlFor={`${formId}-notes`}
                    className="block text-xs font-mono uppercase tracking-widest text-[#302629] font-bold mb-1.5"
                  >
                    2. Special Requests & Custom Notes
                  </label>
                  <p className="text-[0.72rem] text-[#705D62] mb-3">
                    Add specific collar trims, scalloped edging, extra body length, handmade wooden buttons, custom gift packaging notes, or reference links.
                  </p>
                  <textarea
                    id={`${formId}-notes`}
                    rows={4}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g. Scalloped cuffs, extra 2 inches in torso length, natural wooden buttons, and gift packaging with a handwritten card..."
                    className="w-full p-3.5 bg-white border border-[#302629]/20 rounded-2xl text-xs sm:text-sm text-[#302629] focus:outline-none focus:border-[#B94D68] focus:ring-1 focus:ring-[#B94D68] resize-y"
                  />
                </div>
              </div>

              {/* Right Column: Live Order Slip Preview (5 cols) */}
              <div className="lg:col-span-5 sticky top-24">
                <div className="mb-2 text-center">
                  <span className="text-[0.68rem] font-mono uppercase tracking-widest text-[#705D62]">
                    ✦ Live Perforated Slip Preview
                  </span>
                </div>
                <OrderSlipPreview config={commissionConfig} />
              </div>
            </div>

            {/* Step 3 Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-[#FFF8F5] border border-[#302629]/15 rounded-3xl shadow-sm">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-full border border-[#302629]/25 text-[#302629] font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#F1E5E3] transition-all"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-full text-[#705D62] font-mono text-xs uppercase tracking-wider hover:text-[#B94D68] hover:bg-[#B94D68]/10 transition-all"
                >
                  Reset ↺
                </button>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleInstagramDispatch}
                  className="px-5 py-3 rounded-full border border-[#B94D68] text-[#963B54] font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#B94D68]/10 transition-all flex items-center gap-1.5"
                  title="Copy formatted slip & open Instagram DM"
                >
                  <span>{isCopied ? 'Copied!' : 'Instagram DM'}</span>
                  <span aria-hidden="true">↗</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyToContact}
                  className="px-6 py-3 rounded-full bg-[#B94D68] text-[#FFF8F5] font-mono text-xs uppercase tracking-wider font-semibold hover:bg-[#963B54] shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span>Apply to Inquiry Form</span>
                  <span aria-hidden="true">↓</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
