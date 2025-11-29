import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllTransaksi, deleteTransaksi, getSummaryBulanan, getSummaryHarian } from "../lib/database";

export default function ListKeuangan() {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState({ from: "", to: "", kategori: "" });
  const [summaryHarian, setSummaryHarian] = useState({});
  const [summaryBulanan, setSummaryBulanan] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const summaryBulanIni = summaryBulanan[currentMonthKey] || { pemasukan: 0, pengeluaran: 0 };

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setLoading(true);
    try {
      await Promise.all([load(), loadSummary()]);
    } catch (err) {
      setErrorMessage("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  async function load() {
    try {
      const t = await getAllTransaksi(filter);
      setList(t);
      setErrorMessage("");
    } catch (err) {
      setErrorMessage("Gagal memuat transaksi");
      throw err;
    }
  }

  async function loadSummary() {
    try {
      const [h, m] = await Promise.all([getSummaryHarian(), getSummaryBulanan()]);
      setSummaryHarian(h);
      setSummaryBulanan(m);
    } catch (err) {
      setErrorMessage("Gagal memuat ringkasan");
      throw err;
    }
  }

  async function doDelete(id) {
    if (!window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      return;
    }

    try {
      await deleteTransaksi(id);
      await Promise.all([load(), loadSummary()]);
      setErrorMessage("");
    } catch (err) {
      setErrorMessage("Gagal menghapus transaksi");
    }
  }

  async function applyFilter() {
    setLoading(true);
    try {
      await load();
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Keuangan</h1>
        <Link to="/keuangan/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors self-end sm:self-auto">
          Tambah Transaksi
        </Link>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 text-lg">💰</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pemasukan Bulan Ini</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">Rp {summaryBulanIni.pemasukan.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400 text-lg">💸</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pengeluaran Bulan Ini</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">Rp {summaryBulanIni.pengeluaran.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                summaryBulanIni.pemasukan - summaryBulanIni.pengeluaran >= 0 ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
              }`}
            >
              <span className={`text-lg ${summaryBulanIni.pemasukan - summaryBulanIni.pengeluaran >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>📊</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Bulan Ini</p>
              <p className={`text-xl font-bold ${summaryBulanIni.pemasukan - summaryBulanIni.pengeluaran >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                Rp {(summaryBulanIni.pemasukan - summaryBulanIni.pengeluaran).toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Filter Transaksi</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={filter.from}
              onChange={(e) => setFilter({ ...filter, from: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={filter.to}
              onChange={(e) => setFilter({ ...filter, to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
            <select
              value={filter.kategori}
              onChange={(e) => setFilter({ ...filter, kategori: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua</option>
              <option value="bahan">Bahan</option>
              <option value="gaji">Gaji</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={applyFilter} className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors">
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Riwayat Transaksi</h3>

        {list.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada transaksi</h3>
            <p className="text-gray-500 dark:text-gray-400">Tambah transaksi pertama Anda untuk memulai.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((t, index) => (
              <div
                key={t.id}
                className="relative flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 
                  border border-gray-200 dark:border-gray-700 shadow-sm 
                  hover:shadow-md transition-all"
              >
                {/* Timeline indicator */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${t.tipe === "pengeluaran" ? "bg-red-500" : "bg-green-500"}`} />
                  {index < list.length - 1 && <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 mt-2" />}
                </div>

                {/* Content */}
                <Link to={`/keuangan/${t.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        t.tipe === "pengeluaran" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      }`}
                    >
                      {t.tipe}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{t.kategori}</span>
                  </div>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(t.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </Link>

                {/* Harga + Tombol Hapus */}
                <div className="flex flex-col items-end gap-2">
                  <div className={`font-semibold text-lg ${t.tipe === "pengeluaran" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                    {t.tipe === "pengeluaran" ? "-" : "+"}Rp {t.jumlah.toLocaleString("id-ID")}
                  </div>

                  <button onClick={() => doDelete(t.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
