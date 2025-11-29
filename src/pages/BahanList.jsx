import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllBahan, deleteBahan } from "../lib/database";

export default function BahanList() {
  const [list, setList] = useState([]);
  const [sort, setSort] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    let b = await getAllBahan();

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
  }

  async function handleDelete(id) {
    if (!confirm("Yakin ingin menghapus bahan ini?")) return;
    await deleteBahan(id);
    load();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Bahan</h1>

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
          <button onClick={load} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
            Terapkan
          </button>
        </div>
      </div>

{/* List View */}
<div className="space-y-4">
  {list.map((b) => (
    <div
      key={b.id}
      className="flex items-center gap-4 p-4 rounded-xl shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
    >
      {/* Image */}
      <Link to={`/bahan/${b.id}`}>
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-lg overflow-hidden">
          {b.gambar ? (
            <img src={b.gambar} alt={b.nama} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl text-gray-400">📦</span>
          )}
        </div>
      </Link>

      {/* Text */}
      <Link to={`/bahan/${b.id}`} className="flex-1 block">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{b.nama}</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Stok: <span className="font-medium">{b.stok} {b.satuan}</span>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          to={`/bahan/${b.id}`}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg text-center transition-colors"
        >
          Edit
        </Link>
        <button
          onClick={() => handleDelete(b.id)}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Hapus
        </button>
      </div>
    </div>
  ))}
</div>


      {/* Empty State */}
      {list.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada bahan</h3>
          <p className="text-gray-500 dark:text-gray-400">Tambah bahan pertama Anda untuk memulai.</p>
        </div>
      )}

      {/* Floating Add Button - Mobile Only */}
      <Link
        to="/bahan/new"
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
      >
        <span className="text-2xl">+</span>
      </Link>
    </div>
  );
}
