import Link from "next/link";
import { getDashboardNav } from "@/lib/dashboard-nav";
import type { Role } from "@/lib/authorize";
import { cn } from "@/lib/utils";

export default function DashboardSidebar({ role }: { role: Role }) {
  const items = getDashboardNav(role);
  return (
    <aside aria-label={`Navigasi dashboard ${role.toLowerCase()}`} className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-3 lg:w-60">
      <nav className="flex gap-2 overflow-x-auto lg:flex-col">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={cn("rounded-xl px-3 py-2 text-sm font-medium text-ink-600 hover:bg-slate-100 hover:text-ink-950")}>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
