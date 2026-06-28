interface IconProps {
  className?: string;
}

const base = "h-6 w-6";

/** Calorie log. */
export function ClipboardIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1Z" />
      <path d="M8 6H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-2" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}

/** Typical meals. */
export function UtensilsIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 3v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V3M7 12v9" />
      <path d="M17 3c-1.7 0-3 2-3 4.5S15.3 12 17 12v9" />
    </svg>
  );
}

/** Gym diary. */
export function DumbbellIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6.5 6.5 17.5 17.5M3.5 9.5l1-1M19.5 14.5l1-1" />
      <rect x="2.4" y="7.4" width="4" height="6" rx="1" transform="rotate(-45 4.4 10.4)" />
      <rect x="17.6" y="10.6" width="4" height="6" rx="1" transform="rotate(-45 19.6 13.6)" />
    </svg>
  );
}

/** Progress / weight trend. */
export function TrendingIcon({ className = base }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m3 16 5-5 4 4 8.5-8.5" />
      <path d="M16 6.5h5v5" />
    </svg>
  );
}

export function ChevronIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function DumbbellMini({ className = "h-4 w-4" }: IconProps) {
  return <DumbbellIcon className={className} />;
}
