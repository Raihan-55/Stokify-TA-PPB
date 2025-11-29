import { supabase } from "./supabase";

// Bahan
export async function getAllBahan() {
  const { data, error } = await supabase.from("bahan").select("*").order("id", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getBahanById(id) {
  if (id === undefined || id === null) throw new Error("getBahanById: id is required");
  const { data, error } = await supabase.from("bahan").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

/**
 * Create a new bahan
 * @param {Object} data - { nama, stok, satuan, harga_beli_rata, supplier, gambar? }
 */
export async function createBahan(data) {
  const { data: d, error } = await supabase.from("bahan").insert([data]).select();
  if (error) throw error;
  return d[0];
}

/**
 * Update a bahan
 * @param {number} id
 * @param {Object} data - { nama?, stok?, satuan?, harga_beli_rata?, supplier?, gambar? }
 */
export async function updateBahan(id, data) {
  const { data: d, error } = await supabase.from("bahan").update(data).eq("id", id).select();
  if (error) throw error;
  return d[0];
}

export async function deleteBahan(id) {
  const { error } = await supabase.from("bahan").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function updateStokBahan(id, jumlah) {
  if (id === undefined || id === null) throw new Error("updateStokBahan: id is required");
  // jumlah can be positive or negative
  const bahan = await getBahanById(id);
  const newStok = (Number(bahan.stok) || 0) + Number(jumlah);
  return updateBahan(id, { stok: newStok });
}

// Produk
export async function getAllProduk() {
  const { data, error } = await supabase.from("produk").select("*").order("id", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProdukById(id) {
  if (id === undefined || id === null) throw new Error("getProdukById: id is required");
  const { data, error } = await supabase.from("produk").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

/**
 * Create a new produk
 * @param {Object} data - { nama, stok, satuan, harga, resep?, gambar? }
 */
export async function createProduk(data) {
  const { data: d, error } = await supabase.from("produk").insert([data]).select();
  if (error) throw error;
  return d[0];
}

/**
 * Update a produk
 * @param {number} id
 * @param {Object} data - { nama?, stok?, satuan?, harga?, resep?, gambar? }
 */
export async function updateProduk(id, data) {
  const { data: d, error } = await supabase.from("produk").update(data).eq("id", id).select();
  if (error) throw error;
  return d[0];
}

export async function deleteProduk(id) {
  const { error } = await supabase.from("produk").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function updateStokProduk(id, jumlah) {
  if (id === undefined || id === null) throw new Error("updateStokProduk: id is required");
  const produk = await getProdukById(id);
  const newStok = (Number(produk.stok) || 0) + Number(jumlah);
  return updateProduk(id, { stok: newStok });
}

// Keuangan
export async function getTransaksi(filter = {}) {
  // filter: { from, to, kategori }
  let q = supabase.from("keuangan").select("*").order("tanggal", { ascending: false });
  if (filter.kategori) q = q.eq("kategori", filter.kategori);
  if (filter.from) q = q.gte("tanggal", filter.from);
  if (filter.to) q = q.lte("tanggal", filter.to);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}
export async function getTransaksiById(id) {
  const { data, error } = await supabase.from("keuangan").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function updateTransaksi(id, update) {
  const { error } = await supabase.from("keuangan").update(update).eq("id", id);
  if (error) throw error;
}

export async function createTransaksi(data) {
  const { data: d, error } = await supabase.from("keuangan").insert([data]).select();
  if (error) throw error;
  return d[0];
}

export async function deleteTransaksi(id) {
  const { error } = await supabase.from("keuangan").delete().eq("id", id);
  if (error) throw error;
  return true;
}
export async function getPengeluaranByKategori() {
  const { data, error } = await supabase
    .from("keuangan")
    .select("*")
    .eq("tipe", "pengeluaran");

  if (error) throw error;

  const kategoriMap = {};

  data.forEach((t) => {
    const kategori = t.kategori || "lainnya";

    if (!kategoriMap[kategori]) {
      kategoriMap[kategori] = 0;
    }

    kategoriMap[kategori] += Number(t.jumlah || 0);
  });

  return kategoriMap;
}

export async function getSummaryBulanan() {
  const { data, error } = await supabase.from("keuangan").select("*");
  if (error) throw error;

  const byMonth = {};

  data.forEach((t) => {
    const d = new Date(t.tanggal);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    if (!byMonth[key]) {
      byMonth[key] = { pemasukan: 0, pengeluaran: 0 };
    }

    if (t.tipe === "masuk") {
      byMonth[key].pemasukan += Number(t.jumlah || 0);
    } else if (t.tipe === "keluar") {
      byMonth[key].pengeluaran += Number(t.jumlah || 0);
    }
  });

  return byMonth;
}
export async function getSummaryHarian() {
  const { data, error } = await supabase.from("keuangan").select("*");
  if (error) throw error;

  const byDay = {};

  data.forEach((t) => {
    const d = new Date(t.tanggal);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    if (!byDay[key]) {
      byDay[key] = { pemasukan: 0, pengeluaran: 0 };
    }

    if (t.tipe === "masuk") {
      byDay[key].pemasukan += Number(t.jumlah || 0);
    } else if (t.tipe === "keluar") {
      byDay[key].pengeluaran += Number(t.jumlah || 0);
    }
  });

  return byDay;
}

export default {
  // export default object for convenience
  getAllBahan,
  getBahanById,
  createBahan,
  updateBahan,
  deleteBahan,
  updateStokBahan,
  getAllProduk,
  getProdukById,
  createProduk,
  updateProduk,
  deleteProduk,
  updateStokProduk,
  getTransaksi,
  createTransaksi,
  deleteTransaksi,
  getSummaryBulanan,
  getSummaryHarian,
};
