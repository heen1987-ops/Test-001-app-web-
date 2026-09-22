"use client";
import { useRef, useState } from "react";
import { AnchorDateChangePreviewDialog } from "@/components/schedule/AnchorDateChangePreviewDialog";
import { useAppData } from "@/lib/client/store";
import { previewAnchorChange, type AnchorChangeEffect } from "@/lib/dates";
import {
  costItemsToCSV,
  downloadTextFile,
  exportProjectJSON,
  paymentsToCSV,
  tasksToCSV,
  validateImportedProjectData,
  vendorsToCSV,
  type ImportSummary,
} from "@/lib/exportImport";
import type { ProjectData } from "@/lib/types";

export default function SettingsPage() {
  const { data, mutate, archiveCurrentProject } = useAppData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [draftMoveDate, setDraftMoveDate] = useState<string | null>(null);
  const [draftSettlementDate, setDraftSettlementDate] = useState<string | null>(null);
  const [pendingEffects, setPendingEffects] = useState<AnchorChangeEffect[] | null>(null);

  const [pendingImport, setPendingImport] = useState<{ data: ProjectData; summary: ImportSummary } | null>(null);
  const [importErrors, setImportErrors] = useState<string[] | null>(null);

  if (!data) return <div className="py-20 text-center text-sm text-zinc-400">불러오는 중…</div>;

  const moveDate = draftMoveDate ?? data.project.moveDate ?? "";
  const settlementDate = draftSettlementDate ?? data.project.settlementDate ?? "";

  const handleSaveAnchors = () => {
    const nextMove = draftMoveDate === null ? data.project.moveDate : draftMoveDate || null;
    const nextSettlement = draftSettlementDate === null ? data.project.settlementDate : draftSettlementDate || null;
    const effects = previewAnchorChange(data.project, nextMove, nextSettlement, data.tasks, data.payments);
    if (effects.length > 0) {
      setPendingEffects(effects);
    } else {
      mutate((d) => ({ ...d, project: { ...d.project, moveDate: nextMove, settlementDate: nextSettlement } }));
      setDraftMoveDate(null);
      setDraftSettlementDate(null);
    }
  };

  const confirmAnchorChange = () => {
    const nextMove = draftMoveDate === null ? data.project.moveDate : draftMoveDate || null;
    const nextSettlement = draftSettlementDate === null ? data.project.settlementDate : draftSettlementDate || null;
    mutate((d) => ({ ...d, project: { ...d.project, moveDate: nextMove, settlementDate: nextSettlement } }));
    setPendingEffects(null);
    setDraftMoveDate(null);
    setDraftSettlementDate(null);
  };

  const handleFieldSave = (patch: Partial<typeof data.project>) => {
    mutate((d) => ({ ...d, project: { ...d.project, ...patch } }));
  };

  const handleImportFile = async (file: File) => {
    setImportErrors(null);
    setPendingImport(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      setImportErrors(["JSON 파일을 읽을 수 없습니다. 형식을 확인해주세요."]);
      return;
    }
    const result = validateImportedProjectData(parsed);
    if (!result.valid) {
      setImportErrors(result.errors);
      return;
    }
    setPendingImport({ data: result.data, summary: result.summary });
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    const imported = pendingImport.data;
    mutate((d) => ({ ...imported, project: { ...imported.project, id: d.project.id } }));
    setPendingImport(null);
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">설정</h1>

      <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">기준일</h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-600 dark:text-zinc-400">이사일</span>
            <input
              type="date"
              value={moveDate}
              onChange={(e) => setDraftMoveDate(e.target.value)}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-600 dark:text-zinc-400">잔금일</span>
            <input
              type="date"
              value={settlementDate}
              onChange={(e) => setDraftSettlementDate(e.target.value)}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
        </div>
        {(draftMoveDate !== null || draftSettlementDate !== null) && (
          <button type="button" onClick={handleSaveAnchors} className="w-fit rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
            기준일 저장
          </button>
        )}
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">예산 · 자금</h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-600 dark:text-zinc-400">예산</span>
            <input
              type="number"
              defaultValue={data.project.budget ?? ""}
              onBlur={(e) => handleFieldSave({ budget: e.target.value.trim() === "" ? null : Number(e.target.value) })}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-600 dark:text-zinc-400">현재 보유 현금</span>
            <input
              type="number"
              defaultValue={data.project.startingCash ?? ""}
              onBlur={(e) => handleFieldSave({ startingCash: e.target.value.trim() === "" ? null : Number(e.target.value) })}
              placeholder="입력하면 보유 현금 전망을 계산합니다"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-600 dark:text-zinc-400">계약 형태</span>
          <input
            defaultValue={data.project.contractType ?? ""}
            onBlur={(e) => handleFieldSave({ contractType: e.target.value.trim() || null })}
            placeholder="예: 전세 / 매매 / 월세"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">데이터 내보내기 · 가져오기</h2>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadTextFile(`${data.project.name}.json`, exportProjectJSON(data), "application/json")}
            className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm dark:bg-zinc-800"
          >
            JSON 내보내기
          </button>
          <button
            type="button"
            onClick={() => downloadTextFile("할일.csv", tasksToCSV(data.tasks), "text/csv")}
            className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm dark:bg-zinc-800"
          >
            할 일 CSV
          </button>
          <button
            type="button"
            onClick={() => downloadTextFile("비용항목.csv", costItemsToCSV(data.costItems), "text/csv")}
            className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm dark:bg-zinc-800"
          >
            비용 CSV
          </button>
          <button
            type="button"
            onClick={() => downloadTextFile("지급내역.csv", paymentsToCSV(data.payments, data.costItems), "text/csv")}
            className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm dark:bg-zinc-800"
          >
            지급내역 CSV
          </button>
          <button
            type="button"
            onClick={() => downloadTextFile("업체.csv", vendorsToCSV(data.vendors), "text/csv")}
            className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm dark:bg-zinc-800"
          >
            업체 CSV
          </button>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-dashed border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400"
          >
            JSON 파일에서 가져오기
          </button>
        </div>

        {importErrors && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
            <p className="font-medium">가져오기에 실패했습니다:</p>
            <ul className="mt-1 list-disc pl-5">
              {importErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {pendingImport && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
            <p className="font-medium">
              &quot;{pendingImport.summary.projectName}&quot; 데이터로 현재 프로젝트를 덮어씁니다. 계속할까요?
            </p>
            <p className="mt-1 text-xs">
              할 일 {pendingImport.summary.taskCount}건 · 비용 {pendingImport.summary.costItemCount}건 · 지급내역{" "}
              {pendingImport.summary.paymentCount}건 · 업체 {pendingImport.summary.vendorCount}건 · 자료{" "}
              {pendingImport.summary.referenceCount}건
            </p>
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => setPendingImport(null)} className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:bg-white/50">
                취소
              </button>
              <button type="button" onClick={confirmImport} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500">
                덮어쓰기
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-white p-4 dark:border-rose-900/50 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-rose-600 dark:text-rose-400">프로젝트 보관</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          목록에서 숨깁니다. 데이터는 저장소에 남아있고 완전히 삭제되지 않습니다.
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm(`"${data.project.name}" 프로젝트를 보관할까요?`)) archiveCurrentProject();
          }}
          className="w-fit rounded-lg border border-rose-300 px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/30"
        >
          이 프로젝트 보관하기
        </button>
      </section>

      {pendingEffects && (
        <AnchorDateChangePreviewDialog effects={pendingEffects} onConfirm={confirmAnchorChange} onCancel={() => setPendingEffects(null)} />
      )}
    </div>
  );
}
