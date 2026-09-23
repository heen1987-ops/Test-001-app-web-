"use client";
import { useState, type FormEvent } from "react";
import { useAppData } from "@/lib/client/store";
import { addReferenceLink, deleteReferenceLink } from "@/lib/services/references";

export function ReferenceLinkSection() {
  const { data, mutate } = useAppData();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  if (!data) return null;

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    mutate((d) => addReferenceLink(d, { title: title.trim(), url: url.trim() }));
    setTitle("");
    setUrl("");
  };

  return (
    <div className="flex flex-col gap-2">
      {data.references.length === 0 ? (
        <p className="text-sm text-subtle">등록된 자료 링크가 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {data.references.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm shadow-card"
            >
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="truncate font-semibold text-accent-ink hover:underline">
                {r.title}
              </a>
              <button
                type="button"
                onClick={() => mutate((d) => deleteReferenceLink(d, r.id))}
                className="text-xs font-semibold text-subtle hover:text-negative"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          className="w-32 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="flex-1 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
        />
        <button type="submit" className="rounded-lg bg-surface-2 px-3 py-1.5 text-sm font-semibold text-foreground">
          추가
        </button>
      </form>
    </div>
  );
}
