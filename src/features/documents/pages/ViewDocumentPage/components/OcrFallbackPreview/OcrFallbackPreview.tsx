import type { FC, RefObject } from "react";
import type { ExtractionFieldKey, GetDocumentContentResponse } from "@/features/documents/documentContentTypes";
import { FieldBoxLayer } from "@/features/documents/pages/ViewDocumentPage/components/FieldBoxLayer/FieldBoxLayer";
import { TranscriptPanel } from "@/features/documents/pages/ViewDocumentPage/components/TranscriptPanel/TranscriptPanel";
import { inferPageSpace, previewInnerSize } from "@/features/documents/pages/ViewDocumentPage/viewDocumentPageUtils";
import layoutStyles from "../DocumentPreviewLayout/DocumentPreviewLayout.module.scss";

export type OcrFallbackPreviewProps = {
  content: GetDocumentContentResponse;
  selectedPage: number;
  previewAvail: { width: number; height: number };
  zoom: number;
  viewportRef: RefObject<HTMLDivElement | null>;
  boxAnchorRef: RefObject<HTMLDivElement | null>;
  focusedField: ExtractionFieldKey | null;
  onHoverField: (field: ExtractionFieldKey | null) => void;
  onSelectPage: (page: number) => void;
};

export const OcrFallbackPreview: FC<OcrFallbackPreviewProps> = ({
  content,
  selectedPage,
  previewAvail,
  zoom,
  viewportRef,
  boxAnchorRef,
  focusedField,
  onHoverField,
  onSelectPage,
}) => {
  const page = selectedPage;
  const space = inferPageSpace(page, content.content.blocks, content.fieldBoxes);
  const { w: innerW, h: innerH } = previewInnerSize(previewAvail.width, previewAvail.height);
  const reserveTranscript = 168;
  const maxOcrW = Math.max(80, innerW * 0.44);
  const maxOcrH = Math.max(100, innerH - reserveTranscript);
  const sw = Math.max(space.width, 1);
  const sh = Math.max(space.height, 1);
  const pageFit = Math.min(1, maxOcrW / sw, maxOcrH / sh);
  const boxW = sw * pageFit;
  const boxH = sh * pageFit;
  return (
    <div className={layoutStyles.previewStack}>
      <div className={layoutStyles.ocrSplit}>
        <div className={layoutStyles.viewport} ref={viewportRef}>
          <div className={layoutStyles.zoomWrap} style={{ transform: `scale(${zoom})` }}>
            <div
              className={layoutStyles.viewport}
              style={{
                width: boxW,
                height: boxH,
                background: "#fff",
              }}
            >
              <div className={layoutStyles.boxLayer}>
                <FieldBoxLayer
                  boxAnchorRef={boxAnchorRef}
                  fieldBoxes={content.fieldBoxes}
                  focusedField={focusedField}
                  page={page}
                  space={space}
                  onHoverField={onHoverField}
                />
              </div>
            </div>
          </div>
        </div>
        <TranscriptPanel content={content} selectedPage={selectedPage} onSelectPage={onSelectPage} />
      </div>
    </div>
  );
};
