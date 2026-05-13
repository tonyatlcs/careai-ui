import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Popover } from "radix-ui";
import { useCallback, useMemo, useState } from "react";
import {
  DayButton,
  type DayButtonProps,
  DayPicker,
  UI,
} from "react-day-picker";

import { cn } from "@/lib/utils";
import styles from "./ActivityCalendarWidget.module.scss";

type ActivityDot = "white" | "teal" | "amber";

type ActivityEvent = {
  id: string;
  title: string;
  time: string;
  dot: ActivityDot;
};

const DOT_SWATCH: Record<ActivityDot, string> = {
  white: styles.eventDotSwatchWhite,
  teal: styles.eventDotSwatchTeal,
  amber: styles.eventDotSwatchAmber,
};

function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const SAMPLE_EVENTS: Record<string, ActivityEvent[]> = {
  "2024-02-08": [
    {
      id: "1",
      title: "DR. Benu Appointment",
      time: "11:00am",
      dot: "white",
    },
    {
      id: "2",
      title: "Dentist Meetup",
      time: "3:00pm",
      dot: "teal",
    },
    {
      id: "3",
      title: "Albert Edisen",
      time: "4:00pm",
      dot: "amber",
    },
  ],
};

const initialMonth = new Date(2024, 1, 1);
const initialSelected = new Date(2024, 1, 8);

export function ActivityCalendarWidget() {
  const [month, setMonth] = useState<Date>(initialMonth);
  const [selected, setSelected] = useState<Date | undefined>(initialSelected);
  const [popoverOpen, setPopoverOpen] = useState(true);

  const modifiers = useMemo(
    () => ({
      hasEvents: (date: Date) => Boolean(SAMPLE_EVENTS[toDayKey(date)]?.length),
    }),
    [],
  );

  const eventsForSelected = useMemo(() => {
    if (!selected) return [];
    return SAMPLE_EVENTS[toDayKey(selected)] ?? [];
  }, [selected]);

  const dayButton = useCallback((props: DayButtonProps) => {
    const { modifiers: m, className, children, ...rest } = props;
    const button = (
      <DayButton
        {...rest}
        modifiers={m}
        className={cn(
          styles.dayButton,
          m.outside && styles.dayOutside,
          m.selected && styles.daySelected,
          !m.selected && !m.outside && styles.dayDefault,
          m.disabled && styles.dayDisabled,
          className,
        )}
      >
        <span className={styles.dayLabel}>{children}</span>
        {m.hasEvents ? (
          <span
            className={cn(
              styles.eventDot,
              m.selected ? styles.eventDotOnSelected : styles.eventDotDefault,
            )}
            aria-hidden
          />
        ) : null}
      </DayButton>
    );

    if (m.selected) {
      return <Popover.Anchor asChild>{button}</Popover.Anchor>;
    }
    return button;
  }, []);

  return (
    <div className={styles.card}>
      <Popover.Root
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
        modal={false}
      >
        <div className={styles.pickerWrap}>
          <DayPicker
            mode="single"
            month={month}
            onMonthChange={setMonth}
            selected={selected}
            onSelect={(date) => {
              setSelected(date);
              setPopoverOpen(date !== undefined);
            }}
            showOutsideDays
            weekStartsOn={0}
            navLayout="around"
            modifiers={modifiers}
            components={{
              DayButton: dayButton,
              Chevron: ({ orientation, className }) => {
                const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
                return (
                  <Icon
                    className={cn(styles.chevron, className)}
                    aria-hidden
                  />
                );
              },
            }}
            formatters={{
              formatWeekdayName: (weekday) =>
                weekday
                  .toLocaleDateString("en-US", { weekday: "short" })
                  .toUpperCase(),
            }}
            classNames={{
              [UI.Root]: styles.calendarRoot,
              [UI.Months]: styles.months,
              [UI.Month]: styles.month,
              [UI.MonthCaption]: styles.monthCaption,
              [UI.CaptionLabel]: styles.captionLabel,
              [UI.PreviousMonthButton]: styles.navButton,
              [UI.NextMonthButton]: styles.navButton,
              [UI.MonthGrid]: styles.monthGrid,
              [UI.Weekdays]: "",
              [UI.Weekday]: styles.weekday,
              [UI.Week]: styles.weekRow,
              [UI.Day]: styles.dayCell,
              [UI.DayButton]: "",
              [UI.Weeks]: styles.weeksBody,
            }}
          />
        </div>

        <Popover.Portal>
          <Popover.Content
            side="bottom"
            align="center"
            sideOffset={10}
            collisionPadding={12}
            className={styles.popoverContent}
          >
            <Popover.Arrow className={styles.popoverArrow} width={14} height={7} />
            <h3 className={styles.popoverTitle}>Activity Detail</h3>
            <ul className={styles.eventList}>
              {eventsForSelected.length === 0 ? (
                <li className={styles.eventListEmpty}>No activities this day.</li>
              ) : (
                eventsForSelected.map((ev) => (
                  <li key={ev.id} className={styles.eventRow}>
                    <span
                      className={cn(
                        styles.eventDotSwatch,
                        DOT_SWATCH[ev.dot],
                      )}
                      aria-hidden
                    />
                    <span className={styles.eventTitle}>{ev.title}</span>
                    <span className={styles.eventTime}>{ev.time}</span>
                  </li>
                ))
              )}
            </ul>
            <button type="button" className={styles.addButton}>
              <Plus className={styles.addButtonIcon} aria-hidden />
              Add Item
            </button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
