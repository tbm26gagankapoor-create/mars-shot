"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Crosshair,
  Briefcase,
  Users,
  Settings,
  Calendar,
  FileText,
  ScrollText,
  BarChart3,
  Mail,
  Kanban,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const workspaces = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Deals",
    href: "/deals",
    icon: Crosshair,
    description: "Pipeline & deal flow",
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    icon: Briefcase,
    description: "Invested companies",
  },
  {
    label: "Ecosystem",
    href: "/ecosystem",
    icon: Users,
    description: "VCs & contacts",
  },
];

const tools = [
  {
    label: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    label: "Term Sheets",
    href: "/term-sheets",
    icon: ScrollText,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    label: "Templates",
    href: "/email-templates",
    icon: Mail,
  },
  {
    label: "Portfolio Boards",
    href: "/projects",
    icon: Kanban,
  },
];

const bottomNav = [
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const { state } = useSidebar();
  const isExpanded = state === "expanded";
  const pathname = usePathname();

  // Strip locale prefix for matching
  const path = pathname.replace(/^\/[a-z]{2}(\/|$)/, "/");

  function isActive(href: string) {
    if (href === "/") return path === "/" || path === "";
    return path.startsWith(href);
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div
          className={cn(
            "flex items-center py-3",
            isExpanded ? "gap-3 px-1" : "justify-center"
          )}
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 shadow-sm shadow-orange-500/25 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-white leading-none tracking-tight">M</span>
          </div>
          {isExpanded && (
            <div>
              <h1 className="font-display font-semibold text-sm text-sidebar-primary tracking-tight">
                Mars Shot
              </h1>
              <p className="text-[10px] text-sidebar-foreground/50 -mt-0.5 tracking-wider uppercase">
                Venture Capital
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaces.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tools.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <div
          className={cn(
            "flex items-center py-2",
            isExpanded ? "gap-3 px-1" : "justify-center"
          )}
        >
          <div className="h-7 w-7 rounded-full bg-sidebar-accent flex items-center justify-center text-[11px] font-medium text-sidebar-primary shrink-0">
            VP
          </div>
          {isExpanded && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-sidebar-primary/80 truncate">
                {user?.name || "VP, Investments"}
              </p>
              <p className="text-[10px] text-sidebar-foreground/40 truncate">
                {user?.email || "vp@marsshot.vc"}
              </p>
            </div>
          )}
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
