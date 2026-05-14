import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import styles from "./Pill.module.scss";

export type PillVariant = "up" | "down" | "neutral" | "warning";

export type PillProps = {
  children: ReactNode;
  icon?: LucideIcon;
  variant?: PillVariant;
  className?: string;
};

export function Pill({
  children,
  icon: Icon,
  variant = "down",
  className,
}: PillProps) {
  return (
    <span className={cn(styles.pill, styles[variant], className)}>
      {Icon ? <Icon className={styles.icon} aria-hidden /> : null}
      {children}
    </span>
  );
}
