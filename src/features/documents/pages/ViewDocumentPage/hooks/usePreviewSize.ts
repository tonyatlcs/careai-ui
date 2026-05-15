import { useLayoutEffect, useState } from "react";
import type { RefObject } from "react";

export function usePreviewSize(ref: RefObject<HTMLElement | null>) {
  const [previewAvail, setPreviewAvail] = useState({ width: 720, height: 520 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const measure = () => {
      const { clientWidth, clientHeight } = el;
      if (clientWidth > 0 && clientHeight > 0) {
        setPreviewAvail({ width: clientWidth, height: clientHeight });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return previewAvail;
}
