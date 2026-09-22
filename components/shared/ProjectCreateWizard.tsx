"use client";
import { useState, type FormEvent } from "react";
import { useAppData } from "@/lib/client/store";

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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">새 이사 프로젝트 만들기</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          아직 정하지 못한 항목은 비워두어도 됩니다. 나중에 설정에서 언제든 바꿀 수 있습니다.
        </p>

        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">프로젝트 이름</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 2026년 겨울 이사"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">이사일</span>
              <input
                type="date"
                value={moveDate}
                onChange={(e) => setMoveDate(e.target.value)}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">잔금일</span>
              <input
                type="date"
                value={settlementDate}
                onChange={(e) => setSettlementDate(e.target.value)}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">예산</span>
            <input
              type="number"
              inputMode="numeric"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="미정이면 비워두세요"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">계약 형태</span>
            <input
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
              placeholder="예: 전세 / 매매 / 월세"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {submitting ? "만드는 중…" : "프로젝트 만들기"}
        </button>
      </form>
    </div>
  );
}
