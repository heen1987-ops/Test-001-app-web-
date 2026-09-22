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
        <p className="text-sm text-zinc-400">등록된 자료 링크가 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {data.references.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
            >
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="truncate text-indigo-600 hover:underline dark:text-indigo-400">
                {r.title}
              </a>
              <button
                type="button"
                onClick={() => mutate((d) => deleteReferenceLink(d, r.id))}
                className="text-xs text-zinc-400 hover:text-rose-500"
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
          className="w-32 rounded-lg border border-zinc-200 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="flex-1 rounded-lg border border-zinc-200 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button type="submit" className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm dark:bg-zinc-800">
          추가
        </button>
      </form>
    </div>
  );
}
