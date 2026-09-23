export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16" role="status" aria-live="polite">
      <div className="calendly-spinner" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
