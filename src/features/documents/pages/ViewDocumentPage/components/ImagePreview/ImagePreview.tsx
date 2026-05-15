import type { FC, RefObject } from "react";
import { useState } from "react";
import type { ExtractionFieldKey, GetDocumentContentResponse } from "@/features/documents/documentContentTypes";
import { FieldBoxLayer } from "@/features/documents/pages/ViewDocumentPage/components/FieldBoxLayer/FieldBoxLayer";
import { previewInnerSize } from "@/features/documents/pages/ViewDocumentPage/viewDocumentPageUtils";
import layoutStyles from "../DocumentPreviewLayout/DocumentPreviewLayout.module.scss";

export type ImagePreviewProps = {
  content: GetDocumentContentResponse;
  fileObjectUrl: string;
  previewAvail: { width: number; height: number };
  zoom: number;
  viewportRef: RefObject<HTMLDivElement | null>;
  boxAnchorRef: RefObject<HTMLDivElement | null>;
  focusedField: ExtractionFieldKey | null;
  onHoverField: (field: ExtractionFieldKey | null) => void;
};

export const ImagePreview: FC<ImagePreviewProps> = ({
  content,
  fileObjectUrl,
  previewAvail,
  zoom,
  viewportRef,
  boxAnchorRef,
  focusedField,
  onHoverField,
}) => {
  const [imgNatural, setImgNatural] = useState<{ w: number; h: number } | null>(null);
  const nw = imgNatural?.w ?? 0;
  const nh = imgNatural?.h ?? 0;
  const { w: iw, h: ih } = previewInnerSize(previewAvail.width, previewAvail.height);
  const imgFit = nw > 0 && nh > 0 ? Math.min(1, iw / nw, ih / nh) : 1;
  const dw = nw > 0 ? nw * imgFit : Math.min(iw, Math.round((ih * 3) / 4));
  const dh = nh > 0 ? nh * imgFit : Math.min(ih, Math.round((dw * 4) / 3));

  return (
    <div className={layoutStyles.previewStack}>
      <div className={layoutStyles.zoomWrap} style={{ transform: `scale(${zoom})` }}>
        <div className={layoutStyles.viewport} ref={viewportRef} style={{ width: dw, height: dh }}>
          <img
            alt=""
            className={layoutStyles.previewImg}
            src={fileObjectUrl}
            style={
              nw > 0
                ? { display: "block", width: dw, height: dh }
                : { display: "block", maxWidth: "100%", maxHeight: ih }
            }
            onLoad={(e) => {
              const { naturalWidth, naturalHeight } = e.currentTarget;
              setImgNatural({ w: naturalWidth, h: naturalHeight });
            }}
          />
          {nw > 0 && nh > 0 ? (
            <div className={layoutStyles.boxLayer}>
              <FieldBoxLayer
                boxAnchorRef={boxAnchorRef}
                fieldBoxes={content.fieldBoxes}
                focusedField={focusedField}
                page={1}
                space={{ width: nw, height: nh }}
                onHoverField={onHoverField}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
