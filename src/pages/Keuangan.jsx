import { useEffect, useState } from "react";
import { getTransaksi, createTransaksi, deleteTransaksi, getSummaryBulanan, getSummaryHarian } from "../lib/database";

export default function Keuangan() {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState({ from: "", to: "", kategori: "" });
  const [form, setForm] = useState({ tipe: "keluar", jumlah: 0, kategori: "lainnya", catatan: "", tanggal: "" });
  const [summaryHarian, setSummaryHarian] = useState({});
  const [summaryBulanan, setSummaryBulanan] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
    loadSummary();
  }, []);

  async function load() {
    const t = await getTransaksi(filter);
    setList(t);
  }

  async function loadSummary() {
    const h = await getSummaryHarian();
    const m = await getSummaryBulanan();
    setSummaryHarian(h);
    setSummaryBulanan(m);
  }

  async function submit(e) {
    e.preventDefault();
    setErrorMessage("");
    // validation
    if (!form.jumlah || Number(form.jumlah) === 0) {
      setErrorMessage("Jumlah harus diisi dan tidak nol");
      return;
    }
    if (!form.tanggal) {
      setErrorMessage("Tanggal harus diisi");
      return;
    }
    setSaving(true);
    try {
      await createTransaksi(form);
      setForm({ tipe: "keluar", jumlah: 0, kategori: "lainnya", catatan: "", tanggal: "" });
      load();
      loadSummary();
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal menyimpan transaksi");
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(id) {
    try {
      await deleteTransaksi(id);
      load();
      loadSummary();
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal menghapus transaksi");
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Keuangan</h1>

      <form onSubmit={submit} className="space-y-2 border p-3 rounded mb-4">
        <select value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })} className="border p-2 w-full">
          <option value="keluar">Keluar</option>
          <option value="masuk">Masuk</option>
        </select>
        <input type="number" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} placeholder="Jumlah" className="border p-2 w-full" />
        <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} className="border p-2 w-full">
          <option value="bahan">bahan</option>
          <option value="gaji">gaji</option>
          <option value="lainnya">lainnya</option>
        </select>
        <input value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} placeholder="Catatan" className="border p-2 w-full" />
        <input type="datetime-local" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="border p-2 w-full" />
        <div className="flex gap-2">
          <button disabled={saving} className="border p-2 rounded bg-blue-500 text-white">
            {saving ? "Menyimpan..." : "Tambah"}
          </button>
        </div>
        {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}
      </form>

      <div className="mb-4">
        <h3 className="font-semibold">Filter</h3>
        <div className="flex gap-2 mt-2">
          <input type="date" value={filter.from} onChange={(e) => setFilter({ ...filter, from: e.target.value })} className="border p-2" />
          <input type="date" value={filter.to} onChange={(e) => setFilter({ ...filter, to: e.target.value })} className="border p-2" />
          <select value={filter.kategori} onChange={(e) => setFilter({ ...filter, kategori: e.target.value })} className="border p-2">
            <option value="">Semua</option>
            <option value="bahan">bahan</option>
            <option value="gaji">gaji</option>
            <option value="lainnya">lainnya</option>
          </select>
          <button onClick={load} className="border p-2 rounded">
            Apply
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">Total Harian & Bulanan</h3>
        <div className="mt-2">Harian: {JSON.stringify(summaryHarian)}</div>
        <div className="mt-2">Bulanan: {JSON.stringify(summaryBulanan)}</div>
      </div>

      <div className="space-y-2">
        {list.map((t) => (
          <div key={t.id} className="border p-2 rounded">
            <div>
              {t.tipe} - {t.kategori}
            </div>
            <div>{new Date(t.tanggal).toLocaleString()}</div>
            <div>Rp {t.jumlah}</div>
            <div className="mt-2 flex gap-2">
              <button onClick={() => doDelete(t.id)} className="border p-1 rounded bg-red-500 text-white">
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
