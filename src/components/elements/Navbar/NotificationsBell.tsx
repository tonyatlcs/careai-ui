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
import bellStyles from "./NotificationsBell.module.scss";

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
          className="relative shrink-0"
          aria-label="Completed document notifications"
        >
          <Bell aria-hidden className="size-4" />
          {count > 0 ? (
            <span
              className={`pointer-events-none absolute -top-1 -right-1 flex min-h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold ${bellStyles.countBadge}`}
              aria-hidden
            >
              {formatDocumentsQueueBadgeCount(count)}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <p className="text-sm font-semibold leading-none">Completed</p>
          {count > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="h-auto py-1 text-muted-foreground"
              onClick={() => dispatch(clearCompletedDocumentNotifications())}
            >
              Clear all
            </Button>
          ) : null}
        </div>
        <Separator />
        {count === 0 ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            When documents finish processing, they will appear here.
          </p>
        ) : (
          <ul className="max-h-72 overflow-y-auto py-1">
            {notifications.map((item) => (
              <li
                key={item.id}
                className="flex min-h-10 items-stretch gap-0 border-b border-border last:border-b-0"
              >
                <Link
                  to={`/documents/${item.id}`}
                  className="flex min-w-0 flex-1 items-center px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  title={item.name}
                >
                  <span className="truncate">{item.name}</span>
                </Link>
                <div className="flex shrink-0 items-center pr-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={`Dismiss notification for ${item.name}`}
                    onClick={() =>
                      dispatch(dismissCompletedDocumentNotification(item.id))
                    }
                  >
                    <X className="size-3.5" aria-hidden />
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
