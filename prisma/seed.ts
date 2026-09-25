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
      userType: "TENDIK" as const,
      identityNumber: null as string | null,
      accountStatus: AccountStatus.ACTIVE,
    },
    {
      name: "Petugas",
      email: "officer@example.com",
      password: "Officer123!",
      role: Role.OFFICER,
      userType: "TENDIK" as const,
      identityNumber: "198701012009041002",
      accountStatus: AccountStatus.ACTIVE,
    },
    {
      name: "Pengguna",
      email: "user@example.com",
      password: "User123!",
      role: Role.USER,
      userType: "MAHASISWA" as const,
      identityNumber: "211201201",
      accountStatus: AccountStatus.ACTIVE,
    },
    {
      name: "Pendaftar",
      email: "pending@example.com",
      password: "User123!",
      role: Role.USER,
      userType: "DOSEN" as const,
      identityNumber: "198701012009041003",
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
        userType: u.userType,
        identityNumber: u.identityNumber,
        accountStatus: u.accountStatus,
      },
    });
  }

  const facilities = [
    { name: "Ruang Kelas A101", type: "kelas", location: "Gedung A", capacity: 40, description: "Ruang kelas ber-AC untuk kegiatan perkuliahan dan diskusi kelompok." },
    { name: "Ruang Kelas A102", type: "kelas", location: "Gedung A", capacity: 40, description: "Ruang kelas dengan tata letak fleksibel untuk perkuliahan dan presentasi." },
    { name: "Ruang Kelas B201", type: "kelas", location: "Gedung B", capacity: 60, description: "Ruang kelas luas untuk perkuliahan, seminar kecil, dan kegiatan akademik." },
    { name: "Aula Utama", type: "aula", location: "Gedung C", capacity: 500, description: "Aula utama untuk acara kampus, seminar, dan kegiatan berskala besar." },
    { name: "Aula Mini", type: "aula", location: "Gedung B", capacity: 100, description: "Aula berkapasitas sedang untuk rapat, pelatihan, dan acara organisasi." },
    { name: "Lab Komputer 1", type: "lab", location: "Gedung A", capacity: 30, description: "Laboratorium komputer untuk praktikum, pelatihan, dan kegiatan pemrograman." },
    { name: "Lab Fisika", type: "lab", location: "Gedung B", capacity: 25, description: "Laboratorium dengan fasilitas praktikum untuk kegiatan pembelajaran fisika." },
    { name: "Lapangan Futsal", type: "lapangan", location: "Area Luar", capacity: 22, description: "Lapangan futsal luar ruang untuk olahraga dan kegiatan kemahasiswaan." },
    { name: "Lapangan Basket", type: "lapangan", location: "Area Luar", capacity: 20, description: "Lapangan basket kampus untuk latihan, pertandingan, dan aktivitas olahraga." },
    { name: "Proyektor Epson X1", type: "alat", location: "Gudang A", capacity: 1, description: "Proyektor portabel untuk mendukung presentasi dan kegiatan akademik." },
  ];
  for (const f of facilities) {
    await db.facility.upsert({
      where: { name: f.name },
      update: {},
      create: f,
    });
    await db.facility.updateMany({
      where: { name: f.name, description: null },
      data: { description: f.description },
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
