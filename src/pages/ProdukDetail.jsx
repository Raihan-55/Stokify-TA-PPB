import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProdukById, updateProduk, deleteProduk, updateStokProduk, createProduk } from "../lib/database";
import { uploadImage, deleteImage } from "../lib/storage";

export default function ProdukDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [item, setItem] = useState({ nama: "", stok: 0, satuan: "", harga: 0, resep: "", gambar: "" });
  const [stokChange, setStokChange] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && !isNew) load();
  }, [id]);

  async function load() {
    const b = await getProdukById(id);
    setItem(b);
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMessage("");
    try {
      const imageUrl = await uploadImage(file, "produk");
      setItem({ ...item, gambar: imageUrl });
      setImageFile(null);
    } catch (error) {
      console.error("Failed to upload image:", error);
      setErrorMessage("Gagal upload gambar");
    } finally {
      setUploading(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    if (!item.nama || String(item.nama).trim() === "") {
      setErrorMessage("Nama harus diisi");
      return;
    }
    if (!item.satuan || String(item.satuan).trim() === "") {
      setErrorMessage("Satuan harus diisi");
      return;
    }
    setSaving(true);
    if (isNew) {
      try {
        await createProduk(item);
        setSuccessMessage("Produk berhasil dibuat");
      } catch (err) {
        console.error(err);
        setErrorMessage("Gagal menyimpan produk");
        setSaving(false);
        return;
      }
    } else {
      try {
        await updateProduk(id, item);
        setSuccessMessage("Perubahan tersimpan");
      } catch (err) {
        console.error(err);
        setErrorMessage("Gagal mengupdate produk");
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    navigate("/produk");
  }

  async function doUpdateStok(delta) {
    if (isNew || !id) return;
    await updateStokProduk(id, delta);
    load();
  }

  async function doDelete() {
    if (!isNew) {
      // Delete image first if it exists
      if (item.gambar) {
        try {
          await deleteImage(item.gambar, "produk");
        } catch (err) {
          console.error("Failed to delete image", err);
        }
      }
      try {
        await deleteProduk(id);
        navigate("/produk");
      } catch (err) {
        console.error(err);
        setErrorMessage("Gagal menghapus produk");
      }
    }
  }

  return (
    <div className="p-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">{isNew ? "Tambah Produk" : "Detail Produk"}</h1>

      {/* Image Preview */}
      {item.gambar && (
        <div className="mb-4 border rounded p-2">
          <img src={item.gambar} alt={item.nama} className="w-40 h-40 object-cover rounded" />
        </div>
      )}

      <form onSubmit={save} className="space-y-2">
        {/* Image Upload */}
        <div className="border p-2 rounded bg-gray-50 dark:bg-gray-800">
          <label className="text-sm font-semibold block mb-2">Gambar Produk</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="border p-2 w-full text-sm dark:bg-gray-700 dark:text-white" />
          {uploading && <p className="text-sm text-blue-500 mt-2">Uploading...</p>}
        </div>

        <input value={item.nama} onChange={(e) => setItem({ ...item, nama: e.target.value })} placeholder="Nama" className="border p-2 w-full dark:bg-gray-700 dark:text-white" />

        <div className="flex gap-2">
          <input value={item.stok} type="number" onChange={(e) => setItem({ ...item, stok: e.target.value })} className="border p-2 w-1/2 dark:bg-gray-700 dark:text-white" placeholder="Stok" />
          <input value={item.satuan} onChange={(e) => setItem({ ...item, satuan: e.target.value })} className="border p-2 w-1/2 dark:bg-gray-700 dark:text-white" placeholder="Satuan" />
        </div>

        <input value={item.harga} type="number" onChange={(e) => setItem({ ...item, harga: e.target.value })} className="border p-2 w-full dark:bg-gray-700 dark:text-white" placeholder="Harga" />

        <textarea
          value={item.resep}
          onChange={(e) => setItem({ ...item, resep: e.target.value })}
          className="border p-2 w-full dark:bg-gray-700 dark:text-white"
          placeholder="Resep / bahan penyusun (text)"
        />

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

      {!isNew && (
        <div className="mt-4 border p-2 rounded dark:bg-gray-800">
          <h3 className="font-semibold mb-2">Atur Stok</h3>

          <div className="flex items-center gap-4">
            <button onClick={() => doUpdateStok(-1)} className="w-10 h-10 flex items-center justify-center text-xl border rounded bg-red-500 text-white">
              -
            </button>

            <div className="text-lg font-bold">
              {item.stok} {item.satuan}
            </div>

            <button onClick={() => doUpdateStok(1)} className="w-10 h-10 flex items-center justify-center text-xl border rounded bg-green-500 text-white">
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
