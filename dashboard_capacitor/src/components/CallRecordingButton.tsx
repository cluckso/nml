import { useState } from 'react'

type CallRecordingButtonProps = {
  url: string
}

/** Inline play/hide control for call recordings in the native app. */
export function CallRecordingButton({ url }: CallRecordingButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="recording-control">
      {!open ? (
        <button type="button" className="call-back-link" onClick={() => setOpen(true)}>
          ▶ Play recording
        </button>
      ) : (
        <div className="recording-player">
          <audio src={url} controls autoPlay style={{ width: '100%', maxWidth: 280, height: 36 }} />
          <button type="button" className="recording-hide" onClick={() => setOpen(false)} aria-label="Hide player">
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
