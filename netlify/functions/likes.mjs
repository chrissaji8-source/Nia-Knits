import { getStore } from '@netlify/blobs'

const STORE_NAME = 'nia-knits-likes'
const STORE_KEY = 'likes.json'
const MAX_UPDATE_RETRIES = 8
const WORK_IDS = [
  'bouquet-placeholder-01',
  'bouquet-placeholder-02',
  'bouquet-placeholder-03',
  'wearable-placeholder-01',
  'wearable-placeholder-02',
  'wearable-placeholder-03',
  'wearable-placeholder-04',
  'home-placeholder-01',
  'home-placeholder-02',
  'home-placeholder-03',
  'small-thing-placeholder-01',
  'small-thing-placeholder-02',
  'small-thing-placeholder-03',
]
const WORK_ID_SET = new Set(WORK_IDS)

const json = (body, status = 200) => Response.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store' },
})

const createEmptyState = () => ({
  likes: Object.fromEntries(WORK_IDS.map((id) => [id, 0])),
  voters: {},
})

const isVisitorId = (value) => typeof value === 'string' && /^[A-Za-z0-9_-]{12,128}$/.test(value)

const normaliseState = (rawState) => {
  const state = createEmptyState()
  if (!rawState) return state

  try {
    const parsed = JSON.parse(rawState)
    for (const id of WORK_IDS) {
      const count = Number.parseInt(parsed.likes?.[id], 10)
      state.likes[id] = Number.isSafeInteger(count) && count > 0 ? count : 0
    }

    if (parsed.voters && typeof parsed.voters === 'object') {
      for (const [visitorId, pieces] of Object.entries(parsed.voters)) {
        if (!isVisitorId(visitorId) || !Array.isArray(pieces)) continue
        const uniquePieceIds = [...new Set(pieces.filter((id) => WORK_ID_SET.has(id)))]
        if (uniquePieceIds.length) state.voters[visitorId] = uniquePieceIds
      }
    }
  } catch {
    return state
  }

  return state
}

const toPayload = (state, visitorId) => ({
  likes: state.likes,
  likedPieceIds: state.voters[visitorId] || [],
})

const getLikes = async () => {
  const store = getStore({ name: STORE_NAME, consistency: 'strong' })
  const entry = await store.getWithMetadata(STORE_KEY, { consistency: 'strong' })
  return { store, state: normaliseState(entry?.data), etag: entry?.etag }
}

const updateLike = async ({ visitorId, pieceId, liked }) => {
  for (let attempt = 0; attempt < MAX_UPDATE_RETRIES; attempt += 1) {
    const { store, state, etag } = await getLikes()
    const currentLikes = state.voters[visitorId] || []
    const hasLiked = currentLikes.includes(pieceId)

    if (hasLiked === liked) return state

    if (liked) {
      state.voters[visitorId] = [...currentLikes, pieceId]
      state.likes[pieceId] += 1
    } else {
      const nextLikes = currentLikes.filter((id) => id !== pieceId)
      if (nextLikes.length) state.voters[visitorId] = nextLikes
      else delete state.voters[visitorId]
      state.likes[pieceId] = Math.max(0, state.likes[pieceId] - 1)
    }

    const result = await store.set(
      STORE_KEY,
      JSON.stringify(state),
      etag ? { onlyIfMatch: etag } : { onlyIfNew: true },
    )
    if (result.modified) return state
  }

  throw new Error('The like count changed too quickly. Please retry.')
}

export default async (request) => {
  const url = new URL(request.url)

  if (request.method === 'GET') {
    const visitorId = url.searchParams.get('visitorId')
    if (!isVisitorId(visitorId)) return json({ error: 'A valid visitor id is required.' }, 400)
    try {
      const { state } = await getLikes()
      return json(toPayload(state, visitorId))
    } catch (error) {
      console.error('Failed to fetch likes:', error)
      return json({ error: 'Unable to retrieve likes at this time.' }, 500)
    }
  }

  if (request.method === 'POST') {
    let payload
    try {
      payload = await request.json()
    } catch {
      return json({ error: 'The request body must be JSON.' }, 400)
    }

    const { visitorId: bodyVisitorId, pieceId, liked } = payload || {}
    if (!isVisitorId(bodyVisitorId) || !WORK_ID_SET.has(pieceId) || typeof liked !== 'boolean') {
      return json({ error: 'The like request is invalid.' }, 400)
    }

    try {
      const state = await updateLike({ visitorId: bodyVisitorId, pieceId, liked })
      return json(toPayload(state, bodyVisitorId))
    } catch (error) {
      console.error('Failed to update like:', error)
      return json({ error: 'Unable to update like at this time.' }, 500)
    }
  }

  return json({ error: 'Method not allowed.' }, 405)
}

export const config = {
  path: '/api/likes',
}
