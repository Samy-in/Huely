import { useState, useCallback } from 'react'
import { analyzeImage } from '../services/api'

/**
 * Hook to manage the image analysis request lifecycle.
 *
 * Returns:
 *   analyze(base64, occasion) — trigger analysis
 *   result                    — response object | null
 *   loading                   — boolean
 *   error                     — string | null
 *   reset                     — clear result + error
 */
export function useAnalysis() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyze = useCallback(async (base64, occasion = 'Casual') => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await analyzeImage(base64, occasion)
      setResult(data)
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Analysis failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { analyze, result, loading, error, reset }
}
