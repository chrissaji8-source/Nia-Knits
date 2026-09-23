/* oxlint-disable react/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import works from '../data/works.json'

const STORAGE_KEY = 'nia-knits-stitched-basket'

const catalogMap = new Map(works.map((item) => [item.id, item]))

/**
 * Safely parses the saved basket IDs from window.localStorage.
 * Resilient against null, corrupt JSON, SSR, or invalid data types.
 * @returns {string[]} Array of saved piece IDs.
 */
function readStoredIds() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed
        .map((entry) => (typeof entry === 'string' ? entry : entry?.id))
        .filter((id) => typeof id === 'string' && id.trim().length > 0)
    }
    return []
  } catch (err) {
    console.warn('Unable to read basket from localStorage:', err)
    return []
  }
}

/**
 * Safely persists the saved basket IDs to window.localStorage.
 * @param {string[]} ids
 */
function writeStoredIds(ids) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch (err) {
    console.warn('Unable to persist basket to localStorage:', err)
  }
}

export const BasketContext = createContext(null)

/**
 * Provider component that maintains Stitched Basket state and localStorage sync.
 */
export function BasketProvider({ children }) {
  const [savedIdsList, setSavedIdsList] = useState(readStoredIds)
  const [customItems, setCustomItems] = useState({})
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Listen for cross-tab storage changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorage = (event) => {
      if (event.key !== STORAGE_KEY) return
      try {
        if (!event.newValue) {
          setSavedIdsList([])
          return
        }
        const parsed = JSON.parse(event.newValue)
        if (Array.isArray(parsed)) {
          const ids = parsed
            .map((entry) => (typeof entry === 'string' ? entry : entry?.id))
            .filter((id) => typeof id === 'string' && id.trim().length > 0)
          setSavedIdsList(ids)
        }
      } catch (err) {
        console.warn('Failed to sync basket across tabs:', err)
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  // Derive reactive Set of saved IDs
  const savedIds = useMemo(() => {
    const set = new Set(savedIdsList)
    if (!set.includes) {
      Object.defineProperty(set, 'includes', {
        value: (id) => set.has(id),
        enumerable: false,
        writable: true,
        configurable: true,
      })
    }
    return set
  }, [savedIdsList])

  // Map saved IDs to full piece objects
  const basketItems = useMemo(() => {
    return savedIdsList
      .map((id) => {
        if (customItems[id]) return customItems[id]
        if (catalogMap.has(id)) return catalogMap.get(id)
        return {
          id,
          title: 'Handcrafted Piece',
          category: 'Handmade',
          materials: '',
          images: [],
        }
      })
      .filter(Boolean)
  }, [savedIdsList, customItems])

  // Total slow-crafting hours computed from basket items
  const totalCraftingHours = useMemo(() => {
    const sum = basketItems.reduce((acc, item) => {
      const hours = Number(item.estimatedCraftingHours) || 0
      return acc + hours
    }, 0)
    return Math.round(sum * 10) / 10
  }, [basketItems])

  const isInBasket = useCallback(
    (itemOrId) => {
      if (!itemOrId) return false
      const id = typeof itemOrId === 'string' ? itemOrId : itemOrId.id
      return savedIds.has(id)
    },
    [savedIds],
  )

  const addToBasket = useCallback((itemOrId) => {
    if (!itemOrId) return
    const id = typeof itemOrId === 'string' ? itemOrId : itemOrId.id
    if (!id) return

    if (typeof itemOrId === 'object' && itemOrId !== null) {
      setCustomItems((prev) => ({ ...prev, [id]: itemOrId }))
    }

    setSavedIdsList((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      writeStoredIds(next)
      return next
    })
  }, [])

  const removeFromBasket = useCallback((itemOrId) => {
    if (!itemOrId) return
    const id = typeof itemOrId === 'string' ? itemOrId : itemOrId.id
    if (!id) return

    setSavedIdsList((prev) => {
      if (!prev.includes(id)) return prev
      const next = prev.filter((item) => item !== id)
      writeStoredIds(next)
      return next
    })
  }, [])

  const toggleBasket = useCallback((itemOrId) => {
    if (!itemOrId) return
    const id = typeof itemOrId === 'string' ? itemOrId : itemOrId.id
    if (!id) return

    setSavedIdsList((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((item) => item !== id)
        writeStoredIds(next)
        return next
      }

      if (typeof itemOrId === 'object' && itemOrId !== null) {
        setCustomItems((c) => ({ ...c, [id]: itemOrId }))
      }
      const next = [...prev, id]
      writeStoredIds(next)
      return next
    })
  }, [])

  const clearBasket = useCallback(() => {
    setSavedIdsList([])
    writeStoredIds([])
  }, [])

  const value = useMemo(
    () => ({
      basketItems,
      savedWorks: basketItems,
      savedIds,
      savedPieceIds: savedIdsList,
      totalPieces: basketItems.length,
      addToBasket,
      removeFromBasket,
      toggleBasket,
      isInBasket,
      clearBasket,
      totalCraftingHours,
      isDrawerOpen,
      setIsDrawerOpen,
    }),
    [
      basketItems,
      savedIds,
      savedIdsList,
      addToBasket,
      removeFromBasket,
      toggleBasket,
      isInBasket,
      clearBasket,
      totalCraftingHours,
      isDrawerOpen,
      setIsDrawerOpen,
    ],
  )

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>
}

/**
 * Custom hook to consume Stitched Basket context.
 * @returns {import('./BasketContext').BasketContextType}
 */
export function useBasket() {
  const context = useContext(BasketContext)
  if (!context) {
    throw new Error('useBasket must be used within a BasketProvider')
  }
  return context
}

export default BasketContext
