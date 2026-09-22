import { createReferenceLink } from "../factories";
import type { ProjectData, ReferenceLink } from "../types";

export function addReferenceLink(data: ProjectData, input: Partial<ReferenceLink> & { title: string; url: string }): ProjectData {
  return { ...data, references: [...data.references, createReferenceLink(input)] };
}

export function updateReferenceLink(data: ProjectData, id: string, patch: Partial<ReferenceLink>): ProjectData {
  return {
    ...data,
    references: data.references.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r)),
  };
}

export function deleteReferenceLink(data: ProjectData, id: string): ProjectData {
  return { ...data, references: data.references.filter((r) => r.id !== id) };
}
