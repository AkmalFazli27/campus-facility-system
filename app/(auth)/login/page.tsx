import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center justify-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Masuk</CardTitle>
          <CardDescription>
            Gunakan akun kampus Anda untuk mengelola reservasi dan laporan.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <LoginForm next={next} />
          <p className="text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/register" className="font-medium text-foreground underline">
              Daftar di sini
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
