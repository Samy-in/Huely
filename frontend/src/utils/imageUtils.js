/**
 * Resize an image to max 1280px on the longest side,
 * then return it as a Base64 JPEG data URI.
 *
 * @param {File|Blob} file
 * @returns {Promise<string>} data URI
 */
export function fileToResizedBase64(file, maxDim = 1280) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const { width, height } = img
      const longest = Math.max(width, height)
      const scale = longest > maxDim ? maxDim / longest : 1
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(width * scale)
      canvas.height = Math.round(height * scale)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.onerror = () => reject(new Error('Failed to load image.'))
    img.src = url
  })
}

/**
 * Capture a frame from a <video> element and return it as a Base64 JPEG.
 *
 * @param {HTMLVideoElement} videoEl
 * @returns {string} data URI
 */
export function captureFrameFromVideo(videoEl) {
  const canvas = document.createElement('canvas')
  canvas.width = videoEl.videoWidth
  canvas.height = videoEl.videoHeight
  canvas.getContext('2d').drawImage(videoEl, 0, 0)
  return canvas.toDataURL('image/jpeg', 0.9)
}
