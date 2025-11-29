import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import BahanList from "./pages/BahanList";
import BahanDetail from "./pages/BahanDetail";
import ProdukList from "./pages/ProdukList";
import ProdukDetail from "./pages/ProdukDetail";
import Keuangan from "./pages/Keuangan";
import KeuanganList from "./pages/KeuanganList";
import KeuanganDetail from "./pages/KeuanganDetail";
import Profil from "./pages/Profil";
import { getAllBahan } from "./lib/database";

function App() {
  useEffect(() => {
    // example usage as requested
    (async () => {
      try {
        const bahan = await getAllBahan();
        console.log("Example getAllBahan:", bahan);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <Navbar />
        <main className="mb-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bahan" element={<BahanList />} />
            <Route path="/bahan/:id" element={<BahanDetail />} />
            <Route path="/produk" element={<ProdukList />} />
            <Route path="/produk/:id" element={<ProdukDetail />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/keuangan" element={<KeuanganList />} />
            <Route path="/keuangan/:id" element={<KeuanganDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
