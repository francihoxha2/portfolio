import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export default function CertificateDialog({ credential, returnFocusElement, onClose }) {
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    const appRoot = document.getElementById('root')
    if (!dialog) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (appRoot) appRoot.inert = true

    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')

    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      if (appRoot) appRoot.inert = false
      if (dialog.open && typeof dialog.close === 'function') dialog.close()
      returnFocusElement?.focus()
    }
  }, [returnFocusElement])

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key !== 'Tab') return

    const focusable = Array.from(
      dialogRef.current?.querySelectorAll(focusableSelector) ?? [],
    )
    if (focusable.length === 0) {
      event.preventDefault()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const asset = credential.asset
  const descriptionId = `${credential.id}-certificate-description`
  const titleId = `${credential.id}-certificate-title`

  return createPortal(
    <dialog
      className="certificate-dialog"
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="certificate-dialog__surface">
        <header className="certificate-dialog__header">
          <div>
            <p className="eyebrow">Certificate</p>
            <h2 id={titleId}>{credential.title}</h2>
            <p id={descriptionId}>
              {credential.provider} · {credential.instructors.join(', ')}
            </p>
          </div>
          <button
            className="certificate-dialog__close"
            type="button"
            aria-label="Close certificate viewer"
            onClick={onClose}
            ref={closeButtonRef}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="certificate-dialog__viewport">
          {imageFailed ? (
            <div className="certificate-dialog__fallback" role="status">
              <p>The certificate preview could not be displayed.</p>
              <p>The credential details remain available above.</p>
            </div>
          ) : (
            <img
              src={asset.src}
              alt={`Certificate for ${credential.title}, issued through ${credential.provider}`}
              width={asset.width}
              height={asset.height}
              onError={() => setImageFailed(true)}
            />
          )}
        </div>

        <footer className="certificate-dialog__footer">
          <a href={asset.src} target="_blank" rel="noreferrer">
            Open original image <span className="sr-only">(opens in a new tab)</span>
          </a>
          <span>Use normal browser zoom to inspect details.</span>
        </footer>
      </div>
    </dialog>,
    document.body,
  )
}
