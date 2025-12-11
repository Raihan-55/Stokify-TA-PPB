/**
 * Optimized Database API with faster Supabase fetching
 * Features:
 * - Selective column queries (only fetch what you need)
 * - Batch queries for related data
 * - Smart caching with stale-while-revalidate
 * - Request deduplication
 * - Parallel queries
 */

import { supabase } from "./supabase";
import { fetchWithCache, batchFetch, prefetch, CACHE_STRATEGIES, isOnline } from "./offlineOptimized";

// ===== PERFORMANCE TIPS FOR SUPABASE =====
// 1. Use .select("specific,columns") instead of "*" to reduce bandwidth
// 2. Use .limit(n) to avoid fetching all rows when not needed
// 3. Use .order("id", { ascending: false }) to sort server-side
// 4. Batch related queries together with Promise.all() or batchFetch()
// 5. Use prefetch() to load data in background while user navigates
// 6. Cache frequently accessed data with stale-while-revalidate
// 7. Enable Gzip compression in Supabase dashboard (Network > Compression)

// ===== BAHAN (MATERIALS) =====

export async function getAllBahan(options = {}) {
  const { columns = "*", limit = null } = options;
  const cacheName = `bahan:all:${columns}:${limit}`;

  return fetchWithCache(
    cacheName,
    async () => {
      let query = supabase.from("bahan").select(columns).order("id", { ascending: false });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    { strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE, staleTime: 3 * 60 * 1000 }
  );
}

export async function getBahanById(id, columns = "*") {
  if (id === undefined || id === null) throw new Error("getBahanById: id is required");

  return fetchWithCache(
    `bahan:id:${id}:${columns}`,
    async () => {
      const { data, error } = await supabase.from("bahan").select(columns).eq("id", id).single();
      if (error) throw error;
      return data;
    },
    { strategy: CACHE_STRATEGIES.NETWORK_FIRST }
  );
}

// Fetch multiple bahans by IDs (faster than individual queries)
export async function getBahanByIds(ids) {
  if (!ids || ids.length === 0) return [];

  return fetchWithCache(`bahan:ids:${ids.join(",")}`, async () => {
    const { data, error } = await supabase.from("bahan").select("*").in("id", ids);
    if (error) throw error;
    return data;
  });
}

export async function createBahan(data) {
  if (!isOnline()) throw new Error("Offline: cannot create data while offline");
  const { data: d, error } = await supabase.from("bahan").insert([data]).select();
  if (error) throw error;
  // Invalidate cache
  clearBahanCache();
  return d[0];
}

export async function updateBahan(id, data) {
  if (!isOnline()) throw new Error("Offline: cannot update data while offline");
  const { data: d, error } = await supabase.from("bahan").update(data).eq("id", id).select();
  if (error) throw error;
  clearBahanCache();
  return d[0];
}

export async function deleteBahan(id) {
  if (!isOnline()) throw new Error("Offline: cannot delete data while offline");
  const { error } = await supabase.from("bahan").delete().eq("id", id);
  if (error) throw error;
  clearBahanCache();
  return true;
}

export async function updateStokBahan(id, jumlah) {
  if (id === undefined || id === null) throw new Error("updateStokBahan: id is required");
  const bahan = await getBahanById(id, "id,stok");
  const newStok = (Number(bahan.stok) || 0) + Number(jumlah);
  return updateBahan(id, { stok: newStok });
}

function clearBahanCache() {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith("bahan:"));
  keys.forEach((k) => localStorage.removeItem(k));
}

// ===== PRODUK (PRODUCTS) =====

export async function getAllProduk(options = {}) {
  const { columns = "*", limit = null } = options;
  const cacheName = `produk:all:${columns}:${limit}`;

  return fetchWithCache(
    cacheName,
    async () => {
      let query = supabase.from("produk").select(columns).order("id", { ascending: false });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    { strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE, staleTime: 3 * 60 * 1000 }
  );
}

export async function getProdukById(id, columns = "*") {
  if (id === undefined || id === null) throw new Error("getProdukById: id is required");

  return fetchWithCache(`produk:id:${id}:${columns}`, async () => {
    const { data, error } = await supabase.from("produk").select(columns).eq("id", id).single();
    if (error) throw error;
    return data;
  });
}

export async function getProdukByIds(ids) {
  if (!ids || ids.length === 0) return [];

  return fetchWithCache(`produk:ids:${ids.join(",")}`, async () => {
    const { data, error } = await supabase.from("produk").select("*").in("id", ids);
    if (error) throw error;
    return data;
  });
}

export async function createProduk(data) {
  if (!isOnline()) throw new Error("Offline: cannot create data while offline");
  const { data: d, error } = await supabase.from("produk").insert([data]).select();
  if (error) throw error;
  clearProdukCache();
  return d[0];
}

export async function updateProduk(id, data) {
  if (!isOnline()) throw new Error("Offline: cannot update data while offline");
  const { data: d, error } = await supabase.from("produk").update(data).eq("id", id).select();
  if (error) throw error;
  clearProdukCache();
  return d[0];
}

export async function deleteProduk(id) {
  if (!isOnline()) throw new Error("Offline: cannot delete data while offline");
  const { error } = await supabase.from("produk").delete().eq("id", id);
  if (error) throw error;
  clearProdukCache();
  return true;
}

export async function updateStokProduk(id, jumlah) {
  if (id === undefined || id === null) throw new Error("updateStokProduk: id is required");
  const produk = await getProdukById(id, "id,stok");
  const newStok = (Number(produk.stok) || 0) + Number(jumlah);
  return updateProduk(id, { stok: newStok });
}

function clearProdukCache() {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith("produk:"));
  keys.forEach((k) => localStorage.removeItem(k));
}

