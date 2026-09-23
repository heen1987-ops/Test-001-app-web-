"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useAppData } from "@/lib/client/store";
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_STYLE } from "@/lib/vendorLabels";

const MAX_ROWS = 5;

/** 최근에 업데이트된 업체를 예약 상태와 함께 보여준다 — 홈 화면 전용, 자세한 관리는 업체·자료 화면에서. */
export function VendorStatusWidget() {
  const { data } = useAppData();

  const vendors = useMemo(() => {
    if (!data) return [];
    return [...data.vendors].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, MAX_ROWS);
  }, [data]);

  if (!data) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[15px] font-extrabold tracking-tight text-foreground">업체·예약 현황</h2>
        <Link href="/vendors" className="text-xs font-semibold text-accent-ink hover:underline">
          전체 보기 →
        </Link>
      </div>
      {vendors.length === 0 ? (
        <p className="py-6 text-center text-sm text-subtle">등록된 업체가 없습니다.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-0.5 border-t border-border pt-2">
          {vendors.map((v) => (
            <li key={v.id} className="flex items-center gap-2.5 rounded-lg px-1 py-2 text-sm">
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">{v.name}</span>
              {v.category && <span className="flex-none text-xs text-subtle">{v.category}</span>}
              <span
                className={`flex-none rounded-full border px-2 py-0.5 text-[11px] font-bold ${BOOKING_STATUS_STYLE[v.bookingStatus]}`}
              >
                {BOOKING_STATUS_LABEL[v.bookingStatus]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
