import { cn } from "@/lib/utils";
import { Check, Pause, Play, Trash2, X } from "lucide-react";
import type { ReactNode } from "react";
import {
  FileTypeIcon,
  type FileTypeIconKind,
} from "@/features/dashboard/components/FileTypeIcon/FileTypeIcon";
import styles from "./FileInfoRow.module.scss";

export type FileInfoRowFileKind = FileTypeIconKind;
export type FileInfoRowStatus = "uploading" | "complete" | "error";

export type FileInfoRowProps = {
  fileName: string;
  /** Human-readable size, e.g. `2.4 MB`. */
  sizeLabel: string;
  /** Upload progress 0–100. When omitted, the progress bar is hidden and metadata omits the percent segment. */
  progress?: number;
  status?: FileInfoRowStatus;
  paused?: boolean;
  onPauseToggle?: () => void;
  onCancel?: () => void;
  fileKind?: FileInfoRowFileKind;
  className?: string;
  /** Replace the default file icon (e.g. custom MIME artwork). */
  icon?: ReactNode;
};

function clampProgress(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
}

export function FileInfoRow({
  fileName,
  sizeLabel,
  progress,
  status = "uploading",
  paused = false,
  onPauseToggle,
  onCancel,
  fileKind = "default",
  className,
  icon,
}: FileInfoRowProps) {
  const pct =
    progress == null ? null : Math.round(clampProgress(progress));
  const metaLine =
    status === "complete"
      ? `${sizeLabel} \u2022 Uploaded`
      : pct == null
        ? sizeLabel
        : `${sizeLabel} \u2022 ${pct}%`;

  const showProgress = pct != null && status !== "complete";
  const showSuccess = status === "complete";
  const showActions = showSuccess || onPauseToggle != null || onCancel != null;

  return (
    <div className={cn(styles.root, className)}>
      <div className={styles.topRow}>
        {icon ? (
          <div className={styles.iconWrap} aria-hidden>
            {icon}
          </div>
        ) : (
          <FileTypeIcon fileName={fileName} kind={fileKind} />
        )}

        <div className={styles.textBlock}>
          <p className={styles.fileName} title={fileName}>
            {fileName}
          </p>
          <p className={styles.meta}>{metaLine}</p>
        </div>

        {showActions ? (
          <div className={styles.actions}>
            {showSuccess ? (
              <span className={styles.successIconWrap} aria-label="Uploaded">
                <Check className={styles.successIcon} aria-hidden />
              </span>
            ) : null}
            {onPauseToggle && !showSuccess ? (
              <button
                type="button"
                className={styles.actionButton}
                aria-label={paused ? "Resume" : "Pause"}
                onClick={onPauseToggle}
              >
                {paused ? (
                  <Play className={styles.actionIcon} aria-hidden />
                ) : (
                  <Pause className={styles.actionIcon} aria-hidden />
                )}
              </button>
            ) : null}
            {onCancel ? (
              <button
                type="button"
                className={styles.actionButton}
                aria-label="Remove"
                onClick={onCancel}
              >
                {showSuccess ? (
                  <Trash2 className={styles.actionIcon} aria-hidden />
                ) : (
                  <X className={styles.actionIcon} aria-hidden />
                )}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {showProgress ? (
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label={`Upload progress for ${fileName}`}
        >
          <div
            className={styles.progressFill}
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
