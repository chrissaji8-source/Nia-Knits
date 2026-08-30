import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const mockLikesPlugin = () => {
  const state = {
    likes: {},
    voters: {},
  }

  const handler = (req, res, next) => {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname === '/api/likes') {
      if (req.method === 'GET') {
        const visitorId = url.searchParams.get('visitorId') || ''
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          likes: state.likes,
          likedPieceIds: state.voters[visitorId] || [],
        }))
        return
      }
      if (req.method === 'POST') {
        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', () => {
          try {
            const { visitorId, pieceId, liked } = JSON.parse(body)
            const currentLikes = state.voters[visitorId] || []
            if (liked) {
              state.voters[visitorId] = [...new Set([...currentLikes, pieceId])]
              state.likes[pieceId] = (state.likes[pieceId] || 0) + 1
            } else {
              state.voters[visitorId] = currentLikes.filter((id) => id !== pieceId)
              state.likes[pieceId] = Math.max(0, (state.likes[pieceId] || 0) - 1)
            }
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              likes: state.likes,
              likedPieceIds: state.voters[visitorId] || [],
            }))
          } catch {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Invalid request' }))
          }
        })
        return
      }
    }
    next()
  }

  return {
    name: 'mock-likes-api',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), mockLikesPlugin()],
})
