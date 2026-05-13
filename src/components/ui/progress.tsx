import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const TRACK = "bg-[#4F46E5]/15";
const INDICATOR = "bg-[#4F46E5]";

function Progress({
  className,
  value,
  max = 100,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const numericMax = Number(max) || 100;
  const pct =
    value == null
      ? 0
      : Math.min(100, Math.max(0, (Number(value) / numericMax) * 100));

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      max={max}
      value={value}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full",
        TRACK,
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 rounded-full transition-[transform] duration-300 ease-out",
          INDICATOR,
        )}
        style={{ transform: `translateX(-${100 - pct}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
