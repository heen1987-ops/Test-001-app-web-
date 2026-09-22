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
  not_contacted: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  quote_requested: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  quoted: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  booked: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  cancelled: "bg-zinc-100 text-zinc-400 line-through dark:bg-zinc-800 dark:text-zinc-500",
};

export function VendorList({ vendors, onOpen }: { vendors: Vendor[]; onOpen: (vendor: Vendor) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {vendors.map((v) => (
        <button
          key={v.id}
          type="button"
          onClick={() => onOpen(v)}
          className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-left dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{v.name}</span>
            {v.category && <span className="text-xs text-zinc-400">{v.category}</span>}
          </div>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[v.bookingStatus]}`}>{STATUS_LABEL[v.bookingStatus]}</span>
        </button>
      ))}
    </div>
  );
}
