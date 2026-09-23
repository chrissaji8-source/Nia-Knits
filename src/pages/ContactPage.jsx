import { useState, useRef, useEffect } from 'react'

const instagramHandle = 'nia_knits_27'
const instagramProfileUrl = `https://www.instagram.com/${instagramHandle.replace(/^@/, '')}/`
const contactEmail = 'Joseneha55@gmail.com'

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle className="instagram-dot" cx="17.4" cy="6.6" r="1" />
    </svg>
  )
}

const getGmailComposeUrl = ({ subject = '', body = '' } = {}) => {
  const params = new URLSearchParams({ view: 'cm', fs: '1', to: contactEmail })
  if (subject) params.set('su', subject)
  if (body) params.set('body', body)
  return `https://mail.google.com/mail/?${params.toString()}`
}

const getMailtoUrl = ({ subject = '', body = '' } = {}) => {
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  const query = params.toString()
  return `mailto:${contactEmail}${query ? `?${query}` : ''}`
}

export default function ContactPage({
  regarding = '',
  setRegarding,
  initialMessage = '',
  regardingInputRef,
  messageTextareaRef,
}) {
  const [localRegarding, setLocalRegarding] = useState(regarding)
  const [message, setMessage] = useState(initialMessage)
  const nameInputRef = useRef(null)

  useEffect(() => {
    setLocalRegarding(regarding)
  }, [regarding])

  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage)
    }
  }, [initialMessage])

  const onContactSubmit = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const subject = `Nia Knits inquiry: ${form.get('regarding') || 'a crochet piece'}`
    const body = `Name: ${form.get('name')}\nEmail: ${form.get('email')}\n\n${form.get('message')}`
    const gmailUrl = getGmailComposeUrl({ subject, body })
    const mailtoUrl = getMailtoUrl({ subject, body })
    const composeWindow = window.open(gmailUrl, '_blank', 'noopener,noreferrer')
    if (!composeWindow) {
      window.location.href = mailtoUrl
    }
  }

  return (
    <div className="page-contact py-12 pb-24">
      <section className="contact-section section-shell" aria-labelledby="contact-title">
        <div className="contact-intro">
          <p className="eyebrow">Say hello</p>
          <h1 id="contact-title" className="font-['Coustard',serif] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--ink)] mb-4">
            Have a piece in mind?
          </h1>
          <p className="text-sm sm:text-base text-[var(--ink-soft)] leading-relaxed mb-6">
            For bespoke commissions, stockist inquiries, or a friendly question about something you spotted here, leave a note below.
          </p>

          <a
            className="instagram-card"
            href={instagramProfileUrl}
            target="_blank"
            rel="noreferrer"
          >
            <InstagramIcon />
            <span>
              <small>Follow along on Instagram</small>
              <strong>@{instagramHandle.replace(/^@/, '')}</strong>
            </span>
            <span aria-hidden="true">↗</span>
          </a>

          <div className="mt-6 p-4 rounded-2xl bg-[var(--canvas-soft)] border border-[var(--ink)]/10 text-xs font-mono space-y-1">
            <span className="text-[var(--moss)] font-bold block">📍 STUDIO LOCATION</span>
            <span className="text-[var(--ink-soft)] block">Mumbai, India · Worldwide Delivery</span>
          </div>
        </div>

        <form className="contact-form" onSubmit={onContactSubmit}>
          <div className="form-pair">
            <label>
              Name
              <input
                ref={nameInputRef}
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Your name"
              />
            </label>
            <label>
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="your@email.com"
              />
            </label>
          </div>

          <label>
            Regarding
            <input
              ref={regardingInputRef}
              name="regarding"
              type="text"
              value={localRegarding}
              onChange={(event) => {
                setLocalRegarding(event.target.value)
                setRegarding?.(event.target.value)
              }}
              placeholder="A piece, a custom commission, a question…"
            />
          </label>

          <label>
            Message
            <textarea
              ref={messageTextareaRef}
              name="message"
              rows={6}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
              placeholder="Tell me what you have in mind (sizing, colors, dates, or inspiration)."
            />
          </label>

          <div className="form-footer">
            <p>
              Messages open directly in Gmail and are addressed to <span>{contactEmail}</span>.
            </p>
            <button type="submit">
              Send a note <span aria-hidden="true">↗</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
