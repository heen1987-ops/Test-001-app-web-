"use client";
import { useState } from "react";
import { Drawer } from "@/components/shared/Drawer";
import { MoneyAmount } from "@/components/shared/MoneyAmount";
import { amountStillDue } from "@/lib/aggregation";
import { useAppData } from "@/lib/client/store";
import { newId } from "@/lib/id";
import { addExpenseItem, addFundItem, updateCostItem } from "@/lib/services/costItems";
import { addPayment, deletePayment, updatePayment } from "@/lib/services/payments";
import type { CostItem, CostItemStatus, Payment, Quote } from "@/lib/types";
import { PaymentInlineForm } from "./PaymentInlineForm";

const STATUS_OPTIONS: [CostItemStatus, string][] = [
  ["planned", "계획"],
  ["quoted", "견적중"],
  ["contracted", "계약완료"],
  ["in_progress", "진행중"],
  ["completed", "완료"],
  ["cancelled", "취소"],
];

interface FormState {
  name: string;
  subCategory: string;
  categoryFree: string; // expenseCategory 또는 fundCategory
  direction: "inflow" | "outflow";
  status: CostItemStatus;
  vendorId: string | null;
  estimatedAmount: string;
  confirmedAmount: string;
  notes: string;
}

function toFormState(item: CostItem | null): FormState {
  return {
    name: item?.name ?? "",
    subCategory: item?.subCategory ?? "",
    categoryFree: item ? (item.kind === "expense" ? item.expenseCategory : item.fundCategory) : "",
    direction: item?.kind === "fund" ? item.direction : "outflow",
    status: item?.status ?? "planned",
    vendorId: item?.vendorId ?? null,
    estimatedAmount: item?.estimatedAmount != null ? String(item.estimatedAmount) : "",
    confirmedAmount: item?.confirmedAmount != null ? String(item.confirmedAmount) : "",
    notes: item?.notes ?? "",
  };
}

export function CostItemEditorDrawer({
  item,
  defaultKind,
  open,
  onClose,
}: {
  item: CostItem | null;
  defaultKind: "expense" | "fund";
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Drawer open={open} onClose={onClose} title={item ? "비용 항목 수정" : defaultKind === "expense" ? "새 실비 항목" : "새 자금 항목"}>
      {/* 열릴 때마다 새로 마운트시켜 폼/견적/지급 입력 상태를 초기화한다. */}
      {open && <CostItemEditorForm key={item?.id ?? "new"} item={item} defaultKind={defaultKind} onClose={onClose} />}
    </Drawer>
  );
}

