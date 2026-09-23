import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export const RouterContext = createContext({
  currentPath: '/',
  navigate: () => {},
})

export function useRouter() {
  return useContext(RouterContext)
}

function normalizePath(rawPath) {
  if (!rawPath) return '/'
  const clean = rawPath.split('?')[0].split('#')[0] || '/'
  return clean.startsWith('/') ? clean : `/${clean}`
}

export function RouterProvider({ children }) {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window === 'undefined') return '/'
    return normalizePath(window.location.pathname) || '/'
  })

  useEffect(() => {
    const handlePopState = () => {
      const path = normalizePath(window.location.pathname)
      setCurrentPath(path)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((toPath, options = {}) => {
    if (typeof window === 'undefined') return
    const normalized = normalizePath(toPath)
    if (window.location.pathname !== normalized) {
      window.history.pushState({}, '', toPath)
      setCurrentPath(normalized)
    }
    if (!options.keepScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}
