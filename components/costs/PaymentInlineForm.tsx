"use client";
import { useState } from "react";
import { TaskDateSpecInput } from "@/components/schedule/TaskDateSpecInput";
import { useAppData } from "@/lib/client/store";
import type { Payment, PaymentStatus, PaymentType, TaskDateSpec } from "@/lib/types";

const TYPE_OPTIONS: [PaymentType, string][] = [
  ["deposit", "계약금"],
  ["interim", "중도금"],
  ["balance", "잔금"],
  ["refund", "환불"],
  ["other", "기타"],
];
const STATUS_OPTIONS: [PaymentStatus, string][] = [
  ["scheduled", "예정"],
  ["paid", "완료"],
  ["cancelled", "취소"],
];

interface PaymentFormState {
  type: PaymentType;
  status: PaymentStatus;
  amount: string;
  scheduledDate: TaskDateSpec;
  paidDate: string;
  method: string;
  notes: string;
}

function toFormState(payment: Payment | null): PaymentFormState {
  return {
    type: payment?.type ?? "deposit",
    status: payment?.status ?? "scheduled",
    amount: payment?.amount != null ? String(payment.amount) : "",
    scheduledDate: payment?.scheduledDate ?? { type: "unscheduled" },
    paidDate: payment?.paidDate ?? "",
    method: payment?.method ?? "",
    notes: payment?.notes ?? "",
  };
}

export function PaymentInlineForm({
  payment,
  onSubmit,
  onCancel,
}: {
  payment: Payment | null;
  onSubmit: (patch: {
    type: PaymentType;
    status: PaymentStatus;
    amount: number | null;
    sign: 1 | -1;
    scheduledDate: TaskDateSpec;
    paidDate: string | null;
    method: string | null;
    notes: string;
  }) => void;
  onCancel: () => void;
}) {
  const { data } = useAppData();
  const [form, setForm] = useState<PaymentFormState>(() => toFormState(payment));
  if (!data) return null;

  const handleSubmit = () => {
    onSubmit({
      type: form.type,
      status: form.status,
      amount: form.amount.trim() === "" ? null : Number(form.amount),
      sign: form.type === "refund" ? -1 : (payment?.sign ?? 1),
      scheduledDate: form.scheduledDate,
      paidDate: form.paidDate || null,
      method: form.method.trim() || null,
      notes: form.notes,
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/50">
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-zinc-600 dark:text-zinc-400">종류</span>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as PaymentType }))}
            className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            {TYPE_OPTIONS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-zinc-600 dark:text-zinc-400">상태</span>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as PaymentStatus }))}
            className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            {STATUS_OPTIONS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs">
        <span className="font-medium text-zinc-600 dark:text-zinc-400">금액 (미정이면 비워두세요)</span>
        <input
          type="number"
          inputMode="numeric"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>

      <TaskDateSpecInput
        label="예정일"
        value={form.scheduledDate}
        onChange={(spec) => setForm((f) => ({ ...f, scheduledDate: spec }))}
        anchors={data.project}
      />

      {form.status === "paid" && (
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-zinc-600 dark:text-zinc-400">실제 지급일</span>
          <input
            type="date"
            value={form.paidDate}
            onChange={(e) => setForm((f) => ({ ...f, paidDate: e.target.value }))}
            className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
      )}

      <label className="flex flex-col gap-1 text-xs">
        <span className="font-medium text-zinc-600 dark:text-zinc-400">지급 수단</span>
        <input
          value={form.method}
          onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
          placeholder="예: 계좌이체, 카드"
          className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
          취소
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
        >
          저장
        </button>
      </div>
    </div>
  );
}
