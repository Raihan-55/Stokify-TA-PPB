import { supabase } from "./supabase";
import { fetchAndCache, isOnline } from "./offline";

// In-memory cache dengan TTL
const memoryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 menit

function getCached(key) {
  const cached = memoryCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCache(key, data) {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

function invalidateCache(pattern) {
  const keys = Array.from(memoryCache.keys());
  keys.forEach(key => {
    if (key.startsWith(pattern)) {
      memoryCache.delete(key);
    }
  });
}

// Update cache secara optimistic
function updateCacheOptimistically(key, updater) {
  const cached = getCached(key);
  if (cached) {
    const updated = updater(cached);
    setCache(key, updated);
  }
}

// Batch request untuk mencegah multiple calls bersamaan
const pendingRequests = new Map();

async function batchRequest(key, fetcher) {
  // Cek memory cache dulu
  const cached = getCached(key);
  if (cached) return cached;

  // Cek apakah ada request yang sama sedang berjalan
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  // Buat request baru
  const promise = (async () => {
    try {
      const result = await fetchAndCache(key, fetcher);
      setCache(key, result);
      return result;
    } finally {
      pendingRequests.delete(key);
    }
  })();

  pendingRequests.set(key, promise);
  return promise;
}

// Bahan
export async function getAllBahan() {
  return batchRequest("bahan:all", async () => {
    const { data, error } = await supabase
      .from("bahan")
      .select("*")
      .order("id", { ascending: false });
    if (error) throw error;
    return data;
  });
}

export async function getBahanById(id) {
  if (id === undefined || id === null) throw new Error("getBahanById: id is required");
  return batchRequest(`bahan:id:${id}`, async () => {
    const { data, error } = await supabase
      .from("bahan")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  });
}

export async function createBahan(data) {
  if (!isOnline()) throw new Error("Offline: cannot create data while offline");
  
  // Optimistic update: tambahkan ke cache dulu dengan ID temporary
  const tempId = Date.now();
  const optimisticData = { ...data, id: tempId };
  
  updateCacheOptimistically("bahan:all", (cached) => {
    return [optimisticData, ...cached];
  });
  
  try {
    const { data: d, error } = await supabase.from("bahan").insert([data]).select();
    if (error) throw error;
    
    // Update cache dengan data real
    invalidateCache("bahan:");
    return d[0];
  } catch (error) {
    // Rollback jika gagal
    invalidateCache("bahan:");
    throw error;
  }
}

export async function updateBahan(id, data) {
  if (!isOnline()) throw new Error("Offline: cannot update data while offline");
  
  // Optimistic update: update cache dulu
  updateCacheOptimistically(`bahan:id:${id}`, (cached) => {
    return { ...cached, ...data };
  });
  
  updateCacheOptimistically("bahan:all", (cached) => {
    return cached.map(item => item.id === id ? { ...item, ...data } : item);
  });
  
  try {
    const { data: d, error } = await supabase
      .from("bahan")
      .update(data)
      .eq("id", id)
      .select();
    if (error) throw error;
    
    // Sync cache dengan data real
    setCache(`bahan:id:${id}`, d[0]);
    updateCacheOptimistically("bahan:all", (cached) => {
      return cached.map(item => item.id === id ? d[0] : item);
    });
    
    return d[0];
  } catch (error) {
    // Rollback jika gagal
    invalidateCache("bahan:");
    throw error;
  }
}

export async function deleteBahan(id) {
  if (!isOnline()) throw new Error("Offline: cannot delete data while offline");
  
  // Optimistic update: hapus dari cache dulu
  updateCacheOptimistically("bahan:all", (cached) => {
    return cached.filter(item => item.id !== id);
  });
  memoryCache.delete(`bahan:id:${id}`);
  
  try {
    const { error } = await supabase.from("bahan").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (error) {
    // Rollback jika gagal
    invalidateCache("bahan:");
    throw error;
  }
}

export async function updateStokBahan(id, jumlah) {
  if (id === undefined || id === null) throw new Error("updateStokBahan: id is required");
  
  // Optimistic update stok
  const bahan = await getBahanById(id);
  const newStok = (Number(bahan.stok) || 0) + Number(jumlah);
  
  return updateBahan(id, { stok: newStok });
}

// Produk
export async function getAllProduk() {
  return batchRequest("produk:all", async () => {
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: false });
    if (error) throw error;
    return data;
  });
}

export async function getProdukById(id) {
  if (id === undefined || id === null) throw new Error("getProdukById: id is required");
  return batchRequest(`produk:id:${id}`, async () => {
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  });
}

export async function createProduk(data) {
  if (!isOnline()) throw new Error("Offline: cannot create data while offline");
  
  // Optimistic update
  const tempId = Date.now();
  const optimisticData = { ...data, id: tempId };
  
  updateCacheOptimistically("produk:all", (cached) => {
    return [optimisticData, ...cached];
  });
  
  try {
    const { data: d, error } = await supabase.from("produk").insert([data]).select();
    if (error) throw error;
    
    invalidateCache("produk:");
    return d[0];
  } catch (error) {
    invalidateCache("produk:");
    throw error;
  }
}

export async function updateProduk(id, data) {
  if (!isOnline()) throw new Error("Offline: cannot update data while offline");
  
  // Optimistic update
  updateCacheOptimistically(`produk:id:${id}`, (cached) => {
    return { ...cached, ...data };
  });
  
  updateCacheOptimistically("produk:all", (cached) => {
    return cached.map(item => item.id === id ? { ...item, ...data } : item);
  });
  
  try {
    const { data: d, error } = await supabase
      .from("produk")
      .update(data)
      .eq("id", id)
      .select();
    if (error) throw error;
    
    setCache(`produk:id:${id}`, d[0]);
    updateCacheOptimistically("produk:all", (cached) => {
      return cached.map(item => item.id === id ? d[0] : item);
    });
    
    return d[0];
  } catch (error) {
    invalidateCache("produk:");
    throw error;
  }
}

export async function deleteProduk(id) {
  if (!isOnline()) throw new Error("Offline: cannot delete data while offline");
  
  // Optimistic update
  updateCacheOptimistically("produk:all", (cached) => {
    return cached.filter(item => item.id !== id);
  });
  memoryCache.delete(`produk:id:${id}`);
  
  try {
    const { error } = await supabase.from("produk").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (error) {
    invalidateCache("produk:");
    throw error;
  }
}

export async function updateStokProduk(id, jumlah) {
  if (id === undefined || id === null) throw new Error("updateStokProduk: id is required");
  
  const produk = await getProdukById(id);
  const newStok = (Number(produk.stok) || 0) + Number(jumlah);
  
  return updateProduk(id, { stok: newStok });
}

// Keuangan
export async function getAllTransaksi(filter = {}) {
  const key = `keuangan:all:${JSON.stringify(filter || {})}`;
  return batchRequest(key, async () => {
    let q = supabase
      .from("keuangan")
      .select("*")
      .order("tanggal", { ascending: false });
    if (filter.kategori) q = q.eq("kategori", filter.kategori);
    if (filter.from) q = q.gte("tanggal", filter.from);
    if (filter.to) q = q.lte("tanggal", filter.to);
    const { data, error } = await q;
    if (error) throw error;
    return data;
  });
}

export async function getAllTransaksiById(id) {
  return batchRequest(`keuangan:id:${id}`, async () => {
    const { data, error } = await supabase
      .from("keuangan")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  });
}

export async function updateTransaksi(id, update) {
  if (!isOnline()) throw new Error("Offline: cannot update data while offline");
  
  // Optimistic update
  updateCacheOptimistically(`keuangan:id:${id}`, (cached) => {
    return { ...cached, ...update };
  });
  
  // Update all transaksi lists yang mungkin ada
  const keys = Array.from(memoryCache.keys()).filter(k => k.startsWith("keuangan:all:"));
  keys.forEach(key => {
    updateCacheOptimistically(key, (cached) => {
      return cached.map(item => item.id === id ? { ...item, ...update } : item);
    });
  });
  
  try {
    const { error } = await supabase.from("keuangan").update(update).eq("id", id);
    if (error) throw error;
  } catch (error) {
    invalidateCache("keuangan:");
    throw error;
  }
}

export async function createTransaksi(data) {
  if (!isOnline()) throw new Error("Offline: cannot create data while offline");
  
  // Optimistic update
  const tempId = Date.now();
  const optimisticData = { ...data, id: tempId };
  
  const keys = Array.from(memoryCache.keys()).filter(k => k.startsWith("keuangan:all:"));
  keys.forEach(key => {
    updateCacheOptimistically(key, (cached) => {
      return [optimisticData, ...cached];
    });
  });
  
  try {
    const { data: d, error } = await supabase.from("keuangan").insert([data]).select();
    if (error) throw error;
    
    invalidateCache("keuangan:");
    return d[0];
  } catch (error) {
    invalidateCache("keuangan:");
    throw error;
  }
}

export async function deleteTransaksi(id) {
  if (!isOnline()) throw new Error("Offline: cannot delete data while offline");
  
  // Optimistic update
  const keys = Array.from(memoryCache.keys()).filter(k => k.startsWith("keuangan:all:"));
  keys.forEach(key => {
    updateCacheOptimistically(key, (cached) => {
      return cached.filter(item => item.id !== id);
    });
  });
  memoryCache.delete(`keuangan:id:${id}`);
  
  try {
    const { error } = await supabase.from("keuangan").delete().eq("id", id);
    if (error) throw error;
    
    invalidateCache("keuangan:");
    return true;
  } catch (error) {
    invalidateCache("keuangan:");
    throw error;
  }
}

export async function getPengeluaranByKategori() {
  return batchRequest("keuangan:pengeluaran:kategori", async () => {
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
  });
}

export async function getSummaryBulanan() {
  return batchRequest("keuangan:summary:bulanan", async () => {
    const { data, error } = await supabase.from("keuangan").select("*");
    if (error) throw error;

    const byMonth = {};
    data.forEach((t) => {
      const d = new Date(t.tanggal);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

      if (!byMonth[key]) {
        byMonth[key] = { pemasukan: 0, pengeluaran: 0 };
      }

      if (t.tipe === "pemasukan") {
        byMonth[key].pemasukan += Number(t.jumlah || 0);
      } else if (t.tipe === "pengeluaran") {
        byMonth[key].pengeluaran += Number(t.jumlah || 0);
      }
    });

    return byMonth;
  });
}

export async function getSummaryHarian() {
  return batchRequest("keuangan:summary:harian", async () => {
    const { data, error } = await supabase.from("keuangan").select("*");
    if (error) throw error;

    const byDay = {};
    data.forEach((t) => {
      const d = new Date(t.tanggal);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      if (!byDay[key]) {
        byDay[key] = { pemasukan: 0, pengeluaran: 0 };
      }

      if (t.tipe === "pemasukan") {
        byDay[key].pemasukan += Number(t.jumlah || 0);
      } else if (t.tipe === "pengeluaran") {
        byDay[key].pengeluaran += Number(t.jumlah || 0);
      }
    });

    return byDay;
  });
}

export default {
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
  getAllTransaksi,
  createTransaksi,
  deleteTransaksi,
  getSummaryBulanan,
  getSummaryHarian,
};