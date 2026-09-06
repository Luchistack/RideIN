export default function FareLine({ label, value, good = false }) {
  return (
    <div className="mb-1.5 flex justify-between text-[13px] last:mb-0">
      <span className="text-ink-soft dark:text-ink-soft-dark">{label}</span>
      <span className={`font-mono font-medium ${good ? 'text-good dark:text-good-dark' : ''}`}>{value}</span>
    </div>
  )
}
