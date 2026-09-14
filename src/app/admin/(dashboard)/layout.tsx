import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  ClipboardList,
  FolderKanban,
  Image,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  Users,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/features/admin/logout-button";

export const metadata: Metadata = {
  title: "Operations",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "STAFF"] },
  { href: "/admin/leads", label: "Leads", icon: ClipboardList, roles: ["ADMIN", "STAFF"] },
  { href: "/admin/customers", label: "Customers", icon: Users, roles: ["ADMIN", "STAFF"] },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase, roles: ["ADMIN", "STAFF"] },
  { href: "/admin/quotes", label: "Quotes", icon: FolderKanban, roles: ["ADMIN", "STAFF"] },
  { href: "/admin/analytics", label: "Marketing", icon: BarChart3, roles: ["ADMIN", "STAFF"] },
  { href: "/admin/projects", label: "Projects", icon: Image, roles: ["ADMIN", "STAFF"] },
  { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["ADMIN"] },
  { href: "/admin/templates", label: "Templates", icon: MessageSquareText, roles: ["ADMIN"] },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const role = session.role;
  const nav = NAV.filter((item) => (item.roles as readonly string[]).includes(role));

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      {/* Sidebar */}
      <aside className="flex flex-col bg-slate-900 lg:min-h-screen lg:w-60 lg:shrink-0">
        <div className="flex items-center justify-between px-4 py-4 lg:block">
          <Link href="/admin" className="text-base font-bold text-white">
            Peepal Flow Fix <span className="font-medium text-slate-400">Ops</span>
          </Link>
          <div className="lg:hidden">
            <LogoutButton />
          </div>
        </div>
        <nav aria-label="Admin navigation" className="flex gap-1 overflow-x-auto px-2 pb-2 lg:flex-col lg:px-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-[44px] shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <item.icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto hidden border-t border-slate-800 p-3 lg:block">
          <p className="truncate px-1 text-xs font-semibold text-slate-300">{session.name}</p>
          <p className="px-1 text-[11px] text-slate-500">{role}</p>
          <div className="mt-2">
            <LogoutButton />
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
