import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllTransaksiById, createTransaksi, updateTransaksi } from "../lib/database";

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

  useEffect(() => {
    if (!isNew) load();
  }, [id]);

  async function load() {
    const t = await getAllTransaksiById(id);
    setForm(t);
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

    try {
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
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{isNew ? "Tambah Transaksi" : "Edit Transaksi"}</h1>

      <form onSubmit={submit} className="space-y-2 border p-3 rounded mb-4">
        <select value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })} className="border p-2 w-full">
          <option value="pemasukan">Pemasukan</option>
          <option value="pengeluaran">Pengeluaran</option>
        </select>

        <input type="number" value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} placeholder="Jumlah" className="border p-2 w-full" />

        {form.tipe === "pengeluaran" && (
          <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} className="border p-2 w-full">
            <option value="bahan">bahan</option>
            <option value="gaji">gaji</option>
            <option value="lainnya">lainnya</option>
          </select>
        )}

        <input value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} placeholder="Catatan" className="border p-2 w-full" />

        <input type="datetime-local" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="border p-2 w-full" />

        {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

        <button disabled={saving} className="border p-2 rounded bg-blue-500 text-white">
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </div>
  );
}
