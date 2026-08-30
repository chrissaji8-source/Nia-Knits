const LIKES_ENDPOINT = '/api/likes'
const VISITOR_ID_STORAGE_KEY = 'nia-knits-like-visitor-id'
const LOCAL_LIKES_STORAGE_KEY = 'nia-knits-local-likes'

const createVisitorId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
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

const getLocalState = () => {
  try {
    const raw = window.localStorage.getItem(LOCAL_LIKES_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { likes: {}, voters: {} }
}

const saveLocalState = (state) => {
  try {
    window.localStorage.setItem(LOCAL_LIKES_STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

const getLocalPayload = (visitorId) => {
  const state = getLocalState()
  return {
    likes: state.likes || {},
    likedPieceIds: state.voters?.[visitorId] || [],
  }
}

const updateLocalLike = (visitorId, pieceId, liked) => {
  const state = getLocalState()
  if (!state.voters) state.voters = {}
  if (!state.likes) state.likes = {}
  const currentLikes = state.voters[visitorId] || []
  if (liked) {
    state.voters[visitorId] = [...new Set([...currentLikes, pieceId])]
    state.likes[pieceId] = (state.likes[pieceId] || 0) + 1
  } else {
    state.voters[visitorId] = currentLikes.filter((id) => id !== pieceId)
    state.likes[pieceId] = Math.max(0, (state.likes[pieceId] || 0) - 1)
  }
  saveLocalState(state)
  return getLocalPayload(visitorId)
}

const getPayload = async (requestPromise) => {
  const response = await requestPromise
  if (!response.ok) throw new Error(`Like request failed with ${response.status}`)
  return response.json()
}

export const fetchLikes = async (visitorId) => {
  try {
    return await getPayload(fetch(
      `${LIKES_ENDPOINT}?visitorId=${encodeURIComponent(visitorId)}`,
      { cache: 'no-store' },
    ))
  } catch {
    return getLocalPayload(visitorId)
  }
}

export const saveLike = async (visitorId, pieceId, liked) => {
  try {
    return await getPayload(fetch(LIKES_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId, pieceId, liked }),
    }))
  } catch {
    return updateLocalLike(visitorId, pieceId, liked)
  }
}
