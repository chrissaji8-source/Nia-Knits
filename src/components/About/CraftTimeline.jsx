import { useState, useRef } from 'react'
import craftStory from '../../data/craftStory.json'

function TimelineIcon({ type, className = '' }) {
  if (type === 'palette') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </svg>
    )
  }
  if (type === 'crochet-hook') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 2a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-2l-9 11a2.12 2.12 0 0 1-3-3l11-9V7a3 3 0 0 1 3-5z" />
        <path d="m14 10 4 4" />
        <circle cx="6" cy="18" r="2" />
      </svg>
    )
  }
  if (type === 'shears') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
      </svg>
    )
  }
  // tied-parcel / gift
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  )
}

/**
 * 4-Step "From Yarn to Treasure" Interactive Craft Timeline
 *
 * @param {Object} props
 * @param {number} [props.activeStep] - Controlled active step number (1-4)
 * @param {function(number): void} [props.onSelectStep] - Step selection callback
 * @param {Array} [props.steps] - Custom steps array (defaults to craftStory.timelineSteps)
 * @param {string} [props.className] - Additional wrapper class
 */
export default function CraftTimeline({
  activeStep: controlledStep,
  onSelectStep,
  steps = craftStory.timelineSteps,
  className = '',
}) {
  const [internalStep, setInternalStep] = useState(controlledStep || 1)
  const isControlled = controlledStep !== undefined
  const currentStepNum = isControlled ? controlledStep : internalStep
  const safeStep = Math.min(Math.max(1, currentStepNum || 1), steps.length)

  const tabRefs = useRef([])

  const selectStep = (stepNum) => {
    if (stepNum >= 1 && stepNum <= steps.length) {
      if (!isControlled) {
        setInternalStep(stepNum)
      }
      if (typeof onSelectStep === 'function') {
        onSelectStep(stepNum)
      }
    }
  }

  const handleKeyDown = (e, index) => {
    let targetIndex = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      targetIndex = index + 1 < steps.length ? index + 1 : 0
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      targetIndex = index - 1 >= 0 ? index - 1 : steps.length - 1
    } else if (e.key === 'Home') {
      e.preventDefault()
      targetIndex = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      targetIndex = steps.length - 1
    }

    if (targetIndex !== null) {
      const nextStepNum = steps[targetIndex].step
      selectStep(nextStepNum)
      tabRefs.current[targetIndex]?.focus()
    }
  }

  const activeStepData = steps.find((s) => s.step === safeStep) || steps[0]
  const progressPercent = ((safeStep - 1) / (steps.length - 1)) * 100

  return (
    <div
      className={`craft-timeline-container relative my-12 rounded-3xl border border-dashed border-[#302629]/20 bg-[#FFF8F5]/90 p-6 md:p-10 shadow-sm ${className}`}
      aria-label="Artisan craft timeline: From Yarn to Treasure"
    >
      {/* Decorative Washi Tape on Top Center */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#D49A72]/60 rotate-1 rounded-sm shadow-sm pointer-events-none border-l-2 border-r-2 border-dashed border-[#302629]/20"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="mb-8 text-center md:mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#B94D68]/30 bg-[#B94D68]/10 px-3.5 py-1 text-xs font-mono uppercase tracking-wider text-[#963B54] mb-3">
          <span>🧶</span>
          <span>From Yarn to Treasure</span>
        </div>
        <h3 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#302629]">
          The 4-Step Slow Craft Journey
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-sm md:text-base text-[#705D62]">
          Every loop is made deliberately by human hands in Mumbai. Follow how raw skeins transform into enduring heirlooms.
        </p>
      </div>

      {/* Stepper Tabs Bar */}
      <div className="relative mb-8">
        {/* Horizontal Progress Track for Desktop */}
        <div className="hidden md:block absolute top-7 left-12 right-12 h-1 bg-[#302629]/15 rounded-full -z-0" aria-hidden="true">
          <div
            className="h-full bg-[#B94D68] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div
          role="tablist"
          aria-label="4-step craft timeline stages"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10"
        >
          {steps.map((step, idx) => {
            const isActive = step.step === safeStep
            const isCompleted = step.step < safeStep

            return (
              <button
                key={step.step}
                ref={(el) => (tabRefs.current[idx] = el)}
                role="tab"
                id={`step-tab-${step.step}`}
                aria-selected={isActive}
                aria-controls={`step-panel-${step.step}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => selectStep(step.step)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`group flex flex-col items-center text-center p-3 rounded-2xl transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D49A72] ${
                  isActive
                    ? 'bg-[#FFFDF9] shadow-md ring-2 ring-[#B94D68] -translate-y-1'
                    : isCompleted
                    ? 'bg-[#FFFDF9]/60 hover:bg-[#FFFDF9] hover:-translate-y-0.5'
                    : 'bg-transparent hover:bg-[#FFFDF9]/40'
                }`}
              >
                {/* Node Circle */}
                <div
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-2.5 transition-all duration-300 ${
                    isActive
                      ? 'bg-[#B94D68] text-white shadow-lg shadow-[#B94D68]/30 scale-105'
                      : isCompleted
                      ? 'bg-[#74816C] text-white'
                      : 'bg-[#F1E5E3] text-[#705D62] group-hover:bg-[#E8DCD9]'
                  }`}
                >
                  <TimelineIcon type={step.icon} className="w-6 h-6" />
                </div>

                {/* Step Index & Title */}
                <span className="font-mono text-[0.65rem] uppercase tracking-widest text-[#B94D68] font-bold">
                  {`Step 0${step.step}`}
                </span>
                <span className="font-serif text-sm md:text-base font-bold text-[#302629] mt-0.5 line-clamp-1">
                  {step.title}
                </span>
                <span className="hidden md:block text-xs text-[#705D62] mt-1 line-clamp-1">
                  {step.tagline}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Step Detail Card */}
      <div
        role="tabpanel"
        id={`step-panel-${activeStepData.step}`}
        aria-labelledby={`step-tab-${activeStepData.step}`}
        className="relative overflow-hidden rounded-2xl border border-[#302629]/15 bg-[#FFFDF9] p-6 md:p-8 shadow-md transition-all duration-300"
      >
        {/* Metallic Pushpin on Top Right of Detail Card */}
        <div
          className="absolute top-4 right-4 w-4 h-4 rounded-full bg-gradient-to-br from-[#F6D8A8] via-[#D49A72] to-[#8C5E3C] shadow-[1px_2px_4px_rgba(48,38,41,0.3)] pointer-events-none"
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Info (Left 7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-[#B94D68]/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-[#963B54]">
                {`Phase 0${activeStepData.step} of 04`}
              </span>
              {activeStepData.duration && (
                <span className="inline-flex items-center rounded-md bg-[#74816C]/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-[#74816C]">
                  ⏱️ {activeStepData.duration}
                </span>
              )}
            </div>

            <div>
              <h4 className="font-serif text-xl md:text-2xl font-bold text-[#302629]">
                {activeStepData.title}
              </h4>
              <p className="font-mono text-xs text-[#B94D68] uppercase tracking-wider mt-0.5 font-semibold">
                {activeStepData.tagline}
              </p>
            </div>

            <p className="text-sm md:text-base leading-relaxed text-[#302629]/90">
              {activeStepData.description}
            </p>

            {/* Artisan Specs Tag */}
            <div className="rounded-xl border border-dashed border-[#B94D68]/30 bg-[#FFF8F5] p-3 text-xs md:text-sm text-[#705D62] font-mono">
              <span className="font-bold text-[#963B54]">Artisan Specs: </span>
              {activeStepData.specs}
            </div>
          </div>

          {/* Maker Quote Box (Right 5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full bg-[#F1E5E3]/40 rounded-xl p-5 border border-[#302629]/10 relative">
            <div className="space-y-2">
              <span className="text-3xl text-[#B94D68]/50 font-serif leading-none select-none" aria-hidden="true">
                “
              </span>
              <p className="font-serif italic text-sm md:text-base text-[#302629] leading-snug">
                {activeStepData.quote}
              </p>
              <p className="text-right font-mono text-xs text-[#705D62] tracking-wide pt-1">
                — Neha Jose, <span className="text-[#B94D68] font-semibold">Maker</span>
              </p>
            </div>

            {/* Step Navigation Controls */}
            <div className="flex items-center justify-between pt-5 mt-4 border-t border-[#302629]/10">
              <button
                type="button"
                onClick={() => selectStep(safeStep - 1)}
                disabled={safeStep === 1}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#302629]/20 font-mono text-xs text-[#302629] hover:bg-[#FFFDF9] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                aria-label="Go to previous step"
              >
                <span>‹</span>
                <span>Previous</span>
              </button>

              <span className="font-mono text-xs text-[#705D62]">
                {safeStep} / {steps.length}
              </span>

              <button
                type="button"
                onClick={() => selectStep(safeStep + 1)}
                disabled={safeStep === steps.length}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#B94D68] bg-[#B94D68] font-mono text-xs text-white hover:bg-[#963B54] disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-sm"
                aria-label="Go to next step"
              >
                <span>Next</span>
                <span>›</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
