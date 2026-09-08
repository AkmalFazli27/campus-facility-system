import { PrismaClient, Role, AccountStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

// Seed minimal (PRD §29): 4 akun demo + 10 fasilitas.
// Idempoten via upsert — aman dijalankan ulang.
// Jalankan: `npm run db:seed` (butuh DATABASE_URL + MySQL menyala).
const db = new PrismaClient();

async function main() {
  const users = [
    {
      name: "Admin",
      email: "admin@example.com",
      password: "Admin123!",
      role: Role.ADMIN,
      accountStatus: AccountStatus.ACTIVE,
    },
    {
      name: "Petugas",
      email: "officer@example.com",
      password: "Officer123!",
      role: Role.OFFICER,
      accountStatus: AccountStatus.ACTIVE,
    },
    {
      name: "Pengguna",
      email: "user@example.com",
      password: "User123!",
      role: Role.USER,
      accountStatus: AccountStatus.ACTIVE,
    },
    {
      name: "Pendaftar",
      email: "pending@example.com",
      password: "User123!",
      role: Role.USER,
      accountStatus: AccountStatus.PENDING,
    },
  ];
  for (const u of users) {
    await db.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        passwordHash: await bcrypt.hash(u.password, 10),
        role: u.role,
        accountStatus: u.accountStatus,
      },
    });
  }

  const facilities = [
    { name: "Ruang Kelas A101", type: "kelas", location: "Gedung A", capacity: 40 },
    { name: "Ruang Kelas A102", type: "kelas", location: "Gedung A", capacity: 40 },
    { name: "Ruang Kelas B201", type: "kelas", location: "Gedung B", capacity: 60 },
    { name: "Aula Utama", type: "aula", location: "Gedung C", capacity: 500 },
    { name: "Aula Mini", type: "aula", location: "Gedung B", capacity: 100 },
    { name: "Lab Komputer 1", type: "lab", location: "Gedung A", capacity: 30 },
    { name: "Lab Fisika", type: "lab", location: "Gedung B", capacity: 25 },
    { name: "Lapangan Futsal", type: "lapangan", location: "Area Luar", capacity: 22 },
    { name: "Lapangan Basket", type: "lapangan", location: "Area Luar", capacity: 20 },
    { name: "Proyektor Epson X1", type: "alat", location: "Gudang A", capacity: 1 },
  ];
  for (const f of facilities) {
    await db.facility.upsert({
      where: { name: f.name },
      update: {},
      create: f,
    });
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
