import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Foto laporan disimpan di Vercel Blob (URL absolut) saat produksi.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
