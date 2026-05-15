import { useEffect, useMemo, useRef } from "react";

export function useObjectUrl(blob: Blob | undefined): string | null {
  const objectUrlRef = useRef<string | null>(null);

  const objectUrl = useMemo(() => {
    if (!blob) {
      return null;
    }
    return URL.createObjectURL(blob);
  }, [blob]);

  useEffect(() => {
    objectUrlRef.current = objectUrl;
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, [objectUrl]);

  return objectUrl;
}
