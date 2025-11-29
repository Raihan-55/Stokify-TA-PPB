import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllBahan, getAllProduk, getTransaksi } from "../lib/database";
import ChartPengeluaran from "../components/ChartPengeluaran";

export default function Home() {
  const [bahanCount, setBahanCount] = useState(0);
  const [produkCount, setProdukCount] = useState(0);
  const [recent, setRecent] = useState([]);

  const [bahanMap, setBahanMap] = useState({});
  const [produkMap, setProdukMap] = useState({});

  useEffect(() => {
    async function load() {
      const b = await getAllBahan();
      setBahanCount(b.length);

      const bMap = {};
      b.forEach((i) => (bMap[i.id] = i));
      setBahanMap(bMap);

      const p = await getAllProduk();
      setProdukCount(p.length);

      const pMap = {};
      p.forEach((i) => (pMap[i.id] = i));
      setProdukMap(pMap);

      const t = await getTransaksi();
      setRecent(t.slice(0, 5));
    }
    load();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* HERO SECTION */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white p-6 lg:p-8 rounded-2xl shadow-lg overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Dashboard UMKM</h1>
          <p className="mt-3 text-base lg:text-lg opacity-90">Kelola bahan, produk, dan transaksi keuangan UMKM Anda dalam satu dashboard sederhana.</p>
        </div>
        <div className="absolute right-4 top-4 opacity-10 text-[60px] lg:text-[100px] font-black select-none pointer-events-none">UMKM</div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-400 text-xl">📦</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Bahan</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{bahanCount}</p>
        </div>

        <div className="rounded-xl shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <span className="text-green-600 dark:text-green-400 text-xl">🛍️</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Produk</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{produkCount}</p>
        </div>
      </div>

      {/* ACTION BUTTONS - Stack on mobile, row on larger screens */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Link to="/bahan/new" className="px-4 sm:px-5 py-2.5 sm:py-2 rounded-lg sm:rounded-xl bg-blue-600 text-white text-sm sm:text-base shadow hover:bg-blue-700 transition duration-200 text-center">
          Tambah Bahan
        </Link>
        <Link
          to="/produk/new"
          className="px-4 sm:px-5 py-2.5 sm:py-2 rounded-lg sm:rounded-xl bg-green-600 text-white text-sm sm:text-base shadow hover:bg-green-700 transition duration-200 text-center"
        >
          Tambah Produk
        </Link>
        <Link
          to="/keuangan"
          className="px-4 sm:px-5 py-2.5 sm:py-2 rounded-lg sm:rounded-xl bg-purple-600 text-white text-sm sm:text-base shadow hover:bg-purple-700 transition duration-200 text-center"
        >
          Tambah Transaksi
        </Link>
      </div>

      {/* CHART PENGELUARAN */}
      <div className="rounded-xl shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-center text-lg font-semibold mb-4 text-gray-900 dark:text-white">Grafik Pengeluaran</h2>
        <div className="overflow-x-auto">
          <ChartPengeluaran />
        </div>
      </div>

      {/* RECENT TRANSACTIONS - Activity Feed */}
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Aktivitas Terbaru</h2>

      <div className="space-y-3">
        {recent.map((r, index) => (
          <div key={r.id} className="relative flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            {/* Timeline indicator */}
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full ${r.tipe === "pengeluaran" ? "bg-red-500" : "bg-green-500"}`}></div>
              {index < recent.length - 1 && <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 mt-2"></div>}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    r.tipe === "pengeluaran" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  }`}
                >
                  {r.tipe}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{r.kategori}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(r.tanggal).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className={`font-semibold text-lg ${r.tipe === "pengeluaran" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                  {r.tipe === "pengeluaran" ? "-" : "+"}Rp {r.jumlah.toLocaleString("id-ID")}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {recent.length === 0 && <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">Belum ada transaksi terbaru</div>}
    </div>
  );
}
