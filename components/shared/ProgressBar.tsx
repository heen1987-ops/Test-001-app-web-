export function ProgressBar({ ratio, className }: { ratio: number; className?: string }) {
  const pct = Math.max(0, Math.min(1, ratio)) * 100;
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 ${className ?? ""}`}>
      <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}
