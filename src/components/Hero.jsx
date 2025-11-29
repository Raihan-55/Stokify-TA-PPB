import React from "react";

export default function Hero({ profilData }) {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white p-6 lg:p-8 rounded-2xl shadow-lg overflow-hidden">
      <div className="relative z-10 max-w-2xl">
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Dashboard UMKM</h1>
        <p className="mt-3 text-base lg:text-lg opacity-90">
          Kelola bahan, produk, dan transaksi keuangan UMKM Anda dalam satu dashboard sederhana.
        </p>
      </div>

      <div className="hidden md:flex absolute right-4 bottom-0 opacity-10 text-[60px] lg:text-[100px] font-black select-none pointer-events-none">
        {profilData.nama || "UMKM"}
      </div>
    </div>
  );
}
