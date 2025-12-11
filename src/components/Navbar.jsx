import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { HiHome, HiClipboardList, HiCube, HiCurrencyDollar, HiUser, HiSun, HiMoon, HiLogout } from "react-icons/hi";

const menus = [
  { name: "Home", path: "/", icon: <HiHome size={20} /> },
  { name: "Bahan", path: "/bahan", icon: <HiClipboardList size={20} /> },
  { name: "Produk", path: "/produk", icon: <HiCube size={20} /> },
  { name: "Keuangan", path: "/keuangan", icon: <HiCurrencyDollar size={20} /> },
  { name: "Profil", path: "/profil", icon: <HiUser size={20} /> },
];

function DarkModeToggle({ dark, setDark }) {
  return (
    <button
      onClick={() => setDark(!dark)}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <HiSun size={20} /> : <HiMoon size={20} />}
    </button>
  );
}

export default function Navbar() {
  const [dark, setDark] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  useEffect(() => {
    const isDark = localStorage.getItem("dark") === "1";
    setDark(isDark);
    if (isDark) document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("dark", dark ? "1" : "0");
  }, [dark]);

  // Desktop link styling
  const desktopLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm lg:text-base font-medium transition-all duration-200 ${
      isActive ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
    }`;

  // Mobile link styling
  const mobileLinkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-0.5 py-2 px-1 text-xs transition-all duration-200 ${
      isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
    }`;

  return (
    <>
      {/* Desktop Navbar - Hidden on mobile, visible on tablet and up */}
      <nav className="hidden md:flex sticky top-0 px-4 lg:px-6 py-3 lg:py-4 rounded-lg bg-white dark:bg-gray-800 justify-between items-center z-50 shadow-sm">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <Link to="/" className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
            Stokify
          </Link>
        </div>

        {/* Menu Items */}
        <div className="flex items-center gap-2 lg:gap-3">
          {menus.map((menu) => (
            <NavLink key={menu.path} to={menu.path} className={desktopLinkClass} end={menu.path === "/"}>
              <span className="flex items-center gap-2">{menu.name}</span>
            </NavLink>
          ))}

          {/* Dark Mode Toggle */}
          <div className="ml-2">
            <DarkModeToggle dark={dark} setDark={setDark} />
          </div>

          {/* Logout Button */}
          {user && (
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-all duration-200 flex items-center gap-2"
              title={`Logout: ${user.email}`}
            >
              <HiLogout size={16} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Top Header - Visible only on mobile */}
      <div className="md:hidden fixed top-0 left-0 w-full px-4 py-3 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 flex justify-between items-center z-50 shadow-sm">
        <Link to="/" className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
          Stockify
        </Link>

        {/* Dark Mode Toggle */}
        <DarkModeToggle dark={dark} setDark={setDark} />
      </div>

      {/* Mobile Bottom Navbar - Visible only on mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 flex justify-around items-center py-1 shadow-lg z-50">
        {menus.map((menu) => (
          <NavLink key={menu.path} to={menu.path} className={mobileLinkClass} end={menu.path === "/"}>
            <span className="relative">
              {menu.icon}
              {/* Active indicator dot */}
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full opacity-0 transition-opacity duration-200" />
            </span>
            <span className="text-[10px] sm:text-xs font-medium">{menu.name}</span>
          </NavLink>
        ))}

        {/* Logout Button Mobile */}
        {user && (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center gap-0.5 py-2 px-1 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200"
            title="Logout"
          >
            <HiLogout size={20} />
            <span className="text-[10px]">Logout</span>
          </button>
        )}
      </nav>

      {/* Spacer for mobile - prevents content from being hidden under fixed navbars */}
      <div className="md:hidden">
        {/* Top spacer */}
        <div className="h-14 sm:h-16"></div>

        {/* Bottom spacer - positioned at the end of page content */}
        <div className="fixed bottom-0 left-0 w-full h-16 pointer-events-none" style={{ zIndex: -1 }}></div>
      </div>
    </>
  );
}
