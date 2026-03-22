import { cookies } from "next/headers";

import Header from "./components/Header";
import Footer from "./components/Footer";

import { Metadata } from "next";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: "Mars Shot VC",
  description: "Deal pipeline CRM for Mars Shot — Razorpay founders' investment arm",
  openGraph: {
    images: [
      {
        url: "/images/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Mars Shot VC",
      },
    ],
  },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Replace with Supabase Auth session check
  // const session = await getSupabaseSession();
  // if (!session) redirect("/sign-in");

  const cookieStore = await cookies();
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <AppSidebar variant="inset" />
      <SidebarInset className="overflow-y-auto max-h-svh">
        <Header />
        <div className="flex flex-col flex-grow w-full min-w-0">
          <div className="flex-grow py-5 w-full min-w-0">
            <div className="w-full px-4 min-w-0">
              {children}
            </div>
          </div>
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
