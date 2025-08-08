'use client';

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string; // applied to label (wrapper)
  inputClassName?: string; // applied to input
  size?: number; // square size in px
  disabled?: boolean;
  ariaLabel?: string;
}

export function Checkbox({
  checked = false,
  onChange,
  className = '',
  inputClassName = '',
  size = 15,
  disabled = false,
  ariaLabel,
}: CheckboxProps) {
  const tickWidth = Math.round((size * 10) / 15);
  const tickHeight = Math.round((size * 8) / 15);

  return (
    <label
      className={`relative inline-flex cursor-pointer items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange?.(e.target.checked)}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`peer appearance-none border-2 border-[#1D1D1F]/20 checked:border-[#9747FF] checked:bg-[#9747FF] ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        } ${inputClassName}`}
        style={{ width: size, height: size }}
      />
      <svg
        viewBox="0 0 12 10"
        className="pointer-events-none absolute left-1/2 top-1/2 mt-px -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100"
        width={tickWidth}
        height={tickHeight}
      >
        <path
          d="M10.3 1.3L4.5 7.1 1.7 4.3"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </label>
  );
}

export default Checkbox;
