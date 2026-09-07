// Shared avatar: shows the account's photo if it has one, otherwise falls
// back to a colored circle with the first initial of their name — used in
// the navbar, dashboards, and profile pages so a photo (once set) shows up
// everywhere consistently.
export default function Avatar({ name = '', photo, size = 40, tone = 'brand' }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  const px = `${size}px`

  const tones = {
    brand: 'bg-brand-tint text-brand dark:bg-brand-tint-dark dark:text-brand-light',
    accent: 'bg-accent-tint text-accent-deep dark:bg-accent-tint-dark dark:text-accent-light',
  }

  if (photo) {
    return (
      <img
        src={photo}
        alt={name ? `${name}'s photo` : 'Profile photo'}
        style={{ width: px, height: px }}
        className="flex-none rounded-full border border-line object-cover dark:border-line-dark"
      />
    )
  }

  return (
    <div
      style={{ width: px, height: px, fontSize: size * 0.4 }}
      className={`flex flex-none items-center justify-center rounded-full font-bold ${tones[tone] || tones.brand}`}
    >
      {initial}
    </div>
  )
}
