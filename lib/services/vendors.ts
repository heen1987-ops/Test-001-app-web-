import { createVendor } from "../factories";
import type { ProjectData, Vendor } from "../types";

export function addVendor(data: ProjectData, input: Partial<Vendor> & { name: string }): ProjectData {
  return { ...data, vendors: [...data.vendors, createVendor(input)] };
}

export function updateVendor(data: ProjectData, vendorId: string, patch: Partial<Vendor>): ProjectData {
  return {
    ...data,
    vendors: data.vendors.map((v) => (v.id === vendorId ? { ...v, ...patch, updatedAt: new Date().toISOString() } : v)),
  };
}

export function deleteVendor(data: ProjectData, vendorId: string): ProjectData {
  return {
    ...data,
    vendors: data.vendors.filter((v) => v.id !== vendorId),
    costItems: data.costItems.map((item) => (item.vendorId === vendorId ? { ...item, vendorId: null } : item)),
  };
}
