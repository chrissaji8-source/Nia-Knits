/**
 * Inquiry & Deep Link Utilities for Nia Knits
 * Handles text formatting, clipboard copying, and mail/Instagram deep links.
 */

/**
 * Copies plain text to the user's clipboard using navigator.clipboard or a fallback.
 * @param {string} text - The text to copy.
 * @returns {Promise<boolean>} True if copied successfully, false otherwise.
 */
export async function copyToClipboard(text) {
  if (!text || typeof window === 'undefined') return false

  // 1. Try modern navigator.clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fall through to fallback
    }
  }

  // 2. Fallback via off-screen <textarea> and document.execCommand
  if (typeof document !== 'undefined') {
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.top = '0'
      textArea.style.left = '0'
      textArea.style.width = '2em'
      textArea.style.height = '2em'
      textArea.style.padding = '0'
      textArea.style.border = 'none'
      textArea.style.outline = 'none'
      textArea.style.boxShadow = 'none'
      textArea.style.background = 'transparent'
      textArea.style.opacity = '0'
      textArea.setAttribute('readonly', '')
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      return Boolean(successful)
    } catch {
      return false
    }
  }

  return false
}

/**
 * Copies formatted inquiry text to the clipboard and opens the maker's Instagram DM.
 * @param {string} text - Message text to copy to clipboard before opening DM.
 * @returns {Promise<boolean>}
 */
export async function openInstagramDM(text) {
  if (text) {
    await copyToClipboard(text)
  }

  const url = 'https://ig.me/m/nia_knits_27'
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return true
}

/**
 * Generates a pre-filled Gmail web compose URL.
 * Accepts either (subject, body, to) or ({ subject, body, to }).
 * @param {string|{subject?: string, body?: string, to?: string}} subjectOrOptions
 * @param {string} [maybeBody]
 * @param {string} [maybeTo]
 * @returns {string}
 */
export function createGmailComposeUrl(subjectOrOptions = '', maybeBody = '', maybeTo = 'Joseneha55@gmail.com') {
  let subject = ''
  let body = ''
  let to = 'Joseneha55@gmail.com'

  if (typeof subjectOrOptions === 'object' && subjectOrOptions !== null) {
    subject = subjectOrOptions.subject || ''
    body = subjectOrOptions.body || ''
    to = subjectOrOptions.to || (typeof maybeBody === 'string' && maybeBody.includes('@') ? maybeBody : maybeTo) || 'Joseneha55@gmail.com'
  } else {
    subject = subjectOrOptions || ''
    body = maybeBody || ''
    to = maybeTo || 'Joseneha55@gmail.com'
  }

  const su = encodeURIComponent(subject)
  const b = encodeURIComponent(body)
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${b}`
}

/**
 * Generates a fallback mailto: URL for desktop email clients.
 * Accepts either (subject, body, to) or ({ subject, body, to }).
 * @param {string|{subject?: string, body?: string, to?: string}} subjectOrOptions
 * @param {string} [maybeBody]
 * @param {string} [maybeTo]
 * @returns {string}
 */
export function createMailtoUrl(subjectOrOptions = '', maybeBody = '', maybeTo = 'Joseneha55@gmail.com') {
  let subject = ''
  let body = ''
  let to = 'Joseneha55@gmail.com'

  if (typeof subjectOrOptions === 'object' && subjectOrOptions !== null) {
    subject = subjectOrOptions.subject || ''
    body = subjectOrOptions.body || ''
    to = subjectOrOptions.to || (typeof maybeBody === 'string' && maybeBody.includes('@') ? maybeBody : maybeTo) || 'Joseneha55@gmail.com'
  } else {
    subject = subjectOrOptions || ''
    body = maybeBody || ''
    to = maybeTo || 'Joseneha55@gmail.com'
  }

  const params = []
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`)
  if (body) params.push(`body=${encodeURIComponent(body)}`)
  const query = params.length > 0 ? `?${params.join('&')}` : ''

  return `mailto:${to}${query}`
}

