import type { BookingStatus, Vendor } from "@/lib/types";

const STATUS_LABEL: Record<BookingStatus, string> = {
  not_contacted: "연락 전",
  quote_requested: "견적 요청",
  quoted: "견적 받음",
  booked: "예약",
  confirmed: "확정",
  completed: "완료",
  cancelled: "취소",
};

const STATUS_STYLE: Record<BookingStatus, string> = {
  not_contacted: "bg-surface-2 text-muted border-border",
  quote_requested: "bg-warning-bg text-warning-ink border-warning/20",
  quoted: "bg-warning-bg text-warning-ink border-warning/20",
  booked: "bg-accent-light text-accent-ink border-accent/20",
  confirmed: "bg-positive-bg text-positive-ink border-positive/20",
  completed: "bg-positive-bg text-positive-ink border-positive/20",
  cancelled: "bg-surface-2 text-subtle line-through border-border",
};

export function VendorList({ vendors, onOpen }: { vendors: Vendor[]; onOpen: (vendor: Vendor) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {vendors.map((v) => (
        <button
          key={v.id}
          type="button"
          onClick={() => onOpen(v)}
          className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5 text-left shadow-card transition-colors hover:border-accent/30"
        >
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">{v.name}</span>
            {v.category && <span className="text-xs text-subtle">{v.category}</span>}
          </div>
          <span
            className={`rounded-full border px-2 py-0.5 font-mono text-[11px] font-bold ${STATUS_STYLE[v.bookingStatus]}`}
          >
            {STATUS_LABEL[v.bookingStatus]}
          </span>
        </button>
      ))}
    </div>
  );
}
