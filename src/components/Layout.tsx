import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Car, LogOut, LayoutDashboard, PlusCircle, MinusCircle,
  ParkingSquare, DollarSign, Users, BarChart2, Menu, X, Shield
} from "lucide-react";
import { useState } from "react";

interface LayoutProps { children: React.ReactNode }

const WHATSAPP_NUMBER = "573000000000"; // ← Cambia aquí el número real

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { usuario, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const adminLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/entrada",   icon: PlusCircle,      label: "Registrar Entrada" },
    { to: "/salida",    icon: MinusCircle,      label: "Registrar Salida" },
    { to: "/cupos",     icon: ParkingSquare,    label: "Consultar Cupos" },
    { to: "/tarifas",   icon: DollarSign,       label: "Gestión Tarifas" },
    { to: "/usuarios",  icon: Users,            label: "Gestión Usuarios" },
    { to: "/reportes",  icon: BarChart2,        label: "Reportes" },
  ];

  const operarioLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/entrada",   icon: PlusCircle,      label: "Registrar Entrada" },
    { to: "/salida",    icon: MinusCircle,      label: "Registrar Salida" },
    { to: "/cupos",     icon: ParkingSquare,    label: "Consultar Cupos" },
  ];

  const links = isAdmin() ? adminLinks : operarioLinks;

  const SidebarContent = () => (
    <>
      {/* LOGO */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-sm">
            <Car className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-black text-sm leading-tight">ParqueApp</p>
            <p className="text-xs text-gray-500 leading-tight">SENA Nodo TIC</p>
          </div>
        </div>
      </div>

      {/* USER INFO */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-black truncate">{usuario?.nombre}</p>
            <p className="text-xs text-gray-500">
              {usuario?.roles?.nombre ?? (usuario?.rol_id === 1 ? "Administrador" : "Operario")}
            </p>
          </div>
        </div>
      </div>

      {/* NAV LINKS */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-black text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-black"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">

      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* SIDEBAR MOBILE OVERLAY */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-64 h-full bg-white z-50 shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* MOBILE HEADER */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-black" />
            <span className="font-bold text-black">ParqueApp</span>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="text-black p-1">
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* BOTÓN FLOTANTE WHATSAPP */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola%2C%20tengo%20una%20pregunta%20sobre%20el%20parqueadero.`}
        target="_blank"
        rel="noopener noreferrer"
        title="Soporte por WhatsApp"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-50 no-print"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" aria-label="WhatsApp">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
};

export default Layout;
