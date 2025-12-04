import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllProduk, deleteProduk, updateStokProduk } from "../lib/database";
import { useLoading } from "../context/LoadingContext";
import useOnline from "../hooks/useOnline";
import { Trash2, Boxes, Plus } from "lucide-react";

export default function ProdukList() {
  const [list, setList] = useState([]);
  const [sort, setSort] = useState("");

  const { showLoading, hideLoading } = useLoading();
  useEffect(() => {
    load();
  }, [sort]);
  const [updatingId, setUpdatingId] = useState(null);
  const online = useOnline();

  async function load() {
    showLoading();
    try {
      let b = await getAllProduk();
      // Sorting
      if (sort === "stok-terbanyak") {
        b.sort((a, b) => b.stok - a.stok);
      } else if (sort === "stok-terendah") {
        b.sort((a, b) => a.stok - b.stok);
      } else if (sort === "nama-az") {
        b.sort((a, b) => a.nama.localeCompare(b.nama));
      } else if (sort === "nama-za") {
        b.sort((a, b) => b.nama.localeCompare(a.nama));
      }
      setList(b);
    } finally {
      hideLoading();
    }
  }

  async function handleDelete(id) {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    if (!online) return alert("Anda sedang offline — operasi hapus diblokir.");
    showLoading();
    try {
      await deleteProduk(id);
      await load();
    } finally {
      hideLoading();
    }
  }

  async function handleIncrease(id) {
    showLoading();
    try {
      setUpdatingId(id);
      await updateStokProduk(id, 1);
      await load();
    } catch (err) {
      console.error("Failed to increase stok produk", err);
    } finally {
      setUpdatingId(null);
      hideLoading();
    }
  }

  async function handleDecrease(id) {
    showLoading();
    try {
      setUpdatingId(id);
      await updateStokProduk(id, -1);
      await load();
    } catch (err) {
      console.error("Failed to decrease stok produk", err);
    } finally {
      setUpdatingId(null);
      hideLoading();
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Boxes size={28} className="text-green-600" /> Produk
        </h1>

        {/* Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Urutkan:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Default</option>
            <option value="stok-terbanyak">Stok Terbanyak</option>
            <option value="stok-terendah">Stok Terendah</option>
            <option value="nama-az">Nama A-Z</option>
            <option value="nama-za">Nama Z-A</option>
          </select>
          <Link to="/produk/new" className="hidden md:block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Tambah Produk
          </Link>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {list.map((b) => (
          <div
            key={b.id}
            className="rounded-xl shadow-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:scale-[1.01] transition-all duration-200 animate-fadein"
          >
            <Link to={`/produk/${b.id}`} className="block">
              {/* Image */}
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                {b.gambar ? <img src={b.gambar} alt={b.nama} className="w-full h-full object-cover" /> : <Boxes size={48} className="text-gray-400" />}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{b.nama}</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Stok:{" "}
                  <span className="font-medium">
                    {b.stok} {b.satuan}
                  </span>
                </div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">Rp {b.harga.toLocaleString("id-ID")}</div>
              </div>
            </Link>

            {/* Action Buttons + Stok Controls */}
            <div className="px-4 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updatingId !== b.id && handleDecrease(b.id)}
                  disabled={updatingId === b.id || !online}
                  className="w-8 h-8 flex justify-center items-center rounded border border-blue-500 text-blue-500 disabled:opacity-50"
                >
                  -
                </button>
                <div className="text-sm font-medium">
                  {b.stok} {b.satuan}
                </div>
                <button
                  onClick={() => updatingId !== b.id && handleIncrease(b.id)}
                  disabled={updatingId === b.id || !online}
                  className="w-8 h-8 flex justify-center items-center rounded border border-blue-500 text-blue-500 disabled:opacity-50"
                >
                  +
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(b.id)}
                  className="px-3 py-2 border border-red-600 text-red-600 text-sm font-medium rounded-lg transition-colors flex items-center gap-2
             hover:bg-red-600 hover:text-white"
                  disabled={!online}
                >
                  {" "}
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {list.length === 0 && (
        <div className="text-center py-12">
          <div className="mb-4 flex justify-center">
            <Boxes size={64} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada produk</h3>
          <p className="text-gray-500 dark:text-gray-400">Tambah produk pertama Anda untuk memulai.</p>
        </div>
      )}

      {/* Floating Add Button - Mobile Only */}
      <Link
        to="/produk/new"
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
      >
        <Plus size={24} />
      </Link>
    </div>
  );
}
