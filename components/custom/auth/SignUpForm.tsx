"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Info, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerClientSchema } from "@/lib/validations/auth";

export default function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState<"MAHASISWA" | "DOSEN" | "TENDIK">("MAHASISWA");
  const [identityNumber, setIdentityNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    userType?: string;
    identityNumber?: string;
    password?: string;
    confirmPassword?: string;
    agreeTerms?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = registerClientSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
      agreeTerms,
      userType,
      identityNumber,
    });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        name: flat.name?.[0],
        email: flat.email?.[0],
        userType: flat.userType?.[0],
        identityNumber: flat.identityNumber?.[0],
        password: flat.password?.[0],
        confirmPassword: flat.confirmPassword?.[0],
        agreeTerms: flat.agreeTerms?.[0],
      });
      toast.error("Periksa kembali data pendaftaran");
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsed.data.name,
          email: parsed.data.email,
          password: parsed.data.password,
          userType: parsed.data.userType,
          identityNumber: (parsed.data.identityNumber ?? "").trim(),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const message: string = payload?.message ?? "Gagal mendaftar";
        if (response.status === 409) {
          const msg: string = payload?.message ?? "Sudah terdaftar";
          if (msg.toLowerCase().includes("identitas")) {
            setFieldErrors({ identityNumber: msg });
          } else {
            setFieldErrors({ email: msg });
          }
        }
        toast.error(message);
        return;
      }
      toast.success("Pendaftaran terkirim. Menunggu verifikasi admin.");
      router.push("/pending-verification");
    } catch {
      toast.error("Tidak dapat menghubungi server");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <div
        role="note"
        className="flex items-start gap-2 rounded-2xl border border-warning/30 bg-warning/10 p-2.5 text-[11px] leading-relaxed text-ink-950"
      >
        <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-warning" />
        <p>
          <strong>Catatan verifikasi:</strong> akun registrasi mandiri
          berstatus pending dan memerlukan validasi admin sebelum hak
          peminjaman aktif.
        </p>
      </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="reg-name">Nama lengkap</Label>
          <div className="relative flex items-center">
            <User
              aria-hidden
              className="pointer-events-none absolute left-2.5 size-4 text-ink-400"
            />
            <Input
              id="reg-name"
              name="name"
              required
              minLength={2}
              placeholder="Nama civitas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(fieldErrors.name)}
              className="py-1.5 pr-2.5 pl-8 text-[13px]"
            />
          </div>
          {fieldErrors.name && (
            <p role="alert" className="text-xs text-danger">
              {fieldErrors.name}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="reg-email">Email institusi</Label>
          <div className="relative flex items-center">
            <Mail
              aria-hidden
              className="pointer-events-none absolute left-2.5 size-4 text-ink-400"
            />
            <Input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="nama@kampus.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              className="py-1.5 pr-2.5 pl-8 text-[13px]"
            />
          </div>
          {fieldErrors.email && (
            <p role="alert" className="text-xs text-danger">
              {fieldErrors.email}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="reg-usertype">Tipe civitas</Label>
            <select
              id="reg-usertype"
              value={userType}
              onChange={(e) => setUserType(e.target.value as "MAHASISWA" | "DOSEN" | "TENDIK")}
              className="rounded-xl border bg-surface px-2.5 py-1.5 text-[13px]"
            >
              <option value="MAHASISWA">Mahasiswa</option>
              <option value="DOSEN">Dosen</option>
              <option value="TENDIK">Tendik</option>
            </select>
            {fieldErrors.userType && (
              <p role="alert" className="text-xs text-danger">{fieldErrors.userType}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="reg-identity">{userType === "MAHASISWA" ? "NIM" : "NIP"}{userType === "TENDIK" ? " (opsional)" : ""}</Label>
            <Input
              id="reg-identity"
              value={identityNumber}
              onChange={(e) => setIdentityNumber(e.target.value)}
              placeholder={userType === "MAHASISWA" ? "misal 211201201" : "18 digit angka"}
              inputMode={userType === "MAHASISWA" ? "text" : "numeric"}
              className="py-1.5 text-[13px]"
            />
            {fieldErrors.identityNumber ? (
              <p role="alert" className="text-xs text-danger">{fieldErrors.identityNumber}</p>
            ) : (
              <p className="text-[11px] text-ink-400">
                {userType === "MAHASISWA" ? "NIM 9-16 huruf/angka." : userType === "DOSEN" ? "NIP tepat 18 angka." : "Tendik boleh kosong; bila diisi 18 angka."}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="reg-password">Kata sandi</Label>
          <div className="relative flex items-center">
            <Lock
              aria-hidden
              className="pointer-events-none absolute left-2.5 size-4 text-ink-400"
            />
            <Input
              id="reg-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Min. 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              className="py-1.5 pr-8 pl-8 text-[13px]"
            />
            <button
              type="button"
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 rounded-full p-1 text-ink-600 hover:text-ink-950 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
            >
              {showPassword ? (
                <EyeOff aria-hidden className="size-4" />
              ) : (
                <Eye aria-hidden className="size-4" />
              )}
            </button>
          </div>
          {fieldErrors.password ? (
            <p role="alert" className="text-xs text-danger">
              {fieldErrors.password}
            </p>
          ) : (
            <p className="text-[11px] text-ink-400">
              Minimal 8 karakter, mengandung huruf dan angka.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="reg-confirm">Konfirmasi sandi</Label>
          <div className="relative flex items-center">
            <Lock
              aria-hidden
              className="pointer-events-none absolute left-2.5 size-4 text-ink-400"
            />
            <Input
              id="reg-confirm"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Ulangi sandi"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              className="py-1.5 pr-8 pl-8 text-[13px]"
            />
            <button
              type="button"
              aria-label={showConfirm ? "Sembunyikan konfirmasi" : "Tampilkan konfirmasi"}
              aria-pressed={showConfirm}
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-2 rounded-full p-1 text-ink-600 hover:text-ink-950 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
            >
              {showConfirm ? (
                <EyeOff aria-hidden className="size-4" />
              ) : (
                <Eye aria-hidden className="size-4" />
              )}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p role="alert" className="text-xs text-danger">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>
      <div className="flex items-start gap-2 pt-1">
        <input
          id="terms-agree"
          type="checkbox"
          required
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          aria-invalid={Boolean(fieldErrors.agreeTerms)}
          className="mt-0.5 size-3.5 cursor-pointer accent-brand-500"
        />
        <label
          htmlFor="terms-agree"
          className="cursor-pointer text-[11px] leading-tight text-ink-600"
        >
          Saya menyetujui Ketentuan Pemakaian Fasilitas Kampus & Kebijakan
          Privasi
        </label>
      </div>
      {fieldErrors.agreeTerms && (
        <p role="alert" className="text-xs text-danger">
          {fieldErrors.agreeTerms}
        </p>
      )}
      <Button
        type="submit"
        disabled={submitting}
        className="mt-1.5 w-full rounded-full bg-brand-500 py-2.5 hover:bg-brand-600"
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
            Mendaftarkan civitas...
          </span>
        ) : (
          "Ajukan pendaftaran civitas"
        )}
      </Button>
    </form>
  );
}