/**
 * Formats a clean inquiry text for a single handcrafted piece.
 * @param {Object} item - The piece item object.
 * @returns {string}
 */
export function formatSinglePieceInquiry(item) {
  if (!item) return ''
  const title = item.title || 'Handcrafted Piece'
  const category = item.category ? ` (${item.category})` : ''
  const materials = item.materials ? ` — ${item.materials}` : ''
  const hours = item.estimatedCraftingHours != null ? ` (~${item.estimatedCraftingHours} hrs)` : ''
  return `Hi Neha! 🌸 I visited Nia Knits and fell in love with this piece:\n\n• ${title}${category}${materials}${hours}\n\nIs this currently open for orders, and could you share pricing and turnaround times? Thank you! ✨`
}

/**
 * Formats a multi-item inquiry summarizing all items in the Stitched Basket.
 * @param {Array<Object>} items - Array of basket piece items.
 * @param {number} [totalHours] - Optional precalculated crafting hours.
 * @returns {string}
 */
export function formatMultiItemInquiry(items = [], totalHours) {
  if (!items || items.length === 0) {
    return 'Hi Neha! 🌸 I visited Nia Knits and would love to inquire about your handcrafted collection.'
  }

  if (items.length === 1) {
    return formatSinglePieceInquiry(items[0])
  }

  const calculatedHours = typeof totalHours === 'number' && totalHours > 0
    ? totalHours
    : items.reduce((sum, it) => sum + (Number(it.estimatedCraftingHours) || 0), 0)

  const count = items.length

  const itemList = items
    .map((item, idx) => {
      const title = item.title || 'Handcrafted Piece'
      const cat = item.category ? ` (${item.category})` : ''
      const mat = item.materials ? ` — ${item.materials}` : ''
      const hrs = item.estimatedCraftingHours != null ? ` (~${item.estimatedCraftingHours} hrs)` : ''
      return `${idx + 1}. ${title}${cat}${mat}${hrs}`
    })
    .join('\n')

  const hoursNote = calculatedHours > 0 ? ` (~${calculatedHours} slow-crafting hours)` : ''

  return `Hi Neha! 🌸 I visited Nia Knits and fell in love with these pieces in my Stitched Basket:\n\n${itemList}\n\nTotal: ${count} pieces${hoursNote}\n\nAre these currently open for orders, and could you share pricing and turnaround times? Thank you! ✨`
}

/**
 * Formats a structured Custom Commission order slip into inquiry text.
 * @param {Object} config - Custom commission configurator state.
 * @returns {string}
 */
export function formatCustomCommissionInquiry(config = {}) {
  const itemType = config.itemTitle || config.itemType || 'Custom Piece'
  const size = config.customSizeText || config.sizeLabel || config.size || 'Standard'
  const palette = config.customPaletteText || config.paletteTitle || config.palette || 'Artist Choice'
  const material = config.materialLabel || config.material || config.yarnMaterial || '100% Breathable Cotton'
  const targetDate = config.targetDateValue || config.targetTimeline || config.targetDate || 'Flexible / No rush'
  const notes = config.specialRequests || config.notes || 'None'
  const estHours = config.estimatedHours ? `\n• Est. Crafting:   ${config.estimatedHours}` : ''

  return `🧶 CUSTOM COMMISSION REQUEST — ORDER SUMMARY\n` +
    `────────────────────────────────────────────────\n` +
    `• Item Type:       ${itemType}\n` +
    `• Size / Specs:    ${size}\n` +
    `• Color Palette:   ${palette}\n` +
    `• Yarn Material:   ${material}\n` +
    `• Target Date:     ${targetDate}${estHours}\n` +
    `• Special Requests: ${notes}\n` +
    `────────────────────────────────────────────────\n` +
    `Hi Neha! I customized this piece using your website configurator and would love to commission it. Please let me know your slot availability and price estimate!`
}
