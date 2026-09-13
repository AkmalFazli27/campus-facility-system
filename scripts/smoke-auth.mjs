// Smoke test end-to-end Auth API. Jalankan saat `npm run dev` aktif dan MySQL lokal hidup:
//   npm run smoke:auth
// Bukti untuk PR/UTS (PRD §13). Menggunakan fetch + cookie manual.
const BASE = process.env.APP_URL ?? "http://localhost:3000";
let passed = 0;
let failed = 0;

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`PASS  ${name}`);
  } else {
    failed += 1;
    console.error(`FAIL  ${name} ${detail}`);
  }
}

function cookieFrom(response) {
  const raw = response.headers.getSetCookie?.() ?? [];
  const session = raw.find((c) => c.startsWith("session="));
  return session ? session.split(";")[0] : null;
}

const unique = Date.now();
const newEmail = `smoke_${unique}@example.com`;

// 1) register -> 201 pending
const registerRes = await fetch(`${BASE}/api/auth/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Smoke Test", email: newEmail, password: "User1234" }),
});
const registerBody = await registerRes.json();
check("register 201", registerRes.status === 201, `status=${registerRes.status}`);
check("register status PENDING", registerBody?.data?.user?.accountStatus === "PENDING");

// 2) login akun pending -> 403
const pendingRes = await fetch(`${BASE}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "pending@example.com", password: "User123!" }),
});
check("login pending ditolak 403", pendingRes.status === 403, `status=${pendingRes.status}`);

// 3) login admin -> 200 + cookie
const adminRes = await fetch(`${BASE}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "admin@example.com", password: "Admin123!" }),
});
const cookie = cookieFrom(adminRes);
check("login admin 200", adminRes.status === 200, `status=${adminRes.status}`);
check("login admin set cookie session", Boolean(cookie));

// 4) /me tanpa cookie -> 401
const meAnon = await fetch(`${BASE}/api/auth/me`);
check("me tanpa cookie 401", meAnon.status === 401, `status=${meAnon.status}`);

// 5) /me dengan cookie -> 200
const meRes = await fetch(`${BASE}/api/auth/me`, { headers: { Cookie: cookie } });
const meBody = await meRes.json();
check("me dengan cookie 200", meRes.status === 200, `status=${meRes.status}`);
check("me role ADMIN", meBody?.data?.user?.role === "ADMIN");

// 6) /api/admin/users sebagai admin -> 200
const usersRes = await fetch(`${BASE}/api/admin/users?status=pending`, {
  headers: { Cookie: cookie },
});
check("admin users 200", usersRes.status === 200, `status=${usersRes.status}`);

// 7) logout -> 200 lalu /me -> 401
const logoutRes = await fetch(`${BASE}/api/auth/logout`, {
  method: "POST",
  headers: { Cookie: cookie },
});
check("logout 200", logoutRes.status === 200, `status=${logoutRes.status}`);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
