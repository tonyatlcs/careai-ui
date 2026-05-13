import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Files, LayoutGrid, Plus } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import styles from "./AppLayout.module.scss";

/** Shown in the main header until profile / auth is wired up. */
const HEADER_GREETING_NAME = "Tony Li";

export function AppLayout() {
  const { pathname } = useLocation();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="none" className={styles.sidebarShell}>
          <SidebarHeader className={styles.sidebarHeader}>
            <div className={styles.brand}>
              <img
                src="/care-gp-logo.png"
                alt=""
                className={styles.brandLogo}
              />
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
              <Button type="button" size="lg" className={styles.addNewButton}>
                <Plus aria-hidden />
                Add new document
              </Button>
            </div>
          </header>
          <div className={styles.content}>
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
