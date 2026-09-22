"use client";
import { useState } from "react";
import { Drawer } from "@/components/shared/Drawer";
import { useAppData } from "@/lib/client/store";
import { addVendor, deleteVendor, updateVendor } from "@/lib/services/vendors";
import type { BookingStatus, Vendor } from "@/lib/types";

const STATUS_OPTIONS: [BookingStatus, string][] = [
  ["not_contacted", "연락 전"],
  ["quote_requested", "견적 요청"],
  ["quoted", "견적 받음"],
  ["booked", "예약"],
  ["confirmed", "확정"],
  ["completed", "완료"],
  ["cancelled", "취소"],
];

interface FormState {
  name: string;
  category: string;
  phone: string;
  email: string;
  kakaoId: string;
  bookingStatus: BookingStatus;
  notes: string;
}

function toFormState(vendor: Vendor | null): FormState {
  return {
    name: vendor?.name ?? "",
    category: vendor?.category ?? "",
    phone: vendor?.contact.phone ?? "",
    email: vendor?.contact.email ?? "",
    kakaoId: vendor?.contact.kakaoId ?? "",
    bookingStatus: vendor?.bookingStatus ?? "not_contacted",
    notes: vendor?.notes ?? "",
  };
}

export function VendorEditorDrawer({ vendor, open, onClose }: { vendor: Vendor | null; open: boolean; onClose: () => void }) {
  return (
    <Drawer open={open} onClose={onClose} title={vendor ? "업체 수정" : "새 업체"}>
      {open && <VendorEditorForm key={vendor?.id ?? "new"} vendor={vendor} onClose={onClose} />}
    </Drawer>
  );
}

function VendorEditorForm({ vendor, onClose }: { vendor: Vendor | null; onClose: () => void }) {
  const { mutate } = useAppData();
  const [form, setForm] = useState<FormState>(() => toFormState(vendor));

  const handleSave = () => {
    if (!form.name.trim()) return;
    const patch = {
      name: form.name.trim(),
      category: form.category.trim(),
      contact: { phone: form.phone || null, email: form.email || null, kakaoId: form.kakaoId || null },
      bookingStatus: form.bookingStatus,
      notes: form.notes,
    };
    if (vendor) mutate((d) => updateVendor(d, vendor.id, patch));
    else mutate((d) => addVendor(d, patch));
    onClose();
  };

  const handleDelete = () => {
    if (!vendor) return;
    mutate((d) => deleteVendor(d, vendor.id));
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">업체명</span>
          <input
            autoFocus
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">분류</span>
            <input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="예: 이사업체, 청소"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">예약 상태</span>
            <select
              value={form.bookingStatus}
              onChange={(e) => setForm((f) => ({ ...f, bookingStatus: e.target.value as BookingStatus }))}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              {STATUS_OPTIONS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">전화</span>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">이메일</span>
            <input
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">카카오톡 ID</span>
          <input
            value={form.kakaoId}
            onChange={(e) => setForm((f) => ({ ...f, kakaoId: e.target.value }))}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">메모</span>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>

        <div className="flex items-center justify-between gap-2">
          {vendor ? (
            <button type="button" onClick={handleDelete} className="rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
              삭제
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!form.name.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            저장
          </button>
        </div>
    </div>
  );
}
