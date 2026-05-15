import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  clearCompletedDocumentNotifications,
  dismissCompletedDocumentNotification,
} from "@/features/documents/documentsSlice";
import { formatDocumentsQueueBadgeCount } from "@/features/documents/pages/ViewDocumentPage/hooks/documentsQueuePolling";
import type { AppDispatch, RootState } from "@/store";
import { Bell, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import styles from "./NotificationsBell.module.scss";

export function NotificationsBell() {
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector(
    (state: RootState) => state.documents.completedDocumentNotifications,
  );
  const count = notifications.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className={styles.trigger}
          aria-label="Completed document notifications"
        >
          <Bell aria-hidden className={styles.triggerIcon} />
          {count > 0 ? (
            <span className={styles.countBadge} aria-hidden>
              {formatDocumentsQueueBadgeCount(count)}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className={styles.popoverContent}>
        <div className={styles.header}>
          <p className={styles.title}>Completed</p>
          {count > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className={styles.clearButton}
              onClick={() => dispatch(clearCompletedDocumentNotifications())}
            >
              Clear all
            </Button>
          ) : null}
        </div>
        <Separator />
        {count === 0 ? (
          <p className={styles.emptyMessage}>
            When documents finish processing, they will appear here.
          </p>
        ) : (
          <ul className={styles.list}>
            {notifications.map((item) => (
              <li key={item.id} className={styles.item}>
                <Link
                  to={`/documents/${item.id}`}
                  className={styles.itemLink}
                  title={item.name}
                >
                  <span className={styles.itemName}>{item.name}</span>
                </Link>
                <div className={styles.itemActions}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className={styles.dismissButton}
                    aria-label={`Dismiss notification for ${item.name}`}
                    onClick={() =>
                      dispatch(dismissCompletedDocumentNotification(item.id))
                    }
                  >
                    <X className={styles.dismissIcon} aria-hidden />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
