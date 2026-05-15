import type { FC } from "react";
import {
  Highlighter,
  Pencil,
  PenLine,
  Redo2,
  Search,
  Trash2,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./DocumentToolbar.module.scss";

export type DocumentToolbarProps = {
  selectedPage: number;
  pageCount: number;
  onZoomOut: () => void;
  onZoomIn: () => void;
};

export const DocumentToolbar: FC<DocumentToolbarProps> = ({
  selectedPage,
  pageCount,
  onZoomOut,
  onZoomIn,
}) => (
  <div className={styles.toolbar}>
    <div className={styles.toolbarGroup}>
      <span className={styles.pageIndicator}>
        Page {selectedPage} of {Math.max(pageCount, 1)}
      </span>
    </div>
    <div className={styles.toolbarGroup}>
      <Button aria-label="Undo" disabled size="icon-sm" type="button" variant="ghost">
        <Undo2 />
      </Button>
      <Button aria-label="Redo" disabled size="icon-sm" type="button" variant="ghost">
        <Redo2 />
      </Button>
      <Button aria-label="Delete" disabled size="icon-sm" type="button" variant="ghost">
        <Trash2 />
      </Button>
    </div>
    <div className={styles.toolbarGroup}>
      <Button aria-label="Draw" disabled size="icon-sm" type="button" variant="ghost">
        <Pencil />
      </Button>
      <Button aria-label="Highlight" disabled size="icon-sm" type="button" variant="ghost">
        <Highlighter />
      </Button>
      <Button aria-label="Add text" disabled size="icon-sm" type="button" variant="ghost">
        <Type />
      </Button>
      <Button aria-label="Sign" disabled size="icon-sm" type="button" variant="ghost">
        <PenLine />
      </Button>
    </div>
    <div className={styles.toolbarGroup}>
      <Button aria-label="Search" disabled size="icon-sm" type="button" variant="ghost">
        <Search />
      </Button>
      <Button aria-label="Zoom out" size="icon-sm" type="button" variant="ghost" onClick={onZoomOut}>
        <ZoomOut />
      </Button>
      <Button aria-label="Zoom in" size="icon-sm" type="button" variant="ghost" onClick={onZoomIn}>
        <ZoomIn />
      </Button>
    </div>
  </div>
);
