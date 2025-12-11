import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import BahanList from "./pages/BahanList";
import BahanDetail from "./pages/BahanDetail";
import ProdukList from "./pages/ProdukList";
import ProdukDetail from "./pages/ProdukDetail";
import KeuanganList from "./pages/KeuanganList";
import KeuanganDetail from "./pages/KeuanganDetail";
import Profil from "./pages/Profil";

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Navbar />
              <main className="mb-10 sm:mb-0">
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
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
