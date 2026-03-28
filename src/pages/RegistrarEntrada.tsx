import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Car, Bike, PlusCircle, CheckCircle2, AlertCircle, Loader2, ParkingSquare, Clock } from "lucide-react";

interface TipoVehiculo { id: number; nombre: string; }

interface EntradaExitosa {
  placa: string;
  espacio: string;
  hora: string;
  tipo: string;
}

const RegistrarEntrada: React.FC = () => {
  const { usuario } = useAuth();
  const [placa, setPlaca] = useState("");
  const [tipoVehiculoId, setTipoVehiculoId] = useState<number>(1);
  const [tipos, setTipos] = useState<TipoVehiculo[]>([]);
  const [cuposDisp, setCuposDisp] = useState<{ autos: number; motos: number }>({ autos: 0, motos: 0 });
  const [loading, setLoading] = useState(false);
  const [entradaExitosa, setEntradaExitosa] = useState<EntradaExitosa | null>(null);
  const [error, setError] = useState("");
  const [horaActual, setHoraActual] = useState(new Date());

  // Reloj en tiempo real
  useEffect(() => {
    const t = setInterval(() => setHoraActual(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchCupos = useCallback(async () => {
    const { data } = await supabase.from("espacios").select("tipo_vehiculo_id, disponible");
    if (data) {
      setCuposDisp({
        autos: data.filter(e => e.tipo_vehiculo_id === 1 && e.disponible === 1).length,
        motos: data.filter(e => e.tipo_vehiculo_id === 2 && e.disponible === 1).length,
      });
    }
  }, []);

  useEffect(() => {
    supabase.from("tipos_vehiculo").select("*").then(({ data }) => setTipos(data ?? []));
    fetchCupos();

    // Suscripción realtime para cupos
    const channel = supabase
      .channel("espacios-realtime")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "espacios" }, () => fetchCupos())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchCupos]);

  const cuposActuales = tipoVehiculoId === 1 ? cuposDisp.autos : cuposDisp.motos;

  // Validación de placa colombiana: ABC123 o ABC12D (6-7 chars)
  const placaValida = (p: string) => /^[A-Z]{3}[0-9]{2,3}([A-Z0-9])?$/.test(p.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setEntradaExitosa(null);

    const placaUpper = placa.trim().toUpperCase();

    if (!placaUpper) { setError("Ingrese la placa del vehículo."); return; }
    if (!placaValida(placaUpper)) { setError("Placa inválida. Formato colombiano: ABC123 o ABC12D"); return; }
    if (cuposActuales === 0) { setError(`No hay cupos disponibles para ${tipoVehiculoId === 1 ? "autos" : "motos"}.`); return; }

    setLoading(true);
    try {
      // Verificar si ya está dentro
      const { data: enCurso } = await supabase
        .from("registros")
        .select("id")
        .eq("placa", placaUpper)
        .eq("estado", "EN_CURSO")
        .maybeSingle();

      if (enCurso) {
        setError("Este vehículo ya tiene un registro activo. Registre la salida primero.");
        setLoading(false);
        return;
      }

      // Obtener espacio disponible
      const { data: espacio, error: espacioErr } = await supabase
        .from("espacios")
        .select("id, codigo")
        .eq("tipo_vehiculo_id", tipoVehiculoId)
        .eq("disponible", 1)
        .order("id")
        .limit(1)
        .maybeSingle();

      if (espacioErr || !espacio) {
        setError("No se encontró un espacio disponible. Intente nuevamente.");
        setLoading(false);
        return;
      }

      // Obtener tarifa activa vigente
      const hoy = new Date().toISOString().split("T")[0];
      const { data: tarifa } = await supabase
        .from("tarifas")
        .select("id")
        .eq("tipo_vehiculo_id", tipoVehiculoId)
        .eq("activo", 1)
        .lte("fecha_inicio", hoy)
        .or(`fecha_fin.is.null,fecha_fin.gte.${hoy}`)
        .order("id")
        .limit(1)
        .maybeSingle();

      const ahora = new Date().toISOString();

      // Insertar registro
      const { error: regErr } = await supabase.from("registros").insert({
        placa: placaUpper,
        tipo_vehiculo_id: tipoVehiculoId,
        espacio_id: espacio.id,
        fecha_hora_entrada: ahora,
        tarifa_id: tarifa?.id ?? null,
        estado: "EN_CURSO",
        usuario_entrada_id: usuario?.id ?? null,
      });

      if (regErr) throw regErr;

      // Marcar espacio como ocupado
      await supabase.from("espacios").update({ disponible: 0 }).eq("id", espacio.id);

      await fetchCupos();

      const tipoNombre = tipos.find(t => t.id === tipoVehiculoId)?.nombre ?? "Vehículo";
      setEntradaExitosa({
        placa: placaUpper,
        espacio: espacio.codigo,
        hora: new Date(ahora).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
        tipo: tipoNombre,
      });
      setPlaca("");

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Intente nuevamente.";
      setError("Error al registrar la entrada: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Registrar Entrada</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Ingresa los datos del vehículo para asignar espacio
          </p>
        </div>

        {/* CUPOS EN TIEMPO REAL */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 1, label: "Autos", count: cuposDisp.autos, total: 30, icon: Car },
            { id: 2, label: "Motos", count: cuposDisp.motos, total: 15, icon: Bike },
          ].map(({ id, label, count, total, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => { setTipoVehiculoId(id); setError(""); setEntradaExitosa(null); }}
              className={`bg-card border rounded-2xl p-5 shadow-sm transition-all text-left ${
                tipoVehiculoId === id ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tipoVehiculoId === id ? "gradient-primary" : "bg-muted"}`}>
                  <Icon className={`h-5 w-5 ${tipoVehiculoId === id ? "text-white" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="font-bold text-2xl text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{label} disponibles</p>
                </div>
              </div>
              <div className="h-1.5 bg-muted rounded-full">
                <div
                  className={`h-full rounded-full transition-all ${count === 0 ? "bg-destructive" : count <= 3 ? "bg-warning" : "bg-success"}`}
                  style={{ width: `${(count / total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{total - count} ocupados de {total}</p>
            </button>
          ))}
        </div>

        {/* CONFIRMACIÓN DE ENTRADA EXITOSA */}
        {entradaExitosa && (
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-green-800 text-lg">¡Entrada registrada exitosamente!</p>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="text-center p-3 bg-white rounded-xl border border-green-200">
                    <p className="text-xs text-green-600 font-medium mb-1">Placa</p>
                    <p className="font-mono font-bold text-green-900 text-lg">{entradaExitosa.placa}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-xl border border-green-200">
                    <p className="text-xs text-green-600 font-medium mb-1">Espacio</p>
                    <p className="font-bold text-green-900 text-lg">{entradaExitosa.espacio}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-xl border border-green-200">
                    <p className="text-xs text-green-600 font-medium mb-1">Hora</p>
                    <p className="font-bold text-green-900 text-lg">{entradaExitosa.hora}</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setEntradaExitosa(null)}
              className="mt-4 w-full py-2 text-sm text-green-700 border border-green-300 rounded-xl hover:bg-green-100 transition-colors"
            >
              Registrar otro vehículo
            </button>
          </div>
        )}

        {/* FORMULARIO */}
        {!entradaExitosa && (
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* PLACA */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Placa del Vehículo
                </label>
                <input
                  type="text"
                  value={placa}
                  onChange={e => { setPlaca(e.target.value.toUpperCase()); setError(""); }}
                  maxLength={7}
                  placeholder="ABC123"
                  autoFocus
                  className="w-full px-4 py-4 border border-border rounded-xl text-center text-3xl font-mono tracking-[0.3em] uppercase focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-background"
                />
                <p className="text-xs text-muted-foreground mt-1.5 text-center">
                  Formato: ABC123 (sedan/camioneta) o ABC12D (nueva)
                </p>
              </div>

              {/* HORA ACTUAL */}
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Hora de entrada registrada</p>
                  <p className="font-semibold text-foreground">
                    {horaActual.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
              </div>

              {/* TIPO SELECCIONADO */}
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/20">
                <ParkingSquare className="h-4 w-4 text-primary" />
                <p className="text-sm text-primary font-medium">
                  Tipo seleccionado: <span className="font-bold">{tipos.find(t => t.id === tipoVehiculoId)?.nombre ?? "—"}</span>
                  {" — "}{cuposActuales} cupos disponibles
                </p>
              </div>

              {/* SIN CUPOS */}
              {cuposActuales === 0 && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <p className="text-destructive text-sm font-medium">
                    No hay cupos disponibles para {tipoVehiculoId === 1 ? "autos" : "motos"}
                  </p>
                </div>
              )}

              {/* ERROR */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              {/* BOTÓN */}
              <button
                type="submit"
                disabled={loading || cuposActuales === 0}
                className="w-full gradient-primary text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-md text-base"
              >
                {loading
                  ? <><Loader2 className="h-5 w-5 animate-spin" /> Registrando...</>
                  : <><PlusCircle className="h-5 w-5" /> Registrar Entrada</>}
              </button>

            </form>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RegistrarEntrada;
