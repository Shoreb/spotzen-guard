import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RegistrarEntrada from "./pages/RegistrarEntrada";
import RegistrarSalida from "./pages/RegistrarSalida";
import ConsultarCupos from "./pages/ConsultarCupos";
import GestionTarifas from "./pages/GestionTarifas";
import GestionUsuarios from "./pages/GestionUsuarios";
import Reportes from "./pages/Reportes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/entrada" element={<ProtectedRoute><RegistrarEntrada /></ProtectedRoute>} />
            <Route path="/salida" element={<ProtectedRoute><RegistrarSalida /></ProtectedRoute>} />
            <Route path="/cupos" element={<ProtectedRoute><ConsultarCupos /></ProtectedRoute>} />
            <Route path="/tarifas" element={<ProtectedRoute requireAdmin><GestionTarifas /></ProtectedRoute>} />
            <Route path="/usuarios" element={<ProtectedRoute requireAdmin><GestionUsuarios /></ProtectedRoute>} />
            <Route path="/reportes" element={<ProtectedRoute requireAdmin><Reportes /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
