import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getAllTransaksi } from "../lib/database";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFF", "#FF6699"];

const BULAN_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function ChartPengeluaran({ summaryBulanIni }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [allTransactions, setAllTransactions] = useState([]);

  useEffect(() => {
    async function loadAllTransactions() {
      const semua = await getAllTransaksi();
      setAllTransactions(semua);
    }
    loadAllTransactions();
  }, []);

  useEffect(() => {
    async function load() {
      setIsLoading(true);

      // Filter pengeluaran berdasarkan bulan dan tahun yang dipilih
      const pengeluaranBulanTerpilih = allTransactions.filter((t) => {
        const tanggal = new Date(t.tanggal);
        return t.tipe === "pengeluaran" && tanggal.getMonth() === selectedMonth && tanggal.getFullYear() === selectedYear;
      });

      // Group by kategori
      const kategoriMap = {};
      for (const t of pengeluaranBulanTerpilih) {
        kategoriMap[t.kategori] = (kategoriMap[t.kategori] || 0) + t.jumlah;
      }

      const arr = Object.keys(kategoriMap).map((kategori) => ({
        name: kategori,
        value: kategoriMap[kategori],
      }));

      setData(arr);
      setIsLoading(false);
    }

    if (allTransactions.length > 0) {
      load();
    }
  }, [selectedMonth, selectedYear, allTransactions]);

  // Hitung summary untuk bulan yang dipilih
  const summaryBulanTerpilih = (() => {
    const now = new Date();
    if (selectedMonth === now.getMonth() && selectedYear === now.getFullYear()) {
      return summaryBulanIni;
    }

    // Jika bukan bulan ini, hitung ulang
    const transaksisBulanTerpilih = allTransactions.filter((t) => {
      const tanggal = new Date(t.tanggal);
      return tanggal.getMonth() === selectedMonth && tanggal.getFullYear() === selectedYear;
    });

    const pemasukan = transaksisBulanTerpilih.filter((t) => t.tipe === "pemasukan").reduce((sum, t) => sum + t.jumlah, 0);

    const pengeluaran = transaksisBulanTerpilih.filter((t) => t.tipe === "pengeluaran").reduce((sum, t) => sum + t.jumlah, 0);

    return { pemasukan, pengeluaran };
  })();

  const total = data.reduce((a, b) => a + b.value, 0);
  const saldo = summaryBulanTerpilih.pemasukan - summaryBulanTerpilih.pengeluaran;

  // Generate tahun options (5 tahun terakhir hingga tahun ini)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (isLoading) return <div className="text-center py-8 text-gray-400">Loading...</div>;

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
      {/* Chart Pengeluaran */}
      <div className="lg:col-span-2 rounded-xl shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Grafik Pengeluaran</h2>

          {/* Filter Bulan dan Tahun */}
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {BULAN_NAMES.map((bulan, index) => (
                <option key={index} value={index}>
                  {bulan}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            Belum ada pengeluaran pada {BULAN_NAMES[selectedMonth]} {selectedYear}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart className="chart-container">
              <Pie data={data} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" nameKey="name" labelLine={false}>
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `Rp ${value.toLocaleString("id-ID")}`} contentStyle={{ borderRadius: "10px", padding: "6px 10px" }} />
              <Legend verticalAlign="bottom" height={30} iconSize={12} wrapperStyle={{ paddingTop: "10px" }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* Ringkasan Pemasukan/Pengeluaran/Saldo */}
      <div className="rounded-xl shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 flex flex-col justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          Pemasukan ({BULAN_NAMES[selectedMonth]} {selectedYear})
        </p>
        <p className="text-3xl font-bold text-green-600 dark:text-green-400">Rp {summaryBulanTerpilih.pemasukan.toLocaleString("id-ID")}</p>

        <hr className="my-3 border-gray-300 dark:border-gray-700" />

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          Pengeluaran ({BULAN_NAMES[selectedMonth]} {selectedYear})
        </p>
        <p className="text-xl font-bold text-red-600 dark:text-red-400">Rp {summaryBulanTerpilih.pengeluaran.toLocaleString("id-ID")}</p>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Saldo ({BULAN_NAMES[selectedMonth]} {selectedYear})
        </p>
        <p className={`text-2xl font-bold ${saldo >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>Rp {saldo.toLocaleString("id-ID")}</p>
      </div>
    </div>
  );
}
