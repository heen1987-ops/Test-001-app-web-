"use client";
import { useState, type FormEvent } from "react";
import { useAppData } from "@/lib/client/store";

const inputClass =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15";

/**
 * 첫 실행 화면. 실제 이사일·예산 등은 절대 코드에 미리 넣지 않고, 전부 사용자가 여기서 입력한다.
 * 모든 필드는 비워둔 채 만들 수 있다(나중에 설정에서 채워도 됨).
 */
export function ProjectCreateWizard() {
  const { createProject } = useAppData();
  const [name, setName] = useState("");
  const [moveDate, setMoveDate] = useState("");
  const [settlementDate, setSettlementDate] = useState("");
  const [budget, setBudget] = useState("");
  const [contractType, setContractType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createProject({
        name: name.trim() || "새 이사 프로젝트",
        moveDate: moveDate || null,
        settlementDate: settlementDate || null,
        budget: budget ? Number(budget) : null,
        contractType: contractType || null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-card-md"
      >
        <h1 className="text-lg font-extrabold tracking-tight text-foreground">새 이사 프로젝트 만들기</h1>
        <p className="mt-1 text-sm text-muted">
          아직 정하지 못한 항목은 비워두어도 됩니다. 나중에 설정에서 언제든 바꿀 수 있습니다.
        </p>

        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-foreground">프로젝트 이름</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 2026년 겨울 이사"
              className={inputClass}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold text-foreground">이사일</span>
              <input type="date" value={moveDate} onChange={(e) => setMoveDate(e.target.value)} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold text-foreground">잔금일</span>
              <input
                type="date"
                value={settlementDate}
                onChange={(e) => setSettlementDate(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-foreground">예산</span>
            <input
              type="number"
              inputMode="numeric"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="미정이면 비워두세요"
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-foreground">계약 형태</span>
            <input
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
              placeholder="예: 전세 / 매매 / 월세"
              className={inputClass}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white shadow-card transition-colors hover:bg-accent-ink disabled:opacity-50"
        >
          {submitting ? "만드는 중…" : "프로젝트 만들기"}
        </button>
      </form>
    </div>
  );
}