function CostItemEditorForm({
  item,
  defaultKind,
  onClose,
}: {
  item: CostItem | null;
  defaultKind: "expense" | "fund";
  onClose: () => void;
}) {
  const { data, mutate } = useAppData();
  const [form, setForm] = useState<FormState>(() => toFormState(item));
  const [addingPayment, setAddingPayment] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [newQuoteVendorId, setNewQuoteVendorId] = useState("");
  const [newQuoteAmount, setNewQuoteAmount] = useState("");

  if (!data) return null;
  const kind = item?.kind ?? defaultKind;
  const payments = item ? data.payments.filter((p) => p.costItemId === item.id) : [];
  const stillDue = item ? amountStillDue(item, data.payments) : null;

  const buildPatch = () => ({
    name: form.name.trim(),
    subCategory: form.subCategory.trim(),
    status: form.status,
    vendorId: form.vendorId,
    estimatedAmount: form.estimatedAmount.trim() === "" ? null : Number(form.estimatedAmount),
    confirmedAmount: form.confirmedAmount.trim() === "" ? null : Number(form.confirmedAmount),
    notes: form.notes,
    ...(kind === "expense" ? { expenseCategory: form.categoryFree.trim() } : { fundCategory: form.categoryFree.trim(), direction: form.direction }),
  });

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (item) {
      mutate((d) => updateCostItem(d, item.id, buildPatch() as Partial<CostItem>));
    } else if (kind === "expense") {
      mutate((d) => addExpenseItem(d, buildPatch() as Parameters<typeof addExpenseItem>[1]));
    } else {
      mutate((d) => addFundItem(d, buildPatch() as Parameters<typeof addFundItem>[1]));
    }
    onClose();
  };

  const handleAddQuote = () => {
    if (!newQuoteVendorId) return;
    const quote: Quote = {
      id: newId(),
      vendorId: newQuoteVendorId,
      amount: newQuoteAmount.trim() === "" ? null : Number(newQuoteAmount),
      receivedDate: null,
      notes: "",
      status: "pending",
    };
    if (item) {
      mutate((d) => updateCostItem(d, item.id, { quotes: [...item.quotes, quote] }));
    }
    setNewQuoteVendorId("");
    setNewQuoteAmount("");
  };

  const selectQuote = (quoteId: string) => {
    if (!item) return;
    mutate((d) =>
      updateCostItem(d, item.id, {
        selectedQuoteId: quoteId,
        quotes: item.quotes.map((q) => ({ ...q, status: q.id === quoteId ? "selected" : q.status === "selected" ? "pending" : q.status })),
      }),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-foreground">이름</span>
          <input
            autoFocus
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="예: 포장이사 업체"
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-foreground">{kind === "expense" ? "실비 분류" : "자금 분류"}</span>
            <input
              value={form.categoryFree}
              onChange={(e) => setForm((f) => ({ ...f, categoryFree: e.target.value }))}
              placeholder={kind === "expense" ? "예: 운송, 청소" : "예: 보증금, 대출"}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </label>
          {kind === "fund" ? (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold text-foreground">방향</span>
              <select
                value={form.direction}
                onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value as "inflow" | "outflow" }))}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              >
                <option value="outflow">지출 (나가는 돈)</option>
                <option value="inflow">수입 (들어오는 돈)</option>
              </select>
            </label>
          ) : (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold text-foreground">세부</span>
              <input
                value={form.subCategory}
                onChange={(e) => setForm((f) => ({ ...f, subCategory: e.target.value }))}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              />
            </label>
          )}
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-foreground">상태</span>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CostItemStatus }))}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          >
            {STATUS_OPTIONS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>

        {data.vendors.length > 0 && (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-foreground">업체</span>
            <select
              value={form.vendorId ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value || null }))}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            >
              <option value="">선택 안 함</option>
              {data.vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-foreground">예상 금액</span>
            <input
              type="number"
              inputMode="numeric"
              value={form.estimatedAmount}
              onChange={(e) => setForm((f) => ({ ...f, estimatedAmount: e.target.value }))}
              placeholder="미정이면 비워두세요"
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-foreground">확정 금액</span>
            <input
              type="number"
              inputMode="numeric"
              value={form.confirmedAmount}
              onChange={(e) => setForm((f) => ({ ...f, confirmedAmount: e.target.value }))}
              placeholder="계약 전이면 비워두세요"
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-foreground">메모</span>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={2}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
        </label>

        <button
          type="button"
          onClick={handleSave}
          disabled={!form.name.trim()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white shadow-card hover:bg-accent-ink disabled:opacity-50"
        >
          {item ? "저장" : "추가"}
        </button>

        {item && (
          <>
            <hr className="border-border" />

            {data.vendors.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-foreground">견적 비교</p>
                {item.quotes.length > 0 && (
                  <ul className="flex flex-col gap-1">
                    {item.quotes.map((q) => {
                      const vendor = data.vendors.find((v) => v.id === q.vendorId);
                      const selected = item.selectedQuoteId === q.id;
                      return (
                        <li
                          key={q.id}
                          className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-sm ${
                            selected ? "border-accent/30 bg-accent-light" : "border-border"
                          }`}
                        >
                          <span className="text-foreground">{vendor?.name ?? "알 수 없는 업체"}</span>
                          <div className="flex items-center gap-2">
                            <MoneyAmount amount={q.amount} className="text-muted" />
                            <button
                              type="button"
                              onClick={() => selectQuote(q.id)}
                              className={`text-xs font-bold ${selected ? "text-accent-ink" : "text-subtle hover:text-foreground"}`}
                            >
                              {selected ? "선택됨" : "선택"}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <div className="flex gap-2">
                  <select
                    value={newQuoteVendorId}
                    onChange={(e) => setNewQuoteVendorId(e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
                  >
                    <option value="">업체 선택</option>
                    {data.vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={newQuoteAmount}
                    onChange={(e) => setNewQuoteAmount(e.target.value)}
                    placeholder="견적액"
                    className="w-28 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
                  />
                  <button type="button" onClick={handleAddQuote} className="rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-semibold text-foreground">
                    추가
                  </button>
                </div>
              </div>
            )}

            <hr className="border-border" />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">지급내역</p>
                <p className="text-xs text-subtle">
                  남은 예상액: <MoneyAmount amount={stillDue} />
                </p>
              </div>

              {payments.map((p) => (
                <PaymentRowDisplay
                  key={p.id}
                  payment={p}
                  editing={editingPaymentId === p.id}
                  onEdit={() => setEditingPaymentId(p.id)}
                  onCancelEdit={() => setEditingPaymentId(null)}
                  onDelete={() => mutate((d) => deletePayment(d, p.id))}
                  onSave={(patch) => {
                    mutate((d) => updatePayment(d, p.id, patch));
                    setEditingPaymentId(null);
                  }}
                />
              ))}

              {addingPayment ? (
                <PaymentInlineForm
                  payment={null}
                  onCancel={() => setAddingPayment(false)}
                  onSubmit={(patch) => {
                    mutate((d) => addPayment(d, { ...patch, costItemId: item.id, idempotencyKey: newId() }));
                    setAddingPayment(false);
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingPayment(true)}
                  className="rounded-lg border border-dashed border-border px-3 py-2 text-sm font-semibold text-muted hover:border-accent hover:text-accent-ink"
                >
                  + 지급 내역 추가
                </button>
              )}
            </div>
          </>
        )}
    </div>
  );
}

function PaymentRowDisplay({
  payment,
  editing,
  onEdit,
  onCancelEdit,
  onDelete,
  onSave,
}: {
  payment: Payment;
  editing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onSave: (patch: Partial<Payment>) => void;
}) {
  if (editing) {
    return <PaymentInlineForm payment={payment} onCancel={onCancelEdit} onSubmit={onSave} />;
  }
  const TYPE_LABEL: Record<Payment["type"], string> = { deposit: "계약금", interim: "중도금", balance: "잔금", refund: "환불", other: "기타" };
  const STATUS_LABEL: Record<Payment["status"], string> = { scheduled: "예정", paid: "완료", cancelled: "취소" };
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm">
      <div className="flex flex-col">
        <span className="font-medium text-foreground">
          {TYPE_LABEL[payment.type]} · {STATUS_LABEL[payment.status]}
        </span>
        <MoneyAmount amount={payment.amount} className="text-xs text-subtle" />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onEdit} className="text-xs font-semibold text-subtle hover:text-foreground">
          수정
        </button>
        <button type="button" onClick={onDelete} className="text-xs font-semibold text-negative hover:text-negative-ink">
          삭제
        </button>
      </div>
    </div>
  );
}
