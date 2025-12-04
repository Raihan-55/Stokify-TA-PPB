import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllTransaksiById, createTransaksi, updateTransaksi } from "../lib/database";
import { useLoading } from "../context/LoadingContext";
import useOnline from "../hooks/useOnline";
import Card from "../components/Card";
import Button from "../components/Button";
import { Calendar, DollarSign, Edit, Trash2, ArrowLeft } from "lucide-react";

function formatRupiah(value) {
  if (value == null || value === "") return "Rp 0";
  const n = Number(value);
  return n.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
}

export default function DetailKeuangan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [form, setForm] = useState({
    tipe: "pengeluaran",
    jumlah: 0,
    kategori: "lainnya",
    catatan: "",
    tanggal: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const { showLoading, hideLoading } = useLoading();
  useEffect(() => {
    if (!isNew) load();
  }, [id]);

  const online = useOnline();

  async function load() {
    showLoading();
    try {
      const t = await getAllTransaksiById(id);
      setForm(t);
    } finally {
      hideLoading();
    }
  }

  async function submit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (!form.jumlah || Number(form.jumlah) === 0) return setErrorMessage("Jumlah tidak boleh nol");
    if (!form.tanggal) return setErrorMessage("Tanggal harus diisi");

    let dataToSave = { ...form };
    if (form.tipe === "pemasukan") {
      dataToSave.kategori = ""; // atau "pemasukan"
    }
    setSaving(true);
    showLoading();
    try {
      if (!online) throw new Error("Offline: operasi simpan diblokir.");
      if (isNew) {
        await createTransaksi(form);
      } else {
        await updateTransaksi(id, form);
      }
      navigate("/keuangan");
    } catch (err) {
      setErrorMessage("Gagal menyimpan");
    } finally {
      setSaving(false);
      hideLoading();
    }
  }

  return (
    <div className="p-4 sm:p-6 animate-fadein">
      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
        <DollarSign size={28} className="text-blue-600" /> {isNew ? "Tambah Transaksi" : "Edit Transaksi"}
      </h1>

      <Card className="max-w-3xl mx-auto space-y-4">
        <form onSubmit={submit} className="space-y-4">
          {/* Date & Type Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Tanggal</label>
              <input
                type="datetime-local"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Tipe Transaksi</label>
              <div className="flex items-center gap-3">
                <label
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    form.tipe === "pemasukan" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {form.tipe === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
                </label>
                <select
                  value={form.tipe}
                  onChange={(e) => setForm({ ...form, tipe: e.target.value })}
                  className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pemasukan">Pemasukan</option>
                  <option value="pengeluaran">Pengeluaran</option>
                </select>
              </div>
            </div>
          </div>

          {/* Amount Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Jumlah</label>
              <input
                type="number"
                value={form.jumlah}
                onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
                placeholder="Jumlah"
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{form.jumlah ? formatRupiah(form.jumlah) : "Rp 0"}</div>
            </div>

            {form.tipe === "pengeluaran" && (
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2">Kategori</label>
                <select
                  value={form.kategori}
                  onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bahan">bahan</option>
                  <option value="gaji">gaji</option>
                  <option value="lainnya">lainnya</option>
                </select>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300 block mb-2">Catatan</label>
            <input
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              placeholder="Catatan (opsional)"
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" variant="primary" size="md" disabled={saving || !online} className="flex items-center gap-2">
              {saving ? (
                "Menyimpan..."
              ) : (
                <>
                  <Edit size={16} /> Simpan
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
