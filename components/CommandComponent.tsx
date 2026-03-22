"use client";

import * as React from "react";
import {
  Crosshair,
  Briefcase,
  Users,
  Settings,
  LayoutDashboard,
  Plus,
  Calendar,
  FileText,
  ScrollText,
  BarChart3,
  Mail,
  Kanban,
  Search,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";

export function CommandComponent() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "j") && e.metaKey) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navigate = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="hidden lg:flex items-center gap-2 h-8 w-56 rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground hover:bg-muted transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left text-xs">Search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground/70">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </button>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-muted transition-colors"
      >
        <Search className="h-4 w-4" />
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search deals, contacts, actions..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => navigate("/")}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => navigate("/deals")}>
              <Crosshair className="mr-2 h-4 w-4" />
              <span>Deal Pipeline</span>
            </CommandItem>
            <CommandItem onSelect={() => navigate("/portfolio")}>
              <Briefcase className="mr-2 h-4 w-4" />
              <span>Portfolio</span>
            </CommandItem>
            <CommandItem onSelect={() => navigate("/ecosystem")}>
              <Users className="mr-2 h-4 w-4" />
              <span>Ecosystem</span>
            </CommandItem>
            <CommandItem onSelect={() => navigate("/calendar")}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem onSelect={() => navigate("/documents")}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Documents</span>
            </CommandItem>
            <CommandItem onSelect={() => navigate("/term-sheets")}>
              <ScrollText className="mr-2 h-4 w-4" />
              <span>Term Sheets</span>
            </CommandItem>
            <CommandItem onSelect={() => navigate("/reports")}>
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Reports</span>
            </CommandItem>
            <CommandItem onSelect={() => navigate("/email-templates")}>
              <Mail className="mr-2 h-4 w-4" />
              <span>Email Templates</span>
            </CommandItem>
            <CommandItem onSelect={() => navigate("/projects")}>
              <Kanban className="mr-2 h-4 w-4" />
              <span>Portfolio Boards</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => navigate("/deals/new")}>
              <Plus className="mr-2 h-4 w-4" />
              <span>New Deal</span>
              <CommandShortcut>&#8984;N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => navigate("/deals/drafts")}>
              <Crosshair className="mr-2 h-4 w-4" />
              <span>Review Drafts</span>
            </CommandItem>
            <CommandItem onSelect={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
