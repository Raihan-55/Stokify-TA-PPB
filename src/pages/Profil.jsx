import { useEffect, useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import { User, Info, Mail, Phone, Globe, ImagePlus, RefreshCcw, Save } from "lucide-react";

export default function Profil() {
  const [data, setData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("profil") || "{}");
    } catch (e) {
      return { nama: "", deskripsi: "", logo: "", email: "", telepon: "", website: "" };
    }
  });

  const [previewLogo, setPreviewLogo] = useState(data.logo || "");

  useEffect(() => {
    try {
      localStorage.setItem("profil", JSON.stringify(data));
    } catch (e) {}
  }, [data]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewLogo(reader.result);
      setData({ ...data, logo: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    const empty = { nama: "", deskripsi: "", logo: "", email: "", telepon: "", website: "" };
    setData(empty);
    setPreviewLogo("");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fadein">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
        <User size={28} className="text-blue-600" /> Profil UMKM
      </h1>

      <Card className="space-y-6 flex flex-col items-center hover:shadow-lg hover:scale-[1.01] transition-all">
        {/* Logo & Preview */}
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
          <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
            {previewLogo ? <img src={previewLogo} alt="Logo" className="w-full h-full object-cover" /> : <ImagePlus className="text-gray-400" size={48} />}
          </div>
          <div className="flex-1 space-y-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Info size={16} /> Upload Logo
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="mt-1 block w-full text-sm text-gray-700 dark:text-gray-300 file:border file:border-gray-300 dark:file:border-gray-600 file:rounded-lg file:px-3 file:py-2 file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-gray-600 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Nama & Deskripsi */}
        <div className="space-y-4 w-full">
          <div>
            <label className="flex text-sm font-medium text-gray-700 dark:text-gray-300 items-center gap-2">
              <User size={16} /> Nama UMKM
            </label>
            <input
              value={data.nama || ""}
              onChange={(e) => setData({ ...data, nama: e.target.value })}
              placeholder="Nama UMKM"
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="flex text-sm font-medium text-gray-700 dark:text-gray-300 items-center gap-2">
              <Info size={16} /> Deskripsi UMKM
            </label>
            <textarea
              value={data.deskripsi || ""}
              onChange={(e) => setData({ ...data, deskripsi: e.target.value })}
              placeholder="Deskripsi aplikasi / UMKM"
              rows={3}
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Info Kontak */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div>
            <label className="flex text-sm font-medium text-gray-700 dark:text-gray-300 items-center gap-2">
              <Mail size={16} /> Email
            </label>
            <input
              value={data.email || ""}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              placeholder="email@example.com"
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="flex text-sm font-medium text-gray-700 dark:text-gray-300 items-center gap-2">
              <Phone size={16} /> Telepon
            </label>
            <input
              value={data.telepon || ""}
              onChange={(e) => setData({ ...data, telepon: e.target.value })}
              placeholder="0812xxxxxxx"
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="flex text-sm font-medium text-gray-700 dark:text-gray-300 items-center gap-2">
              <Globe size={16} /> Website
            </label>
            <input
              value={data.website || ""}
              onChange={(e) => setData({ ...data, website: e.target.value })}
              placeholder="https://example.com"
              className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Tombol aksi */}
        <div className="flex justify-end gap-3 w-full">
          <Button onClick={handleReset} variant="secondary" size="md" className="flex items-center gap-2">
            <RefreshCcw size={16} /> Reset
          </Button>
          <Button onClick={() => alert("Profil disimpan!")} variant="primary" size="md" className="flex items-center gap-2">
            <Save size={16} /> Simpan
          </Button>
        </div>
      </Card>
    </div>
  );
}
