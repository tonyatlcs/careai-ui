import { Button } from "@/components/ui/button";
import { SidebarInset } from "@/components/ui/sidebar";
import { UploadFileModal } from "@/features/dashboard/components/UploadFileModal/UploadFileModal";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import styles from "./NavBar.module.scss";

/** Shown in the main header until profile / auth is wired up. */
const HEADER_GREETING_NAME = "Tony Li";

export function NavBar() {
  const [addDocumentOpen, setAddDocumentOpen] = useState(false);

  return (
    <SidebarInset>
      <header className={styles.appHeader}>
        <div className={styles.appHeaderLeft}>
          <p className={styles.greeting}>
            Welcome back, {HEADER_GREETING_NAME}{" "}
            <span className={styles.greetingWave} aria-hidden>
              👋
            </span>
          </p>
        </div>
        <div className={styles.appHeaderActions}>
          <Button
            type="button"
            size="lg"
            className={styles.addNewButton}
            onClick={() => setAddDocumentOpen(true)}
          >
            <Plus aria-hidden />
            Add new document
          </Button>
        </div>
      </header>
      <div className={styles.content}>
        <Outlet />
      </div>
      <UploadFileModal
        open={addDocumentOpen}
        onOpenChange={setAddDocumentOpen}
      />
    </SidebarInset>
  );
}
