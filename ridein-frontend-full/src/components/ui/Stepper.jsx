export default function Stepper({ steps, current }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {steps.map((step, i) => {
        const stepNum = i + 1
        const isDone = stepNum < current
        const isCurrent = stepNum === current
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-[12px] font-bold ${
                isDone
                  ? 'bg-brand text-white'
                  : isCurrent
                    ? 'border-2 border-brand text-brand dark:text-brand-light'
                    : 'border border-line text-ink-faint dark:border-line-dark dark:text-ink-faint-dark'
              }`}
            >
              {isDone ? '✓' : stepNum}
            </div>
            {stepNum < steps.length && <div className="h-px w-6 bg-line dark:bg-line-dark" />}
          </div>
        )
      })}
    </div>
  )
}
