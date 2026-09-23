import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { getSessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start gap-4 px-6 py-12 sm:py-16">
        <p className="text-sm font-bold tracking-wider text-brand-600 uppercase">
          {user.role}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-ink-950">
          Dashboard {user.role} — segera hadir
        </h1>
        <p className="max-w-lg leading-relaxed text-ink-600">
          Halo {user.name}, halaman dashboard untuk peran {user.role} sedang
          disiapkan tim lain. Route ini sudah terproteksi dan siap diisi.
        </p>
        <Link
          href="/"
          className={cn(buttonVariants(), "min-h-11 rounded-full px-6")}
        >
          Kembali ke beranda
        </Link>
      </main>
    </div>
  );
}
