"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/en/sign-in");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
      <LogOut className="h-4 w-4" />
    </Button>
  );
}
