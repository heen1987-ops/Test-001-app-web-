"use client";
import { useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { QuickAddBar } from "@/components/shared/QuickAddBar";
import { ReferenceLinkSection } from "@/components/vendors/ReferenceLinkSection";
import { VendorEditorDrawer } from "@/components/vendors/VendorEditorDrawer";
import { VendorList } from "@/components/vendors/VendorList";
import { useAppData } from "@/lib/client/store";
import { addVendor } from "@/lib/services/vendors";
import type { Vendor } from "@/lib/types";

export default function VendorsPage() {
  const { data, mutate } = useAppData();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  if (!data) return <div className="py-20 text-center text-sm text-zinc-400">불러오는 중…</div>;

  const openCreate = () => {
    setEditingVendor(null);
    setDrawerOpen(true);
  };
  const openEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setDrawerOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">업체·자료</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">업체</h2>
        <QuickAddBar placeholder="업체 이름 추가 (예: OO이사)" onSubmit={(name) => mutate((d) => addVendor(d, { name }))} />
        {data.vendors.length === 0 ? (
          <EmptyState title="등록된 업체가 없습니다" description="위에서 빠르게 추가하거나 자세히 입력해보세요." />
        ) : (
          <VendorList vendors={data.vendors} onOpen={openEdit} />
        )}
        <button type="button" onClick={openCreate} className="w-fit text-sm font-medium text-indigo-600 dark:text-indigo-400">
          + 자세히 입력해서 추가
        </button>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">자료</h2>
        <ReferenceLinkSection />
      </section>

      <VendorEditorDrawer vendor={editingVendor} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
