import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBahanById, updateBahan, deleteBahan, updateStokBahan, createBahan } from "../lib/database";
import { uploadImage, deleteImage } from "../lib/storage";

// Reusable input field
function InputField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      {label && <label className="text-sm font-semibold block mb-1">{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="border p-2 w-full dark:bg-gray-700 dark:text-white" />
    </div>
  );
}

// Component untuk kontrol stok
function StokControl({ stok, satuan, onChange, harga, supplier }) {
  return (
    <div className="mt-4 border p-2 rounded dark:bg-gray-800">
      <h3 className="font-semibold mb-2">Atur Stok</h3>
      <div className="flex items-center gap-4">
        <button onClick={() => onChange(-1)} className="w-10 h-10 flex items-center justify-center text-xl border rounded bg-red-500 text-white">
          -
        </button>
        <div className="text-lg font-bold">
          {stok} {satuan}
        </div>
        <button onClick={() => onChange(1)} className="w-10 h-10 flex items-center justify-center text-xl border rounded bg-green-500 text-white">
          +
        </button>
      </div>
      <div className="mt-4">Harga beli rata-rata: Rp {harga}</div>
      <div>Supplier: {supplier}</div>
    </div>
  );
}

export default function BahanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [item, setItem] = useState({
    nama: "",
    stok: 0,
    satuan: "",
    harga_beli_rata: 0,
    supplier: "",
    gambar: "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (id && !isNew) load();
  }, [id]);

  async function load() {
    const b = await getBahanById(id);
    setItem(b);
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrorMessage("");
    try {
      const imageUrl = await uploadImage(file, "bahan");
      setItem((prev) => ({ ...prev, gambar: imageUrl }));
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal upload gambar");
    } finally {
      setUploading(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    if (!item.nama.trim() || !item.satuan.trim()) {
      setErrorMessage("Nama dan Satuan harus diisi");
      return;
    }
    setSaving(true);
    try {
      if (isNew) await createBahan(item);
      else await updateBahan(id, item);
      setSuccessMessage(isNew ? "Bahan berhasil dibuat" : "Perubahan tersimpan");
      navigate("/bahan");
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  }

  async function doUpdateStok(delta) {
    if (isNew || !id) return;
    await updateStokBahan(id, delta);
    load();
  }

  async function doDelete() {
    if (isNew) return;
    if (item.gambar) {
      try {
        await deleteImage(item.gambar, "bahan");
      } catch (err) {
        console.error("Gagal hapus gambar", err);
      }
    }
    try {
      await deleteBahan(id);
      navigate("/bahan");
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal menghapus bahan");
    }
  }

  // Input fields config
  const fields = [
    { key: "nama", placeholder: "Nama" },
    { key: "satuan", placeholder: "Satuan" },
    { key: "supplier", placeholder: "Supplier" },
    { key: "harga_beli_rata", placeholder: "Harga beli rata-rata", type: "number" },
  ];

  return (
    <div className="p-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">{isNew ? "Tambah Bahan" : "Detail Bahan"}</h1>

      {/* Image */}
      {item.gambar && (
        <div className="mb-4 border rounded p-2">
          <img src={item.gambar} alt={item.nama} className="w-40 h-40 object-cover rounded" />
        </div>
      )}
      <div className="border p-2 rounded bg-gray-50 dark:bg-gray-800 mb-2">
        <label className="text-sm font-semibold block mb-2">Gambar Bahan</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="border p-2 w-full text-sm dark:bg-gray-700 dark:text-white" />
        {uploading && <p className="text-sm text-blue-500 mt-2">Uploading...</p>}
      </div>

      <form onSubmit={save} className="space-y-2">
        {fields.map((f) => (
          <InputField key={f.key} value={item[f.key]} onChange={(e) => setItem({ ...item, [f.key]: e.target.value })} placeholder={f.placeholder} type={f.type || "text"} />
        ))}

        <div className="flex gap-2">
          <button disabled={saving} className="border p-2 rounded bg-blue-500 text-white">
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
          {!isNew && (
            <button type="button" onClick={doDelete} className="border p-2 rounded bg-red-500 text-white">
              Hapus
            </button>
          )}
        </div>

        {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}
        {successMessage && <div className="text-sm text-green-600">{successMessage}</div>}
      </form>

      {!isNew && <StokControl stok={item.stok} satuan={item.satuan} onChange={doUpdateStok} harga={item.harga_beli_rata} supplier={item.supplier} />}
    </div>
  );
}
