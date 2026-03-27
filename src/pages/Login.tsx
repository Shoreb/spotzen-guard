import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Car, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-white flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        {/* LOGO / HEADER */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center mx-auto mb-4">
            <Car className="h-7 w-7 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-black">ParqueApp</h1>
          <p className="text-gray-500 text-sm mt-1">
            Sistema de Control de Parqueadero
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8">

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

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

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

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm transition-all"
                />
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="p-3 border border-red-200 bg-red-50 rounded-xl">
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            )}

            {/* BOTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
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

      {/* WhatsApp flotante */}
      <a
        href="https://wa.me/573000000000"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-50"
        title="Soporte WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/>
        </svg>
      </a>
    </div>
  );
};

export default Login;
