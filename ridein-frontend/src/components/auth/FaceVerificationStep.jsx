import { useEffect, useRef, useState } from 'react'

// Captures a selfie via the device camera and runs a fake "verifying…" delay
// before marking the rider verified. This is a UI placeholder, not real face
// verification — there's no matching against an ID photo, no liveness check,
// nothing sent anywhere. Before launch, swap this for a real identity
// verification provider (Smile ID and Youverify both cover Nigerian BVN +
// facial verification) and call their API from your backend, not the browser.
export default function FaceVerificationStep({ onVerified }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle -> camera -> captured -> verifying -> done
  const [cameraError, setCameraError] = useState(null)
  const [snapshot, setSnapshot] = useState(null)

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  async function startCamera() {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setStatus('camera')
    } catch (err) {
      setCameraError(err.message || 'Camera access was denied.')
    }
  }

  function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    setSnapshot(canvas.toDataURL('image/png'))
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setStatus('captured')
  }

  function submitForVerification() {
    setStatus('verifying')
    setTimeout(() => {
      setStatus('done')
      onVerified(true, snapshot)
    }, 1600)
  }

  function retake() {
    setSnapshot(null)
    startCamera()
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 dark:border-line-dark dark:bg-surface-dark">
      <h3 className="mb-1.5 text-lg font-bold normal-case">Face verification</h3>
      <p className="mb-4 text-[13.5px] text-ink-soft dark:text-ink-soft-dark">
        Take a clear selfie so passengers and estate management can confirm it's really you.
      </p>

      <div className="mx-auto mb-4 flex h-52 w-52 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-line bg-surface-2 dark:border-line-dark dark:bg-surface-2-dark">
        {status === 'idle' && <span className="text-4xl">🤳</span>}
        {status === 'camera' && <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />}
        {(status === 'captured' || status === 'verifying' || status === 'done') && snapshot && (
          <img src={snapshot} alt="Captured selfie" className="h-full w-full object-cover" />
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />

      {cameraError && (
        <p className="mb-3 text-center text-[12.5px] font-medium text-danger dark:text-danger-dark">{cameraError}</p>
      )}

      <div className="flex flex-col items-center gap-2.5">
        {status === 'idle' && (
          <button
            type="button"
            onClick={startCamera}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-deep"
          >
            Turn on camera
          </button>
        )}
        {status === 'camera' && (
          <button
            type="button"
            onClick={capture}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-deep"
          >
            Capture photo
          </button>
        )}
        {status === 'captured' && (
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={retake}
              className="rounded-full border border-line px-4 py-2.5 text-sm font-bold hover:border-ink-faint dark:border-line-dark dark:hover:border-ink-faint-dark"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={submitForVerification}
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-deep"
            >
              Use this photo
            </button>
          </div>
        )}
        {status === 'verifying' && (
          <p className="text-sm font-semibold text-ink-soft dark:text-ink-soft-dark">Verifying…</p>
        )}
        {status === 'done' && (
          <p className="text-sm font-bold text-good dark:text-good-dark">✓ Photo captured</p>
        )}

        {cameraError && (
          <button
            type="button"
            onClick={() => {
              setSnapshot(null)
              setStatus('done')
              onVerified(true, null)
            }}
            className="text-[12px] font-semibold text-ink-faint underline hover:text-ink-soft dark:text-ink-faint-dark dark:hover:text-ink-soft-dark"
          >
            Continue without a photo for now
          </button>
        )}
      </div>
    </div>
  )
}
