import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Bike,
  Flame,
  Gauge,
  LayoutDashboard,
  MapPinned,
  Smile,
  TrendingUp,
  Zap,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useApp } from "@/store/app-store";
import { districts, type DistrictStatus } from "@/lib/gofast-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "GoFast War Room" }] }),
  component: WarRoom,
});

function WarRoom() {
  const [crisis, setCrisis] = useState(false);
  const [kpis, setKpis] = useState({
    activeOrders: 47,
    avgTime: 38,
    cancellations: 3,
    activeRiders: 17,
    sentiment: 72,
  });
  const [series, setSeries] = useState(() =>
    Array.from({ length: 12 }).map((_, i) => ({
      h: `${10 + Math.floor(i / 2)}:${i % 2 ? "30" : "00"}`,
      pedidos: 18 + Math.round(Math.random() * 25),
    }))
  );
  const { districtStatuses, setDistrictStatus } = useApp();

  useEffect(() => {
    const t = setInterval(() => {
      setKpis((k) => ({
        activeOrders: Math.max(20, k.activeOrders + Math.round((Math.random() - 0.4) * 6)),
        avgTime: Math.max(22, Math.min(70, k.avgTime + Math.round((Math.random() - 0.5) * 4))),
        cancellations: Math.max(0, k.cancellations + (Math.random() > 0.7 ? 1 : 0)),
        activeRiders: Math.max(10, Math.min(20, k.activeRiders + Math.round((Math.random() - 0.5) * 2))),
        sentiment: Math.max(40, Math.min(95, k.sentiment + Math.round((Math.random() - 0.5) * 4))),
      }));
      setSeries((s) => {
        const next = [...s.slice(1), { h: s[s.length - 1].h, pedidos: 18 + Math.round(Math.random() * 30) }];
        return next;
      });
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const alerts = [
    "14:32 — San Juan Bautista: tiempo promedio superó 50 min",
    "14:45 — @InfluencerX mencionó #GoFastNoCumple",
    "15:10 — CD Subtanjalla: 12 pedidos perdidos en cola",
    "15:22 — Ica Centro: pico de demanda detectado",
  ];

  return (
    <div className={cn("min-h-dvh flex bg-background transition-colors", crisis && "bg-orange-50")}>
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-sidebar text-sidebar-foreground p-5">
        <div className="flex items-center gap-2 font-black text-lg">
          <span className="size-8 grid place-items-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="size-4" fill="currentColor" />
          </span>
          GoFast <span className="text-primary">/ Ops</span>
        </div>
        <nav className="mt-8 space-y-1 text-sm">
          {[
            { icon: LayoutDashboard, label: "Dashboard", active: true },
            { icon: Bike, label: "Repartidores" },
            { icon: MapPinned, label: "Órdenes en vivo" },
            { icon: Bell, label: "Alertas" },
          ].map((i) => (
            <div
              key={i.label}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer",
                i.active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
              )}
            >
              <i.icon className="size-4" />
              {i.label}
            </div>
          ))}
        </nav>
        <Link to="/" className="mt-auto text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground">
          ← Volver a la app
        </Link>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">War Room · Ica</div>
            <h1 className="text-2xl md:text-3xl font-black">
              {crisis ? "🚨 Modo Crisis Activo" : "Operaciones en tiempo real"}
            </h1>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="md:hidden">
              <Button variant="outline" size="sm">← App</Button>
            </Link>
            <Button
              variant={crisis ? "destructive" : "default"}
              onClick={() => setCrisis((c) => !c)}
            >
              <Flame className="size-4 mr-2" />
              {crisis ? "Desactivar modo crisis" : "Activar modo crisis"}
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Kpi icon={BarChart3} label="Pedidos activos" value={kpis.activeOrders} />
          <Kpi icon={Gauge} label="Tiempo promedio" value={`${kpis.avgTime} min`} tone={kpis.avgTime > 45 ? "warn" : "ok"} />
          <Kpi icon={AlertTriangle} label="Cancelaciones (1h)" value={kpis.cancellations} tone={kpis.cancellations > 5 ? "warn" : "ok"} />
          <Kpi icon={Bike} label="Repartidores activos" value={`${kpis.activeRiders}/20`} />
          <Kpi icon={Smile} label="Sentimiento redes" value={`${kpis.sentiment}%`} tone={kpis.sentiment < 60 ? "warn" : "ok"} />
        </div>

        <div className="mt-6 grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl bg-card border p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold">Pedidos por hora</div>
                <div className="text-xs text-muted-foreground">Últimas 6 horas</div>
              </div>
              <TrendingUp className="size-4 text-primary" />
            </div>
            <div className="h-48 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <XAxis dataKey="h" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="pedidos" stroke="#FF6B00" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl bg-card border p-5">
            <div className="text-sm font-bold">Sentimiento en redes</div>
            <div className="mt-4 relative h-32 grid place-items-center">
              <svg viewBox="0 0 120 70" className="w-48">
                <path d="M10 60 A50 50 0 0 1 110 60" stroke="#eee" strokeWidth="10" fill="none" />
                <motion.path
                  d="M10 60 A50 50 0 0 1 110 60"
                  stroke={kpis.sentiment < 60 ? "#FF3D00" : "#FF6B00"}
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${(kpis.sentiment / 100) * 157} 157`}
                  strokeLinecap="round"
                  initial={false}
                  animate={{ strokeDasharray: `${(kpis.sentiment / 100) * 157} 157` }}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center pt-6">
                <div className="text-3xl font-black">{kpis.sentiment}%</div>
              </div>
            </div>
            <div className="text-xs text-center text-muted-foreground">positivo</div>
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-card border p-5">
            <div className="text-sm font-bold mb-3">Mapa de calor de distritos</div>
            <div className="space-y-2">
              {districts.map((d) => {
                const s = districtStatuses[d.id];
                return (
                  <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                    <StatusPill status={s} />
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{d.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {d.riders} repartidores · cola {d.queue}
                      </div>
                    </div>
                    <select
                      value={s}
                      onChange={(e) => setDistrictStatus(d.id, e.target.value as DistrictStatus)}
                      className="text-xs border rounded-md px-2 py-1 bg-background"
                    >
                      <option value="green">Verde</option>
                      <option value="yellow">Amarillo</option>
                      <option value="red">Rojo (pausar)</option>
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-card border p-5">
            <div className="text-sm font-bold mb-3 flex items-center gap-2">
              <Bell className="size-4 text-primary" /> Alertas recientes
            </div>
            <ul className="space-y-2">
              {alerts.map((a, i) => (
                <li key={i} className="text-xs p-3 rounded-xl bg-muted/40 border-l-2 border-primary">
                  {a}
                </li>
              ))}
            </ul>
            {crisis && (
              <div className="mt-4 rounded-xl border-2 border-primary p-3 bg-primary/10">
                <div className="text-xs font-bold text-primary mb-2">Protocolo de emergencia</div>
                <ul className="text-xs space-y-1">
                  <li>☐ Pausar zonas en rojo</li>
                  <li>☐ Activar bono a repartidores activos</li>
                  <li>☐ Publicar comunicado en redes</li>
                  <li>☐ Notificar al CEO y a Soporte</li>
                  <li>☐ Habilitar créditos automáticos x2</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  tone = "ok",
}: {
  icon: typeof BarChart3;
  label: string;
  value: React.ReactNode;
  tone?: "ok" | "warn";
}) {
  return (
    <div className="rounded-2xl bg-card border p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <div className={cn("mt-2 text-2xl font-black", tone === "warn" ? "text-destructive" : "text-foreground")}>
        {value}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: DistrictStatus }) {
  const map = {
    green: { bg: "bg-success", label: "OK" },
    yellow: { bg: "bg-warning", label: "Demora" },
    red: { bg: "bg-destructive", label: "Pausa" },
  } as const;
  const v = map[status];
  return (
    <div className={cn("text-[10px] font-bold text-white px-2 py-1 rounded-md w-16 text-center", v.bg)}>
      {v.label}
    </div>
  );
}
