import Image from "next/image";
import logo from "@/components/assets/logo.svg";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";


export default function Navbar() {
  return (
    <nav className="max-w-screen min-h-15 bg-white flex flex-row justify-between items-center rounded-4xl  m-3 pr-3 pl-3 border-2 border-[#FFEDD5] shadow-lg shadow-[#FFEDD5]">
      <Image alt="logo" src={logo} className=""></Image>
      <div className="text-[#475569] text-m">
        <a className="m-3 items-center p-2 hover:bg-[#FFF7ED] hover:text-[#EA580C] transition-all cursor-pointer rounded-3xl">
          Beranda
        </a>
        <a className="m-3 items-center p-2 hover:bg-[#FFF7ED] hover:text-[#EA580C] transition-all cursor-pointer rounded-3xl">
          Fasilitas
        </a>
        <a className="m-3 items-center p-2 hover:bg-[#FFF7ED] hover:text-[#EA580C] transition-all cursor-pointer rounded-3xl">
          Tentang
        </a>
      </div>
      <div className="p-2">
        <Button variant={"ghost"} className="rounded-3xl m-2">
          Masuk
        </Button>
        <Button className="rounded-3xl p-5 bg-linear-to-r from-[#F97316] via-[#F59E0B] to-[#EA580C]">
          Daftar Akun <ArrowRight />{" "}
        </Button>
      </div>
    </nav>
  );
}
