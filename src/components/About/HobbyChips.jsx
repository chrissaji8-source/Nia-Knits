import { useState } from 'react'
import craftStory from '../../data/craftStory.json'

/**
 * Interactive Maker Hobby Chips
 *
 * @param {Object} props
 * @param {string|null} [props.activeHobby] - Controlled active hobby ID
 * @param {function(string): void} [props.onToggleHobby] - Callback when a hobby is toggled
 * @param {Array} [props.hobbies] - Custom hobbies array (defaults to craftStory.hobbyChips)
 * @param {string} [props.className] - Optional container class name
 */
export default function HobbyChips({
  activeHobby: controlledHobby,
  onToggleHobby,
  hobbies = craftStory.hobbyChips,
  className = '',
}) {
  const [internalHobby, setInternalHobby] = useState(controlledHobby ?? null)
  const isControlled = controlledHobby !== undefined
  const activeHobbyId = isControlled ? controlledHobby : internalHobby

  const handleToggle = (hobbyId) => {
    const nextHobbyId = activeHobbyId === hobbyId ? null : hobbyId
    if (!isControlled) {
      setInternalHobby(nextHobbyId)
    }
    if (typeof onToggleHobby === 'function') {
      onToggleHobby(hobbyId)
    }
  }

  const activeHobbyData = hobbies.find((h) => h.id === activeHobbyId)

  // Map CSS token / hex for accent highlights
  const getHobbyColor = (hobby) => {
    switch (hobby.id) {
      case 'crochet':
        return { text: '#B94D68', bg: 'rgba(185, 77, 104, 0.12)', border: '#B94D68' }
      case 'guitar':
        return { text: '#D49A72', bg: 'rgba(212, 154, 114, 0.15)', border: '#D49A72' }
      case 'cooking':
        return { text: '#74816C', bg: 'rgba(116, 129, 108, 0.15)', border: '#74816C' }
      case 'sewing':
        return { text: '#806174', bg: 'rgba(128, 97, 116, 0.15)', border: '#806174' }
      case 'singing':
        return { text: '#963B54', bg: 'rgba(150, 59, 84, 0.15)', border: '#963B54' }
      default:
        return { text: '#B94D68', bg: 'rgba(185, 77, 104, 0.12)', border: '#B94D68' }
    }
  }

  return (
    <div className={`hobby-chips-section relative space-y-4 ${className}`} aria-label="Neha's maker hobbies">
      {/* Eyebrow Label */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs uppercase tracking-widest text-[#705D62] font-semibold">
          Tap a hobby to peek into Neha&apos;s studio journal:
        </span>
      </div>

      {/* Chip Buttons List */}
      <div className="flex flex-wrap items-center gap-2.5" role="toolbar" aria-label="Maker hobbies filter">
        {hobbies.map((hobby) => {
          const isActive = activeHobbyId === hobby.id
          const colors = getHobbyColor(hobby)

          return (
            <button
              key={hobby.id}
              type="button"
              aria-pressed={isActive ? 'true' : 'false'}
              aria-label={`Read about Neha's hobby: ${hobby.name}`}
              onClick={() => handleToggle(hobby.id)}
              style={
                isActive
                  ? {
                      backgroundColor: colors.border,
                      borderColor: colors.border,
                      color: '#FFFDF9',
                    }
                  : undefined
              }
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono text-xs md:text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D49A72] ${
                isActive
                  ? 'shadow-md scale-105'
                  : 'bg-[#FFF8F5]/80 hover:bg-[#FFFDF9] text-[#302629] border border-[#302629]/20 hover:border-[#B94D68]/40'
              }`}
            >
              <span className="text-base select-none" aria-hidden="true">
                {hobby.emoji}
              </span>
              <span>{hobby.name}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5 animate-pulse" aria-hidden="true" />
              )}
            </button>
          )
        })}
      </div>

      {/* Expanded Callout Polaroid Note */}
      {activeHobbyData && (
        <div
          role="region"
          aria-live="polite"
          className="relative mt-4 overflow-hidden rounded-2xl border border-[#302629]/15 bg-[#FFFDF9] p-5 md:p-6 shadow-md transition-all duration-300 animate-fadeIn"
        >
          {/* Decorative Washi Tape at corner */}
          <div
            className="absolute -top-2 left-6 w-20 h-5 rotate-[-2deg] rounded-sm pointer-events-none opacity-80 border-l border-r border-dashed border-[#302629]/20"
            style={{ backgroundColor: activeHobbyData.hex || '#B94D68' }}
            aria-hidden="true"
          />

          {/* Close button */}
          <button
            type="button"
            onClick={() => handleToggle(activeHobbyData.id)}
            aria-label="Close hobby note"
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-[#705D62] hover:text-[#302629] hover:bg-[#F1E5E3] transition-colors"
          >
            <span aria-hidden="true" className="text-lg leading-none">×</span>
          </button>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl select-none" aria-hidden="true">
                {activeHobbyData.emoji}
              </span>
              <div>
                <h4 className="font-serif text-lg font-bold text-[#302629]">
                  {activeHobbyData.name}
                </h4>
                {activeHobbyData.tagline && (
                  <p className="font-mono text-xs text-[#705D62]">
                    {activeHobbyData.tagline}
                  </p>
                )}
              </div>
            </div>

            <p className="font-serif italic text-sm md:text-base leading-relaxed text-[#302629] bg-[#FFF8F5] p-3 rounded-xl border border-dashed border-[#302629]/10">
              &ldquo;{activeHobbyData.anecdote}&rdquo;
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D49A72]/15 px-3 py-1 text-[#302629] font-medium border border-[#D49A72]/30">
                <span>✨</span>
                <span>{activeHobbyData.fact}</span>
              </span>

              {activeHobbyData.connection && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#74816C]/10 px-3 py-1 text-[#74816C] border border-[#74816C]/20">
                  <span>🧶</span>
                  <span>{activeHobbyData.connection}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
