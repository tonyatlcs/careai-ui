import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export function useDocumentScopedState<T>(
  documentId: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState({ documentId, value: initialValue });
  const value = state.documentId === documentId ? state.value : initialValue;

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (next) => {
      setState((prev) => {
        const currentValue = prev.documentId === documentId ? prev.value : initialValue;
        return {
          documentId,
          value:
            typeof next === "function"
              ? (next as (previous: T) => T)(currentValue)
              : next,
        };
      });
    },
    [documentId, initialValue],
  );

  return [value, setValue];
}
