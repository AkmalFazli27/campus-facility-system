"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/lib/validations/auth";
import { isSafeNextPath } from "@/lib/auth-ui";

export default function SignInForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [pendingBlocked, setPendingBlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingBlocked(false);
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        email: flat.email?.[0],
        password: flat.password?.[0],
      });
      toast.error("Periksa kembali email dan sandi");
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const message: string = payload?.message ?? "Gagal masuk";
        if (response.status === 403 && message.toLowerCase().includes("verifikasi")) {
          setPendingBlocked(true);
        } else if (response.status === 409) {
          setFieldErrors({ email: message });
        }
        toast.error(message);
        return;
      }
      toast.success("Berhasil masuk");
      router.push(isSafeNextPath(next) ? next : "/");
      router.refresh();
    } catch {
      toast.error("Tidak dapat menghubungi server");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {pendingBlocked && (
        <div
          role="alert"
          className="rounded-2xl border border-warning/30 bg-warning/10 p-3 text-sm leading-relaxed text-ink-950"
        >
          <p className="font-semibold">Akun menunggu verifikasi admin.</p>
          <p className="mt-1 text-ink-600">
            Pendaftaran Anda sudah diterima. Pantau statusnya di halaman
            berikut.
          </p>
          <Link
            href="/pending-verification"
            className="mt-2 inline-block font-semibold text-brand-600 hover:text-brand-700"
          >
            Lihat status verifikasi →
          </Link>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-email">Email civitas akademika</Label>
        <div className="relative flex items-center">
          <Mail
            aria-hidden
            className="pointer-events-none absolute left-3 size-4 text-ink-400"
          />
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="nama@kampus.ac.id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            className="pr-3 pl-9"
          />
        </div>
        {fieldErrors.email && (
          <p role="alert" className="text-xs text-danger">
            {fieldErrors.email}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-password">Kata sandi</Label>
        <div className="relative flex items-center">
          <Lock
            aria-hidden
            className="pointer-events-none absolute left-3 size-4 text-ink-400"
          />
          <Input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Masukkan kata sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            className="pr-10 pl-9"
          />
          <button
            type="button"
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2.5 rounded-full p-1.5 text-ink-600 hover:text-ink-950 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
          >
            {showPassword ? (
              <EyeOff aria-hidden className="size-4" />
            ) : (
              <Eye aria-hidden className="size-4" />
            )}
          </button>
        </div>
        {fieldErrors.password && (
          <p role="alert" className="text-xs text-danger">
            {fieldErrors.password}
          </p>
        )}
      </div>
      <Button
        type="submit"
        disabled={submitting}
        className="mt-2 w-full rounded-full bg-brand-500 py-2.5 hover:bg-brand-600"
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
            Memverifikasi akun...
          </span>
        ) : (
          "Masuk ke portal"
        )}
      </Button>
    </form>
  );
}
