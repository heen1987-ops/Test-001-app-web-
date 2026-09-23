export function ProgressBar({ ratio, className }: { ratio: number; className?: string }) {
  const pct = Math.max(0, Math.min(1, ratio)) * 100;
  return (
    <div className={`h-2.5 w-full overflow-hidden rounded-full border border-border bg-surface-2 ${className ?? ""}`}>
      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}
