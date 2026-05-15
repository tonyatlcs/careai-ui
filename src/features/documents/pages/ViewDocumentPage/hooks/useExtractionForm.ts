import { useCallback, useMemo, useState } from "react";
import type {
  ExtractionFieldKey,
  ExtractionFields,
  GetDocumentContentResponse,
} from "@/features/documents/documentContentTypes";

export function useExtractionForm(content: GetDocumentContentResponse | undefined) {
  const source = useMemo(() => {
    const form = content?.extraction ? { ...content.extraction } : null;
    const baseline = form ? JSON.stringify(form) : "";
    return {
      baseline,
      form,
      key: content ? `${content.documentId}:${baseline}` : "",
    };
  }, [content]);
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
