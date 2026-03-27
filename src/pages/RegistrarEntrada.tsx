import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Car, Bike, PlusCircle, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface TipoVehiculo { id: number; nombre: string; }
interface Tarifa { id: number; nombre: string; tipo_cobro: string; valor: number; }

const RegistrarEntrada: React.FC = () => {
  const { usuario } = useAuth();
  const [placa, setPlaca] = useState("");
  const [tipoVehiculoId, setTipoVehiculoId] = useState<number>(1);
  const [tipos, setTipos] = useState<TipoVehiculo[]>([]);
  const [cuposDisp, setCuposDisp] = useState<{ autos: number; motos: number }>({ autos: 0, motos: 0 });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchCupos = async () => {
    const { data } = await supabase.from("espacios").select("tipo_vehiculo_id, disponible");
    if (data) {
      setCuposDisp({
        autos: data.filter(e => e.tipo_vehiculo_id === 1 && e.disponible === 1).length,
        motos: data.filter(e => e.tipo_vehiculo_id === 2 && e.disponible === 1).length,
      });
    }
  };

  useEffect(() => {
    supabase.from("tipos_vehiculo").select("*").then(({ data }) => setTipos(data ?? []));
    fetchCupos();
  }, []);

  const cuposActuales = tipoVehiculoId === 1 ? cuposDisp.autos : cuposDisp.motos;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!placa.trim()) { setError("Ingrese la placa del vehículo."); return; }
    if (cuposActuales === 0) { setError(`No hay cupos disponibles para ${tipoVehiculoId === 1 ? "autos" : "motos"}.`); return; }

    setLoading(true);
    try {
      const { data: enCurso } = await supabase.from("registros")
        .select("id").eq("placa", placa.toUpperCase()).eq("estado", "EN_CURSO").single();
      if (enCurso) { setError("Este vehículo ya tiene un registro activo en el parqueadero."); setLoading(false); return; }

      const { data: espacio } = await supabase.from("espacios")
        .select("id").eq("tipo_vehiculo_id", tipoVehiculoId).eq("disponible", 1)
        .order("id").limit(1).single();
      if (!espacio) { setError("No se encontró un espacio disponible."); setLoading(false); return; }

      const hoy = new Date().toISOString().split("T")[0];
      const { data: tarifa } = await supabase.from("tarifas")
        .select("id").eq("tipo_vehiculo_id", tipoVehiculoId).eq("activo", 1)
        .lte("fecha_inicio", hoy).or(`fecha_fin.is.null,fecha_fin.gte.${hoy}`)
        .order("id").limit(1).single();

      const { data: reg, error: regErr } = await supabase.from("registros").insert({
        placa: placa.toUpperCase().trim(),
        tipo_vehiculo_id: tipoVehiculoId,
        espacio_id: espacio.id,
        fecha_hora_entrada: new Date().toISOString(),
        tarifa_id: tarifa?.id ?? null,
        estado: "EN_CURSO",
        usuario_entrada_id: usuario?.id,
      }).select().single();

      if (regErr) throw regErr;

      await supabase.from("espacios").update({ disponible: 0 }).eq("id", espacio.id);

      await fetchCupos();
      setSuccess(`Entrada registrada. Placa: ${placa.toUpperCase()}`);
      setPlaca("");
    } catch (err: any) {
      setError("Error al registrar la entrada: " + (err.message ?? "Intente nuevamente."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-black">Registrar Entrada</h1>
          <p className="text-gray-500 text-sm mt-1">
            Ingresa los datos del vehículo
          </p>
        </div>

        {/* CUPOS */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${
            tipoVehiculoId === 1 ? "border-black" : "border-gray-200"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-black rounded-xl flex items-center justify-center">
                <Car className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">{cuposDisp.autos}</p>
                <p className="text-xs text-gray-500">Cupos Autos</p>
              </div>
            </div>
          </div>

          <div className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${
            tipoVehiculoId === 2 ? "border-black" : "border-gray-200"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-black rounded-xl flex items-center justify-center">
                <Bike className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">{cuposDisp.motos}</p>
                <p className="text-xs text-gray-500">Cupos Motos</p>
              </div>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* TIPOS */}
            <div>
              <label className="block text-sm font-semibold text-black mb-3">
                Tipo de Vehículo
              </label>

              <div className="grid grid-cols-2 gap-3">
                {tipos.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTipoVehiculoId(t.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      tipoVehiculoId === t.id
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {t.id === 1
                      ? <Car className="h-5 w-5 text-black" />
                      : <Bike className="h-5 w-5 text-black" />}

                    <div className="text-left">
                      <p className="font-semibold text-sm text-black">{t.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {t.id === 1 ? `${cuposDisp.autos} disponibles` : `${cuposDisp.motos} disponibles`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* PLACA */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Placa
              </label>

              <input
                type="text"
                value={placa}
                onChange={e => setPlaca(e.target.value.toUpperCase())}
                maxLength={7}
                placeholder="ABC123"
                className="w-full px-4 py-4 border border-gray-200 rounded-xl text-center text-2xl font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
              />
            </div>

            {/* FECHA */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500">Fecha y hora:</p>
              <p className="font-semibold text-black text-lg">
                {new Date().toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>

            {/* ALERTAS */}
            {cuposActuales === 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-600 text-sm">
                  No hay cupos disponibles
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            {/* BOTON */}
            <button
              type="submit"
              disabled={loading || cuposActuales === 0}
              className="w-full bg-black text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading
                ? <Loader2 className="h-5 w-5 animate-spin" />
                : <PlusCircle className="h-5 w-5" />}
              {loading ? "Registrando..." : "Registrar Entrada"}
            </button>

          </form>
        </div>
      </div>
    </Layout>
  );
};

export default RegistrarEntrada;
