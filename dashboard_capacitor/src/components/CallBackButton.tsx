import { toTelHref } from '../lib/phone'

type Props = {
  phone?: string | null
  label?: string
}

/** Opens the native dialer for a lead callback number. */
export function CallBackButton({ phone, label = 'Call back' }: Props) {
  const telHref = toTelHref(phone)
  if (!telHref) return null

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Capacitor WebView routes tel: to the native dialer
    window.location.href = telHref
  }

  return (
    <button type="button" className="call-back-link" onClick={onClick} aria-label={label}>
      📞 {label}
    </button>
  )
}
