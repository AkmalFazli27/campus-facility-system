This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Setup Database Lokal (MySQL)

Prasyarat: MySQL 8+ berjalan (cek `mysql --version` atau service MySQL di Windows).

```bash
# 1) Buat database dev
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS campus_facility_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2) Isi env (Prisma CLI baca `.env`, Next.js baca `.env.local` juga)
cp .env.example .env.local
cp .env.example .env
# lalu isi DATABASE_URL + JWT_SECRET (min 32 karakter) di kedua file

# 3) Migration + seed
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed

# 4) Verifikasi
npx prisma studio
npm run dev # http://localhost:3000
```

Akun seed: `admin@example.com / Admin123!`, `officer@example.com / Officer123!`, `user@example.com / User123!`, `pending@example.com / User123!`.

Jangan commit `.env` / `.env.local`. Yang di-commit hanya `prisma/schema.prisma` + `prisma/migrations/` + `.env.example`.

## Setup Database Bersama / Staging (Aiven MySQL)

DB bersama hanya untuk integrasi dan demo. Dev harian tetap pakai MySQL lokal
(Free tier Aiven lambat dan koneksinya terbatas).

```bash
# 1) Simpan URL staging di file terpisah (tidak di-commit)
cp .env.example .env.staging.local
# isi DATABASE_URL staging, contoh:
# DATABASE_URL="mysql://campus_app:PASSWORD@HOST:PORT/campus_facility?ssl-mode=REQUIRED"

# 2) Terapkan migration yang sudah ada (jangan migrate dev ke staging)
$env:DATABASE_URL = "<isi-URL-staging>"
npx prisma migrate deploy
npm run db:seed  # sekali saja
```

Aturan DB bersama:
* Dilarang `npx prisma migrate reset` dan `npx prisma migrate dev` ke staging.
* Perubahan skema lewat lokal → PR → `develop` → `migrate deploy` ke staging.
* Kredensial staging hanya dibagikan via jalur private, tidak pernah di-commit.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