// ===== KEUANGAN (FINANCE) =====

export async function getAllTransaksi(filter = {}, options = {}) {
  const { columns = "*", limit = 1000 } = options;
  const key = `keuangan:all:${JSON.stringify(filter)}:${columns}`;

  return fetchWithCache(
    key,
    async () => {
      let query = supabase.from("keuangan").select(columns).order("tanggal", { ascending: false });
      if (filter.kategori) query = query.eq("kategori", filter.kategori);
      if (filter.from) query = query.gte("tanggal", filter.from);
      if (filter.to) query = query.lte("tanggal", filter.to);
      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    { strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE, staleTime: 2 * 60 * 1000 }
  );
}

export async function getAllTransaksiById(id) {
  return fetchWithCache(`keuangan:id:${id}`, async () => {
    const { data, error } = await supabase.from("keuangan").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  });
}

export async function updateTransaksi(id, update) {
  if (!isOnline()) throw new Error("Offline: cannot update data while offline");
  const { error } = await supabase.from("keuangan").update(update).eq("id", id);
  if (error) throw error;
  clearKeuanganCache();
}

export async function createTransaksi(data) {
  if (!isOnline()) throw new Error("Offline: cannot create data while offline");
  const { data: d, error } = await supabase.from("keuangan").insert([data]).select();
  if (error) throw error;
  clearKeuanganCache();
  return d[0];
}

export async function deleteTransaksi(id) {
  if (!isOnline()) throw new Error("Offline: cannot delete data while offline");
  const { error } = await supabase.from("keuangan").delete().eq("id", id);
  if (error) throw error;
  clearKeuanganCache();
  return true;
}

export async function getPengeluaranByKategori() {
  return fetchWithCache("keuangan:pengeluaran:kategori", async () => {
    const { data, error } = await supabase.from("keuangan").select("kategori,jumlah").eq("tipe", "pengeluaran");
    if (error) throw error;

    const kategoriMap = {};
    data.forEach((t) => {
      const kategori = t.kategori || "lainnya";
      if (!kategoriMap[kategori]) kategoriMap[kategori] = 0;
      kategoriMap[kategori] += Number(t.jumlah || 0);
    });
    return kategoriMap;
  });
}

export async function getSummaryBulanan() {
  return fetchWithCache("keuangan:summary:bulanan", async () => {
    const { data, error } = await supabase.from("keuangan").select("tanggal,tipe,jumlah");
    if (error) throw error;

    const byMonth = {};
    data.forEach((t) => {
      const d = new Date(t.tanggal);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!byMonth[key]) byMonth[key] = { pemasukan: 0, pengeluaran: 0 };
      if (t.tipe === "pemasukan") byMonth[key].pemasukan += Number(t.jumlah || 0);
      else if (t.tipe === "pengeluaran") byMonth[key].pengeluaran += Number(t.jumlah || 0);
    });
    return byMonth;
  });
}

export async function getSummaryHarian() {
  return fetchWithCache("keuangan:summary:harian", async () => {
    const { data, error } = await supabase.from("keuangan").select("tanggal,tipe,jumlah");
    if (error) throw error;

    const byDay = {};
    data.forEach((t) => {
      const d = new Date(t.tanggal);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!byDay[key]) byDay[key] = { pemasukan: 0, pengeluaran: 0 };
      if (t.tipe === "pemasukan") byDay[key].pemasukan += Number(t.jumlah || 0);
      else if (t.tipe === "pengeluaran") byDay[key].pengeluaran += Number(t.jumlah || 0);
    });
    return byDay;
  });
}

function clearKeuanganCache() {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith("keuangan:"));
  keys.forEach((k) => localStorage.removeItem(k));
}

// ===== BATCH OPERATIONS =====

/**
 * Load all critical data in parallel (for Home page, etc.)
 * Much faster than sequential calls
 */
export async function loadCriticalData() {
  return batchFetch({
    "bahan:all:opt": {
      fetcher: () => getAllBahan({ columns: "id,nama,stok,satuan", limit: 50 }),
      options: { strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE },
    },
    "produk:all:opt": {
      fetcher: () => getAllProduk({ columns: "id,nama,stok,satuan,harga", limit: 50 }),
      options: { strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE },
    },
    "keuangan:summary:bulanan": {
      fetcher: getSummaryBulanan,
      options: { strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE },
    },
    "keuangan:summary:harian": {
      fetcher: getSummaryHarian,
      options: { strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE },
    },
  });
}

/**
 * Prefetch data in background for faster navigation
 * Call this when app initializes or user navigates between pages
 */
export async function prefetchCommonData() {
  try {
    await Promise.all([
      prefetch("bahan:all:opt", () => getAllBahan({ columns: "id,nama,stok,satuan", limit: 50 })),
      prefetch("produk:all:opt", () => getAllProduk({ columns: "id,nama,stok,satuan,harga", limit: 50 })),
      prefetch("keuangan:pengeluaran:kategori", getPengeluaranByKategori),
    ]);
  } catch (e) {
    console.warn("Prefetch error (non-critical):", e);
  }
}

export default {
  getAllBahan,
  getBahanById,
  getBahanByIds,
  createBahan,
  updateBahan,
  deleteBahan,
  updateStokBahan,
  getAllProduk,
  getProdukById,
  getProdukByIds,
  createProduk,
  updateProduk,
  deleteProduk,
  updateStokProduk,
  getAllTransaksi,
  getAllTransaksiById,
  createTransaksi,
  updateTransaksi,
  deleteTransaksi,
  getPengeluaranByKategori,
  getSummaryBulanan,
  getSummaryHarian,
  loadCriticalData,
  prefetchCommonData,
};
