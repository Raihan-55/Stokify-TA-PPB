import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProdukById, updateProduk, deleteProduk, updateStokProduk, createProduk } from "../lib/database";
import { useLoading } from "../context/LoadingContext";
import useOnline from "../hooks/useOnline";
import { uploadImage, deleteImage } from "../lib/storage";
import Card from "../components/Card";
import Button from "../components/Button";
import { Trash2, Upload, Plus, Minus, Boxes } from "lucide-react";

// Reusable input field
function InputField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      {label && <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-200">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="border border-gray-200 dark:border-gray-700 p-2 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
    </div>
  );
}

// Component untuk kontrol stok
function StokControl({ stok, satuan, onChange, harga, resep }) {
  return (
    <Card className="mt-2 space-y-3">
      <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <Boxes size={20} /> Atur Stok
      </h3>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(-1)} className="rounded-lg px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-all flex items-center gap-2">
          <Minus size={16} />
        </button>
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {stok} {satuan}
        </div>
        <button onClick={() => onChange(1)} className="rounded-lg px-3 py-2 bg-green-600 text-white hover:bg-green-700 transition-all flex items-center gap-2">
          <Plus size={16} />
        </button>
      </div>
      <div className="pt-2 space-y-1 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium">Harga produk:</span> {formatRupiah(harga)}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium">Resep:</span> {resep}
        </div>
      </div>
    </Card>
  );
}

function formatRupiah(value) {
  if (value == null || value === "") return "Rp 0";
  const n = Number(value);
  return n.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
}

export default function ProdukDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [item, setItem] = useState({
    nama: "",
    stok: 0,
    satuan: "",
    harga: 0,
    resep: "",
    gambar: "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { showLoading, hideLoading } = useLoading();
  useEffect(() => {
    if (id && !isNew) load();
  }, [id]);

  const online = useOnline();

  async function load() {
    showLoading();
    try {
      const b = await getProdukById(id);
      setItem(b);
    } finally {
      hideLoading();
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!online) return setErrorMessage("Anda sedang offline — upload gambar diblokir.");
    setUploading(true);
    setErrorMessage("");
    try {
      const imageUrl = await uploadImage(file, "produk");
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
    showLoading();
    try {
      if (!online) throw new Error("Offline: operasi simpan diblokir.");
      if (isNew) await createProduk(item);
      else await updateProduk(id, item);
      setSuccessMessage(isNew ? "Produk berhasil dibuat" : "Perubahan tersimpan");
      navigate("/produk");
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal menyimpan data");
    } finally {
      setSaving(false);
      hideLoading();
    }
  }

  async function doUpdateStok(delta) {
    if (isNew || !id) return;
    if (!online) return setErrorMessage("Anda sedang offline — operasi stok diblokir.");
    showLoading();
    try {
      await updateStokProduk(id, delta);
      await load();
    } finally {
      hideLoading();
    }
  }

  async function doDelete() {
    if (isNew) return;
    showLoading();
    if (item.gambar) {
      try {
        await deleteImage(item.gambar, "produk");
      } catch (err) {
        console.error("Gagal hapus gambar", err);
      }
    }
    try {
      if (!online) return setErrorMessage("Anda sedang offline — operasi hapus diblokir.");
      await deleteProduk(id);
      navigate("/produk");
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal menghapus produk");
    } finally {
      hideLoading();
    }
  }

  // Input fields config
  const fields = [
    { key: "nama", placeholder: "Nama" },
    { key: "stok", placeholder: "Stok", type: "number" },
    { key: "satuan", placeholder: "Satuan" },
    { key: "harga", placeholder: "Harga", type: "number" },
  ];

  return (
    <div className="p-4 sm:p-6 animate-fadein">
      <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
        <Boxes size={28} className="text-green-600" /> {isNew ? "Tambah Produk" : "Detail Produk"}
      </h1>

      <Card className="max-w-5xl mx-auto space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="flex flex-col gap-4">
            <div className="w-full bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center h-56 md:h-64">
              {item.gambar ? <img src={item.gambar} alt={item.nama} className="w-full h-full object-cover" /> : <Boxes size={64} className="text-gray-400" />}
            </div>

            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Gambar Produk</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm cursor-pointer">
                <Upload size={16} />
                <span>{uploading ? "Uploading..." : "Pilih Gambar"}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
              </label>
              {item.gambar && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm("Hapus gambar?")) return;
                    try {
                      await deleteImage(item.gambar, "produk");
                      setItem((prev) => ({ ...prev, gambar: "" }));
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="px-3 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <form onSubmit={save} className="flex-1 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((f) => (
                  <InputField
                    key={f.key}
                    label={f.placeholder}
                    value={item[f.key]}
                    onChange={(e) => setItem({ ...item, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    type={f.type || "text"}
                  />
                ))}
              </div>

              <div>
                <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-200">Resep / Bahan</label>
                <textarea
                  value={item.resep}
                  onChange={(e) => setItem({ ...item, resep: e.target.value })}
                  placeholder="Resep / bahan penyusun (text)"
                  className="border border-gray-200 dark:border-gray-700 p-2 w-full rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows="4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-300">{errorMessage && <span className="text-sm text-red-600">{errorMessage}</span>}</div>
                <div className="flex items-center gap-3">
                  {!isNew && (
                    <Button variant="danger" size="md" onClick={doDelete} disabled={!online}>
                      <Trash2 size={16} className="mr-2" /> Hapus
                    </Button>
                  )}
                  <Button type="submit" variant="primary" size="md" disabled={saving || !online}>
                    {saving ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </div>
            </form>

            {!isNew && <StokControl stok={item.stok} satuan={item.satuan} onChange={doUpdateStok} harga={item.harga} resep={item.resep} />}
          </div>
        </div>
      </Card>
    </div>
  );
}
