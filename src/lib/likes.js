const LIKES_ENDPOINT = '/api/likes'
const VISITOR_ID_STORAGE_KEY = 'nia-knits-like-visitor-id'

const createVisitorId = () => {
  if (crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const getVisitorId = () => {
  try {
    const existingId = window.localStorage.getItem(VISITOR_ID_STORAGE_KEY)
    if (existingId) return existingId

    const visitorId = createVisitorId()
    window.localStorage.setItem(VISITOR_ID_STORAGE_KEY, visitorId)
    return visitorId
  } catch {
    return createVisitorId()
  }
}

const getPayload = async (response) => {
  if (!response.ok) throw new Error(`Like request failed with ${response.status}`)
  return response.json()
}

export const fetchLikes = (visitorId) => getPayload(fetch(
  `${LIKES_ENDPOINT}?visitorId=${encodeURIComponent(visitorId)}`,
  { cache: 'no-store' },
))

export const saveLike = (visitorId, pieceId, liked) => getPayload(fetch(LIKES_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ visitorId, pieceId, liked }),
}))
