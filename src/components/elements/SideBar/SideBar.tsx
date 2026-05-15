import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Files, LayoutGrid } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useDocumentsProcessingListSubscription } from "@/features/documents/pages/ViewDocumentPage/hooks/documentsQueuePolling";
import styles from "./SideBar.module.scss";

export function SideBar() {
  const { pathname } = useLocation();
  useDocumentsProcessingListSubscription();

  return (
    <Sidebar collapsible="none" className={styles.sidebarShell}>
      <SidebarHeader className={styles.sidebarHeader}>
        <div className={styles.brand}>
          <img src="/care-gp-logo.png" alt="" className={styles.brandLogo} />
        </div>
      </SidebarHeader>
      <SidebarContent className={styles.sidebarContent}>
        <SidebarGroup className={styles.mainMenuGroup}>
          <SidebarGroupLabel className={styles.sectionLabel}>
            Main menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className={styles.navMenu}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={
                    pathname === "/dashboard" ||
                    pathname.startsWith("/dashboard/")
                  }
                  tooltip="Dashboard"
                  className={styles.navItem}
                >
                  <NavLink to="/dashboard">
                    <LayoutGrid aria-hidden />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={
                    pathname === "/documents" ||
                    pathname.startsWith("/documents/")
                  }
                  tooltip="Documents"
                  className={styles.navItem}
                >
                  <NavLink to="/documents">
                    <Files aria-hidden />
                    <span>Documents</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
