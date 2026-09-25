import AuthShell from "@/components/custom/auth/AuthShell";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;

  return <AuthShell initialMode="sign-in" next={next} />;
}
