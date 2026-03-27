import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Car, Bike, ParkingSquare, RefreshCw, CheckCircle2, XCircle } from "lucide-react";

interface Espacio {
  id: number;
  codigo: string;
  tipo_vehiculo_id: number;
  disponible: number;
}

const ConsultarCupos: React.FC = () => {
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEspacios = async () => {
    setLoading(true);
    const { data } = await supabase.from("espacios").select("*").order("codigo");
    setEspacios((data as Espacio[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
  fetchEspacios();
  const interval = setInterval(fetchEspacios, 30000);
  return () => clearInterval(interval);
}, []);

  const autos = espacios.filter(e => e.tipo_vehiculo_id === 1);
  const motos = espacios.filter(e => e.tipo_vehiculo_id === 2);
  const autosDisp = autos.filter(e => e.disponible === 1).length;
  const motosDisp = motos.filter(e => e.disponible === 1).length;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Consultar Cupos</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Disponibilidad en tiempo real — Actualización automática</p>
          </div>
          <button onClick={fetchEspacios} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card text-center">
            <Car className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold text-foreground">{autos.length}</p>
            <p className="text-sm text-muted-foreground">Total Autos</p>
          </div>
          <div className="stat-card text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{autosDisp}</p>
            <p className="text-sm text-muted-foreground">Autos Disponibles</p>
          </div>
          <div className="stat-card text-center">
            <Bike className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-foreground">{motos.length}</p>
            <p className="text-sm text-muted-foreground">Total Motos</p>
          </div>
          <div className="stat-card text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{motosDisp}</p>
            <p className="text-sm text-muted-foreground">Motos Disponibles</p>
          </div>
        </div>

        {/* Grid de espacios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Autos */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Espacios para Autos</h2>
              </div>
              <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
                {autosDisp}/{autos.length} libres
              </span>
            </div>
            <div className="p-4 grid grid-cols-5 gap-2">
              {autos.map(e => (
                <div
                  key={e.id}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all ${
                    e.disponible === 1
                      ? "bg-green-50 border-2 border-green-300 text-green-700"
                      : "bg-red-50 border-2 border-red-200 text-red-500"
                  }`}
                >
                  <ParkingSquare className="h-4 w-4 mb-0.5" />
                  {e.codigo}
                </div>
              ))}
            </div>
          </div>

          {/* Motos */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <Bike className="h-5 w-5 text-orange-500" />
                <h2 className="font-semibold text-foreground">Espacios para Motos</h2>
              </div>
              <span className="text-sm font-medium px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                {motosDisp}/{motos.length} libres
              </span>
            </div>
            <div className="p-4 grid grid-cols-5 gap-2">
              {motos.map(e => (
                <div
                  key={e.id}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all ${
                    e.disponible === 1
                      ? "bg-green-50 border-2 border-green-300 text-green-700"
                      : "bg-red-50 border-2 border-red-200 text-red-500"
                  }`}
                >
                  <ParkingSquare className="h-4 w-4 mb-0.5" />
                  {e.codigo}
                </div>
              ))}
            </div>
            <div className="px-5 pb-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-300 inline-block" />Disponible</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-200 inline-block" />Ocupado</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConsultarCupos;
