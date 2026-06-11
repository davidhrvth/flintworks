export type Currency = 'EUR' | 'HUF'

interface CurrencyToggleProps {
  currency: Currency
  onChange: (c: Currency) => void
}

export function CurrencyToggle({ currency, onChange }: CurrencyToggleProps) {
  return (
    <div
      className="inline-flex items-center rounded-full border border-border bg-surface p-0.5 text-xs font-mono font-semibold tracking-wider"
      role="group"
      aria-label="Currency"
    >
      {(['EUR', 'HUF'] as Currency[]).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`px-3 py-1 rounded-full uppercase transition-colors duration-150 ${
            currency === c
              ? 'bg-ember text-white'
              : 'text-text-muted hover:text-text-heading'
          }`}
          aria-pressed={currency === c}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
