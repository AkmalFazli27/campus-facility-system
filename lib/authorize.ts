// Pemetaan path → role (PRD §17). Fungsi murni: unit-testable tanpa NextRequest.
// Dipakai proxy.ts untuk optimistic check; Route Handler tetap cek ulang (secure check).
export type Role = "USER" | "OFFICER" | "ADMIN";

const RULES: Array<{ prefix: string; roles: Role[] }> = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/officer", roles: ["OFFICER", "ADMIN"] },
  { prefix: "/reservations", roles: ["USER"] },
  { prefix: "/reports", roles: ["USER", "OFFICER", "ADMIN"] },
];

export function requiredRoles(pathname: string): Role[] {
  const rule = RULES.find(
    (r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`),
  );
  return rule ? rule.roles : [];
}

export function isAuthorized(pathname: string, role: string): boolean {
  const roles = requiredRoles(pathname);
  if (roles.length === 0) return true;
  return roles.includes(role as Role);
}
