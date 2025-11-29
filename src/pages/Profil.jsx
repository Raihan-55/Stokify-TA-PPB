import { useEffect, useState } from "react";

export default function Profil() {
  const [data, setData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("profil") || "{}");
    } catch (e) {
      return { nama: "", deskripsi: "" };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("profil", JSON.stringify(data));
    } catch (e) {}
  }, [data]);

  return (
    <div className="p-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Profil UMKM</h1>
      <div className="space-y-2">
        <input value={data.nama || ""} onChange={(e) => setData({ ...data, nama: e.target.value })} placeholder="Nama UMKM" className="border p-2 w-full" />
        <textarea value={data.deskripsi || ""} onChange={(e) => setData({ ...data, deskripsi: e.target.value })} placeholder="Deskripsi aplikasi / UMKM" className="border p-2 w-full" />
      </div>
    </div>
  );
}
