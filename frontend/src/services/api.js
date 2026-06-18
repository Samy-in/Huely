import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://huely.onrender.com'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000,   // 2 min — first run downloads DeepFace weights (~500 MB)
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Send a Base64 image to the backend for analysis.
 * @param {string} base64 - Full data URI or raw Base64 string
 * @param {string} occasion - 'Casual' | 'Formal' | 'Party'
 * @returns {Promise<object>} Analysis result
 */
export async function analyzeImage(base64, occasion = 'Casual', genderOverride = null) {
  const body = { image: base64, occasion }
  if (genderOverride) body.gender_override = genderOverride
  const { data } = await client.post('/analyze', body)
  return data
}

/**
 * Ping the health endpoint.
 */
export async function healthCheck() {
  const { data } = await client.get('/health')
  return data
}

/**
 * Fetch only outfit suggestions for a given gender/shape/occasion.
 * Call this when the user switches occasion — no re-analysis needed.
 */
export async function getOutfits(gender, faceShape, occasion) {
  const { data } = await client.post('/outfits', {
    gender,
    face_shape: faceShape,
    occasion,
  })
  return data
}
