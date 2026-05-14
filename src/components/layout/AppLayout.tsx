import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavBar } from "@/components/elements/Navbar/NavBar";
import { SideBar } from "@/components/elements/SideBar/SideBar";

export function AppLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <SideBar />
        <NavBar />
      </SidebarProvider>
    </TooltipProvider>
  );
}
