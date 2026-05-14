import { cn } from "@/lib/utils";
import styles from "./FileTypeIcon.module.scss";

export type FileTypeIconKind = "pdf" | "docx" | "image" | "default";
export type FileTypeIconSize = "md" | "lg";

type FileTypeIconProps = {
  fileName?: string;
  kind?: FileTypeIconKind;
  size?: FileTypeIconSize;
  className?: string;
};

function labelForFile(fileName: string | undefined, kind: FileTypeIconKind) {
  const extension = fileName?.split(".").pop()?.trim();

  if (extension && extension !== fileName) {
    return extension.slice(0, 4).toUpperCase();
  }

  if (kind === "image") {
    return "IMG";
  }

  if (kind === "docx") {
    return "DOC";
  }

  if (kind === "pdf") {
    return "PDF";
  }

  return "FILE";
}

export function FileTypeIcon({
  fileName,
  kind = "default",
  size = "md",
  className,
}: FileTypeIconProps) {
  return (
    <span
      className={cn(
        styles.root,
        styles[kind],
        size === "lg" && styles.large,
        className,
      )}
      aria-hidden="true"
    >
      <span className={styles.document}>
        <svg
          className={styles.glyph}
          fill="none"
          viewBox="0 0 28 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className={styles.page}
            d="M5 2.5h12.5L25.5 10.5V27A2.5 2.5 0 0 1 23 29.5H5A2.5 2.5 0 0 1 2.5 27V5A2.5 2.5 0 0 1 5 2.5Z"
          />
          <path
            className={styles.fold}
            d="M17.5 3V10.5H25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className={styles.label}>{labelForFile(fileName, kind)}</span>
      </span>
    </span>
  );
}
