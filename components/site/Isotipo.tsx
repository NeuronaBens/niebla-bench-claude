/** Isotipo de Niebla: un faro con su haz. Decorativo (aria-hidden). */
export default function Isotipo({ className, conHaz = true }: { className?: string; conHaz?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      {conHaz && (
        <g fill="var(--faro)">
          <path d="M20 12.5 L0 5 L0 20 Z" opacity="0.18" />
          <path d="M20 12.5 L0 9 L0 16 Z" opacity="0.32" />
        </g>
      )}
      <path d="M15.2 10 L20 5.2 L24.8 10 Z" fill="currentColor" />
      <rect x="16.6" y="10" width="6.8" height="5" fill="var(--faro)" />
      <path d="M16 15 H24 L26 34 H14 Z" fill="currentColor" />
      <path d="M15.25 22 H24.75 L25.2 26.5 H14.8 Z" fill="var(--sodio)" />
      <rect x="10" y="34" width="20" height="2.6" rx="1" fill="currentColor" />
    </svg>
  );
}
