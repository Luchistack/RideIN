export default function Logo({ small = false }) {
  const box = small ? 'h-7 w-7 rounded-lg' : 'h-[34px] w-[34px] rounded-[9px]'
  const icon = small ? 'h-[15px] w-[15px]' : 'h-[19px] w-[19px]'
  const text = small ? 'text-[17px]' : 'text-[22px]'

  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex flex-none items-center justify-center bg-brand ${box}`}>
        <svg viewBox="0 0 24 24" fill="none" className={icon}>
          <path
            d="M4 16.5 6.2 9c.4-1.2 1.5-2 2.8-2h6c1.3 0 2.4.8 2.8 2l2.2 7.5"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="7.5" cy="18" r="1.8" fill="#fff" />
          <circle cx="16.5" cy="18" r="1.8" fill="#fff" />
          <path d="M4 16.5h16" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <span className={`font-display font-extrabold tracking-wide ${text}`}>
        Ride<span className="text-brand">IN</span>
      </span>
    </div>
  )
}
