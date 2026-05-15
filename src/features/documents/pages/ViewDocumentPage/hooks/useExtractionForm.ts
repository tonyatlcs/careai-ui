import { useCallback, useMemo, useState } from "react";
import type {
  ExtractionFieldKey,
  ExtractionFields,
} from "@/features/documents/documentContentTypes";

/**
 * @param extraction Field values from `GET /documents/:id/extraction` (DB `document_extractions`).
 *   `undefined` means the request has not completed yet; `null` means no row / 404.
 */
export function useExtractionForm(
  extraction: ExtractionFields | null | undefined,
  documentId: string,
) {
  const source = useMemo(() => {
    if (extraction === undefined) {
      return {
        baseline: "",
        form: null as ExtractionFields | null,
        key: "__pending__",
      };
    }
    const form = extraction ? { ...extraction } : null;
    const baseline = form ? JSON.stringify(form) : "";
    return {
      baseline,
      form,
      key: documentId ? `${documentId}:${baseline}` : "",
    };
  }, [extraction, documentId]);
  const [draft, setDraft] = useState<{
    baseline: string;
    form: ExtractionFields | null;
    key: string;
  }>({
    baseline: source.baseline,
    form: source.form,
    key: source.key,
  });

  const currentDraft = useMemo(
    () => (draft.key === source.key ? draft : source),
    [draft, source],
  );

  const dirty = useMemo(() => {
    if (!currentDraft.form) {
      return false;
    }
    return JSON.stringify(currentDraft.form) !== currentDraft.baseline;
  }, [currentDraft]);

  const updateField = useCallback(
    (field: ExtractionFieldKey, value: string) => {
      setDraft((prev) => {
        const active = prev.key === source.key ? prev : source;
        return {
          ...active,
          form: active.form ? { ...active.form, [field]: value } : active.form,
        };
      });
    },
    [source],
  );

  const setSavedForm = useCallback(
    (next: ExtractionFields) => {
      setDraft({
        baseline: JSON.stringify(next),
        form: next,
        key: source.key,
      });
    },
    [source.key],
  );

  return {
    dirty,
    form: currentDraft.form,
    setSavedForm,
    updateField,
  };
}
