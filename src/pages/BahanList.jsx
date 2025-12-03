import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllBahan, deleteBahan, updateStokBahan } from "../lib/database";
import useOnline from "../hooks/useOnline";
import { Trash2, Package, Plus } from "lucide-react";

export default function BahanList() {
  const [list, setList] = useState([]);
  const [sort, setSort] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    load();
  }, [sort]);

  const online = useOnline();

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
    if (!online) return alert("Anda sedang offline — operasi hapus diblokir.");
    await deleteBahan(id);
    load();
  }

  async function handleIncrease(id) {
    try {
      setUpdatingId(id);
      await updateStokBahan(id, 1);
      await load();
    } catch (err) {
      console.error("Failed to increase stok", err);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDecrease(id) {
    try {
      setUpdatingId(id);
      await updateStokBahan(id, -1);
      await load();
    } catch (err) {
      console.error("Failed to decrease stok", err);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Package size={28} className="text-blue-600" /> Bahan
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
          {/* Tombol tambah (desktop) */}
          <Link to="/bahan/new" className="hidden md:block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Tambah Bahan
          </Link>
        </div>
      </div>

      {/* List View */}
      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((b) => (
          <div
            key={b.id}
            className="flex items-center gap-4 p-4 rounded-xl shadow-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-[1.01] transition-all duration-200 animate-fadein"
          >
            {/* Image */}
            <Link to={`/bahan/${b.id}`}>
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-lg overflow-hidden">
                {b.gambar ? <img src={b.gambar} alt={b.nama} className="w-full h-full object-cover" /> : <Package size={32} className="text-gray-400" />}
              </div>
            </Link>

            {/* Text */}
            <Link to={`/bahan/${b.id}`} className="flex-1 block self-start">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{b.nama}</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Stok:{" "}
                <span className="font-medium">
                  {b.stok} {b.satuan}
                </span>
              </div>
            </Link>

            {/* Actions + Stok Controls */}
            <div className="flex flex-col items-end gap-6">
              {/* Tombol Edit & Hapus */}
              <button
                onClick={() => handleDelete(b.id)}
                className="px-3 py-2 border border-red-600 text-red-600 text-sm font-medium rounded-lg transition-colors flex items-center gap-2
             hover:bg-red-600 hover:text-white"
              >
                {" "}
                <Trash2 size={16} />
              </button>
              {/* Tombol Stok (+ / -) */}
              <div className="flex items-center gap-2">
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
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {list.length === 0 && (
        <div className="text-center py-12">
          <div className="mb-4 flex justify-center">
            <Package size={64} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Belum ada bahan</h3>
          <p className="text-gray-500 dark:text-gray-400">Tambah bahan pertama Anda untuk memulai.</p>
        </div>
      )}

      {/* Floating Add Button - Mobile Only */}
      <Link
        to="/bahan/new"
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
      >
        <Plus size={24} />
      </Link>
    </div>
  );
}
