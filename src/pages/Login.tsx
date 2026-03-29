import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Car, Loader2, Lock, Mail, ShieldCheck, Eye, EyeOff } from "lucide-react";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await login(email, password);
    setLoading(false);
    if (err) { setError(err); return; }
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 overflow-hidden">

      {/* 🖼️ IMAGEN DE FONDO */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=2070&auto=format&fit=crop')",
        }}
      />

      {/* 🌑 OVERLAY PRO */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/90 backdrop-blur-[2px]" />

      {/* ✨ GLOW DECORATION */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      {/* CONTENIDO */}
      <div className="w-full max-w-md relative z-10 animate-fade-in">

        {/* LOGO */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Car className="h-8 w-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white">ParqueApp</h1>
          <p className="text-white/70 text-sm mt-1">
            Sistema de Control de Parqueadero
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">

          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="h-5 w-5 text-black" />
            <h2 className="text-xl font-bold text-black">Iniciar Sesión</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Correo electrónico
              </label>

              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />

                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="usuario@parqueadero.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm transition-all"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Contraseña
              </label>

              <div className="relative group">
  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />

  <input
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={e => setPassword(e.target.value)}
    required
    placeholder="••••••••"
    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm transition-all"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
  >
    {showPassword ? (
      <EyeOff className="h-4 w-4" />
    ) : (
      <Eye className="h-4 w-4" />
    )}
  </button>
</div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="p-3 border border-red-200 bg-red-50 rounded-xl animate-shake">
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            )}

            {/* BOTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {loading ? "Verificando..." : "Ingresar"}
            </button>

          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Sistema de uso exclusivo para personal autorizado
          </p>
        </div>

      </div>

      {/* WHATSAPP */}
      <a
        href="https://wa.me/573000000000"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-50"
        title="Soporte WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487"/>
        </svg>
      </a>

    </div>
  );
};

export default Login;
