import type { LucideIcon } from "lucide-react";
import { Ellipsis, MoveDown, MoveUp } from "lucide-react";
import { Pill } from "@/components/elements/Pill/Pill";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import styles from "./InfoCard.module.scss";

type TrendDirection = "up" | "down";

export type InfoCardProps = {
  title: string;
  value: string;
  trendPercentage?: string;
  trendDirection?: TrendDirection;
  icon: LucideIcon;
  content?: ReactNode;
  onMenuClick?: () => void;
  className?: string;
};

export function InfoCard({
  title,
  value,
  trendPercentage,
  trendDirection = "down",
  icon: Icon,
  content,
  onMenuClick,
  className,
}: InfoCardProps) {
  const TrendIcon = trendDirection === "up" ? MoveUp : MoveDown;

  return (
    <article className={cn(styles.article, className)}>
      <div className={styles.body}>
        <div className={styles.header}>
          <div className={styles.headerMain}>
            <div className={styles.iconWrap}>
              <Icon className={styles.cardIcon} aria-hidden />
            </div>
            <h3 className={styles.title}>{title}</h3>
          </div>
          <button
            type="button"
            aria-label={`Open ${title} actions`}
            onClick={onMenuClick}
            className={styles.menuButton}
          >
            <Ellipsis className={styles.cardIcon} aria-hidden />
          </button>
        </div>

        <div className={styles.valueRow}>
          <p className={styles.value}>{value}</p>
          {trendPercentage ? (
            <Pill icon={TrendIcon} variant={trendDirection}>
              {trendPercentage}
            </Pill>
          ) : null}
        </div>

        {content ? <div className={styles.content}>{content}</div> : null}
      </div>
    </article>
  );
}
