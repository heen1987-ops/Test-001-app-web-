import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-200 px-6 py-12 text-center dark:border-zinc-800">
      <p className="font-medium text-zinc-700 dark:text-zinc-300">{title}</p>
      {description && <p className="max-w-sm text-sm text-zinc-400 dark:text-zinc-500">{description}</p>}
      {action}
    </div>
  );
}
