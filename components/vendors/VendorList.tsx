import { BOOKING_STATUS_LABEL, BOOKING_STATUS_STYLE } from "@/lib/vendorLabels";
import type { Vendor } from "@/lib/types";

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
            className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${BOOKING_STATUS_STYLE[v.bookingStatus]}`}
          >
            {BOOKING_STATUS_LABEL[v.bookingStatus]}
          </span>
        </button>
      ))}
    </div>
  );
}
