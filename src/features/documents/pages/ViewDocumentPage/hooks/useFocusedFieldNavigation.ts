import { useLayoutEffect } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import type {
  ExtractionFieldKey,
  GetDocumentContentResponse,
} from "@/features/documents/documentContentTypes";
import { firstBoxPageForField } from "@/features/documents/pages/ViewDocumentPage/utils/viewDocumentPageUtils";

export function useFocusedFieldNavigation({
  boxAnchorRef,
  content,
  focusedField,
  selectedPage,
  setSelectedPage,
}: {
  boxAnchorRef: RefObject<HTMLDivElement | null>;
  content: GetDocumentContentResponse | undefined;
  focusedField: ExtractionFieldKey | null;
  selectedPage: number;
  setSelectedPage: Dispatch<SetStateAction<number>>;
}) {
  useLayoutEffect(() => {
    if (!focusedField || !content) {
      return;
    }
    const page = firstBoxPageForField(content.fieldBoxes, focusedField);
    if (page != null && page !== selectedPage) {
      setSelectedPage(page);
    }
  }, [focusedField, content, selectedPage, setSelectedPage]);

  useLayoutEffect(() => {
    if (!focusedField) {
      return;
    }
    const anchor = boxAnchorRef.current;
    if (anchor) {
      anchor.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: "smooth",
      });
    }
  }, [focusedField, selectedPage, content, boxAnchorRef]);
}
