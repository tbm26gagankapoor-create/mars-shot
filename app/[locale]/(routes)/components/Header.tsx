"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CommandComponent } from "@/components/CommandComponent";
import { LogoutButton } from "./logout-button";

const pathLabels: Record<string, string> = {
  "/": "Dashboard",
  "/deals": "Deal Pipeline",
  "/deals/new": "New Deal",
  "/deals/drafts": "Drafts",
  "/portfolio": "Portfolio",
  "/ecosystem": "Ecosystem",
  "/calendar": "Calendar",
  "/documents": "Documents",
  "/term-sheets": "Term Sheets",
  "/reports": "Reports",
  "/email-templates": "Templates",
  "/projects": "Boards",
  "/settings": "Settings",
};

function getBreadcrumb(pathname: string) {
  const path = pathname.replace(/^\/[a-z]{2}(\/|$)/, "/");
  if (path === "/" || path === "") return "Dashboard";
  // Try exact match first
  if (pathLabels[path]) return pathLabels[path];
  // Try parent path for detail pages like /deals/[id]
  const segments = path.split("/").filter(Boolean);
  const parentPath = "/" + segments[0];
  return pathLabels[parentPath] || segments[0].charAt(0).toUpperCase() + segments[0].slice(1).replace(/-/g, " ");
}

const Header = () => {
  const pathname = usePathname();
  const breadcrumb = getBreadcrumb(pathname);

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-xs text-muted-foreground/60">Mars Shot</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
          <span className="text-sm font-medium text-foreground">{breadcrumb}</span>
        </div>
        <div className="flex items-center gap-2">
          <CommandComponent />
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
};

export default Header;
