import type { BookingStatus } from "./types";

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  not_contacted: "연락 전",
  quote_requested: "견적 요청",
  quoted: "견적 받음",
  booked: "예약",
  confirmed: "확정",
  completed: "완료",
  cancelled: "취소",
};

export const BOOKING_STATUS_STYLE: Record<BookingStatus, string> = {
  not_contacted: "bg-surface-2 text-muted border-border",
  quote_requested: "bg-warning-bg text-warning-ink border-warning/20",
  quoted: "bg-warning-bg text-warning-ink border-warning/20",
  booked: "bg-accent-light text-accent-ink border-accent/20",
  confirmed: "bg-positive-bg text-positive-ink border-positive/20",
  completed: "bg-positive-bg text-positive-ink border-positive/20",
  cancelled: "bg-surface-2 text-subtle line-through border-border",
};
