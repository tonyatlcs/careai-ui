import type { FileInfoRowFileKind } from "@/features/dashboard/components/FileInfoRow/FileInfoRow";

export type UploadRow = {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "complete" | "error";
  paused: boolean;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) {
    return "0 B";
  }

  const k = 1024;
  const units = ["B", "KB", "MB", "GB"] as const;
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(k)),
  );
  const n = bytes / k ** i;
  const decimals = i === 0 || n >= 10 ? 0 : 1;

  return `${n.toFixed(decimals)} ${units[i]}`;
};

export const fileKindForName = (name: string): FileInfoRowFileKind => {
  const normalized = name.toLowerCase();

  if (normalized.endsWith(".pdf")) {
    return "pdf";
  }

  if (normalized.endsWith(".doc") || normalized.endsWith(".docx")) {
    return "docx";
  }

  if (
    normalized.endsWith(".jpg") ||
    normalized.endsWith(".jpeg") ||
    normalized.endsWith(".png")
  ) {
    return "image";
  }

  return "default";
};

export const fileKey = (file: File): string => {
  return `${file.name}\0${file.size}\0${file.lastModified}`;
};
