import logo from '../assets/logo.png'

export function AppLogo({ size = 32 }: { size?: number }) {
  return (
    <img
      src={logo}
      alt=""
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.18),
        display: 'block',
        objectFit: 'cover',
      }}
    />
  )
}
