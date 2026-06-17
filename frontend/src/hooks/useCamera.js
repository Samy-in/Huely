import { useRef, useState, useEffect, useCallback } from 'react'

/**
 * Hook to manage webcam stream lifecycle.
 *
 * Returns:
 *   videoRef     — attach to <video ref={videoRef}>
 *   streamActive — boolean: true when camera is running
 *   startCamera  — call to request camera access
 *   stopCamera   — call to release the stream
 *   cameraError  — string | null
 */
export function useCamera() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [streamActive, setStreamActive] = useState(false)
  const [cameraError, setCameraError] = useState(null)

  const startCamera = useCallback(async () => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setStreamActive(true)
    } catch (err) {
      setCameraError('Camera access denied or unavailable.')
      console.error(err)
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setStreamActive(false)
  }, [])

  // Clean up on unmount
  useEffect(() => () => stopCamera(), [stopCamera])

  return { videoRef, streamActive, startCamera, stopCamera, cameraError }
}
