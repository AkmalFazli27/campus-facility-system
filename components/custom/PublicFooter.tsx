import Link from "next/link";
import { cn } from "@/lib/utils";

const FACILITY_LINKS = [
  { label: "Semua fasilitas", href: "/facilities" },
  { label: "Kelas", href: "/facilities?type=kelas" },
  { label: "Laboratorium", href: "/facilities?type=lab" },
  { label: "Aula", href: "/facilities?type=aula" },
  { label: "Lapangan", href: "/facilities?type=lapangan" },
] as const;

const ACCOUNT_LINKS = [
  { label: "Masuk", href: "/login" },
  { label: "Daftar akun", href: "/register" },
] as const;

const GUIDE_LINKS = [
  { label: "Alur reservasi & pelaporan", href: "/#tentang" },
  { label: "Cara meminjam fasilitas", href: "/#cara-kerja-heading" },
] as const;

function FooterLinks({
  links,
  columns = 1,
}: {
  links: readonly { label: string; href: string }[];
  columns?: 1 | 2;
}) {
  return (
    <ul
      className={cn(
        "mt-2 text-sm text-ink-600",
        columns === 2
          ? "grid grid-flow-col grid-rows-3 gap-x-6"
          : "flex flex-col"
      )}
    >
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="inline-flex min-h-11 items-center rounded-md px-1 whitespace-nowrap hover:text-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function PublicFooter() {
  return (
    <footer className="border-t border-brand-100 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-8 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-md text-xl font-bold tracking-tight text-ink-950 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
          >
            Kampus<span className="text-brand-500">Space</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-600">
            Portal untuk melihat, memesan, dan melaporkan fasilitas kampus.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-ink-600">
            Operasional: 07.00–20.00 WIB
            <br />
            Validasi konflik oleh server: interval 30 menit.
          </p>
        </div>

        <nav aria-labelledby="footer-facilities-heading">
          <h2 id="footer-facilities-heading" className="font-bold text-ink-950">
            Fasilitas
          </h2>
          <FooterLinks links={FACILITY_LINKS} columns={2} />
        </nav>

        <nav aria-labelledby="footer-account-heading">
          <h2 id="footer-account-heading" className="font-bold text-ink-950">
            Akun
          </h2>
          <FooterLinks links={ACCOUNT_LINKS} />
        </nav>

        <nav aria-labelledby="footer-guide-heading">
          <h2 id="footer-guide-heading" className="font-bold text-ink-950">
            Panduan
          </h2>
          <FooterLinks links={GUIDE_LINKS} />
        </nav>
      </div>
    </footer>
  );
}
