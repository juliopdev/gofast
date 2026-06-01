import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { useApp, type Order } from "@/store/app-store";
import { districts } from "@/lib/gofast-data";
import { Button } from "@/components/ui/button";
import {
  Bike,
  ShieldAlert,
  CheckCircle2,
  ChevronLeft,
  MapPin,
  Receipt,
  ArrowLeftRight,
  Eye,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/carrier")({
  head: () => ({
    meta: [{ title: "GoFast Portal de Repartidores" }],
  }),
  component: CarrierPortal,
});

function CarrierPortal() {
  const navigate = useNavigate();
  const { orders, updateOrder } = useApp();
  const [isOnline, setIsOnline] = useState(true);
  const [sessionTaken, setSessionTaken] = useState(1);
  const [activeTab, setActiveTab] = useState<"available" | "my-deliveries">("available");
  const [carrierDistrictId, setCarrierDistrictId] = useState("ica");
  const [viewProductsOrder, setViewProductsOrder] = useState<Order | null>(null);

  const activeDistrict = districts.find((d) => d.id === carrierDistrictId) ?? districts[0];

  const availableOrders = orders.filter(
    (o) => o.status === "confirmed" && o.districtId === carrierDistrictId && !o.rider.name.includes("Tú")
  );

  const myDeliveries = orders.filter(
    (o) => o.rider.name.includes("Tú") && (o.status === "on_the_way" || o.status === "delivered")
  );

  const pendingDeliveries = myDeliveries.filter((o) => o.status === "on_the_way");

  const deliveredMyOrders = myDeliveries.filter((o) => o.status === "delivered");
  const gananciaHoy = deliveredMyOrders.reduce((acc, o) => {
    const baseFee = 5.00;
    const expressExtra = o.expressShipping ? 2.00 : 0;
    const latePenalty = o.isLateForRider ? 1.50 : 0;
    return acc + baseFee + expressExtra - latePenalty;
  }, 0);

  const takenCount = sessionTaken;

  function takeOrder(orderId: string) {
    if (takenCount >= 3) {
      toast.error("¡Límite alcanzado! No puedes tomar más de 3 pedidos por hora.");
      return;
    }

    updateOrder(orderId, {
      status: "on_the_way",
      rider: { name: "Tú (Rider GoFast)", rating: 5.0, plate: "RIDER-99" },
      elapsedMinutesSimulated: 10,
    });
    setSessionTaken((prev) => prev + 1);
    toast.success("¡Pedido tomado! Dirígete a la tienda a recoger los productos.");
    setActiveTab("my-deliveries");
  }

  function deliverOrder(orderId: string, elapsedMinutes: number, promisedMax: number) {
    const isLate = elapsedMinutes > promisedMax;

    updateOrder(orderId, {
      status: "delivered",
      isLateForRider: isLate,
    });

    if (isLate) {
      toast.warning("¡Pedido entregado con retraso! Se aplicó una penalización de S/1.50 a tu ganancia.");
    } else {
      toast.success("¡Pedido entregado a tiempo! ¡Excelente servicio!");
    }
  }

  return (
    <PhoneShell withNav={false}>
      <div className="sticky top-0 z-30 bg-slate-900 text-slate-100 border-b border-slate-800 px-4 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: "/profile" })} className="active:scale-90 text-slate-400 hover:text-white">
            <ChevronLeft className="size-6" />
          </button>
          <div className="flex-1">
            <div className="text-[10px] text-primary font-bold uppercase tracking-wider">Portal Rider</div>
            <div className="font-bold text-sm">Panel de Control 🏍️</div>
          </div>
          <button
            onClick={() => {
              setIsOnline(!isOnline);
              toast.info(isOnline ? "Estás Fuera de Servicio" : "Estás En Servicio y Disponible");
            }}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold transition-all",
              isOnline ? "bg-success/20 text-success border border-success/30 animate-pulse" : "bg-muted text-muted-foreground border"
            )}
          >
            {isOnline ? "Disponible" : "Offline"}
          </button>
        </div>
      </div>

      <div className="bg-slate-900 text-slate-100 px-4 pb-5 rounded-b-3xl space-y-4">
        <div className="rounded-2xl bg-slate-850 p-3.5 border border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Sede de Trabajo</div>
            <div className="text-xs text-slate-300 font-medium mt-0.5">{activeDistrict.storeName} · {activeDistrict.name}</div>
          </div>
          <select
            value={carrierDistrictId}
            onChange={(e) => {
              setCarrierDistrictId(e.target.value);
              toast.success(`Cambiando de sede a: ${districts.find(d => d.id === e.target.value)?.name}`);
            }}
            className="bg-slate-800 text-white rounded-xl text-xs py-1.5 px-2.5 border border-slate-700 outline-none font-bold cursor-pointer"
          >
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name.split(" ")[0]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/50">
            <div className="text-xs text-slate-400">Pedidos esta hora</div>
            <div className="mt-1 text-2xl font-black text-white">{takenCount} <span className="text-xs text-slate-400 font-normal">/ 3 máx</span></div>
            <div className="mt-2 h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  takenCount === 1 ? "bg-success" : takenCount === 2 ? "bg-warning" : "bg-destructive"
                )}
                style={{ width: `${(takenCount / 3) * 100}%` }}
              />
            </div>
          </div>
          <div className="rounded-2xl bg-slate-800/80 p-4 border border-slate-700/50 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-400">Ganancia hoy</div>
              <div className="mt-1 text-2xl font-black text-success">S/{gananciaHoy.toFixed(2)}</div>
            </div>
            <div className="text-[9px] text-slate-500 font-medium leading-none mt-1">Suma al marcar como Entregado</div>
          </div>
        </div>

        {takenCount >= 3 && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-warning/10 border border-warning/30 text-warning p-3 text-xs leading-normal">
            <ShieldAlert className="size-4 flex-shrink-0 mt-0.5" />
            <div>
              <b>Límite de fatiga activo:</b> Has alcanzado el máximo de 3 entregas por hora. Descansa un momento para cuidar tu seguridad.
            </div>
          </div>
        )}
      </div>

      <div className="px-4 mt-5 flex gap-2">
        <button
          onClick={() => setActiveTab("available")}
          className={cn(
            "flex-1 py-3 text-xs font-bold rounded-xl border transition-all active:scale-[0.98]",
            activeTab === "available"
              ? "bg-slate-900 border-slate-900 text-white shadow-md"
              : "bg-card text-muted-foreground"
          )}
        >
          Pedidos en Espera ({availableOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("my-deliveries")}
          className={cn(
            "flex-1 py-3 text-xs font-bold rounded-xl border transition-all active:scale-[0.98]",
            activeTab === "my-deliveries"
              ? "bg-slate-900 border-slate-900 text-white shadow-md"
              : "bg-card text-muted-foreground"
          )}
        >
          Mis Entregas ({myDeliveries.length})
        </button>
      </div>

      <div className="px-4 py-4 space-y-3 pb-24">
        {activeTab === "available" ? (
          !isOnline ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <div className="text-4xl mb-2">😴</div>
              <p>Ponte en modo <b>Disponible</b> arriba a la derecha para ver pedidos pendientes.</p>
            </div>
          ) : availableOrders.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm bg-card rounded-2xl border border-dashed p-6">
              <div className="text-4xl mb-2">📡</div>
              <p className="font-semibold text-foreground">No hay pedidos disponibles</p>
              <p className="text-xs mt-1">No hay pedidos pendientes en la sede de <b>{activeDistrict.name}</b>. Cambia de distrito arriba o realiza una compra en la app para ver pedidos aquí.</p>
            </div>
          ) : (
            availableOrders.map((o) => {
              const d = districts.find((dist) => dist.id === o.districtId)!;
              const earningsEstimate = 5.00 + (o.expressShipping ? 2.00 : 0);
              return (
                <div key={o.id} className="rounded-2xl border bg-card p-4 shadow-sm space-y-3 relative overflow-hidden">
                  {o.expressShipping && (
                    <div className="absolute top-0 right-0 bg-yellow-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-bl-lg uppercase">
                      ⚡ Express
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground font-semibold">Código: #{o.id.slice(-4).toUpperCase()}</div>
                      <div className="font-bold text-sm mt-0.5">{d.storeName} — {d.name}</div>
                    </div>
                    <div className="text-sm font-bold text-primary">Ganancia: S/{earningsEstimate.toFixed(2)}</div>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground border-y py-2.5 my-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-primary flex-shrink-0" />
                      <span className="line-clamp-1">{d.storeAddress}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Receipt className="size-3.5 text-primary flex-shrink-0" />
                      <span>{o.items.reduce((a, c) => a + c.qty, 0)} productos · Pago: Yape/Plin</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => takeOrder(o.id)}
                    disabled={takenCount >= 3}
                    className="w-full rounded-xl h-10 font-bold text-xs"
                  >
                    <Bike className="size-4 mr-1.5" /> Tomar Pedido
                  </Button>
                </div>
              );
            })
          )
        ) : myDeliveries.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm bg-card rounded-2xl border border-dashed p-6">
            <div className="text-4xl mb-2">📦</div>
            <p className="font-semibold text-foreground">No tienes entregas activas ni pasadas</p>
            <p className="text-xs mt-1">Ve a la pestaña de "Pedidos en Espera" para tomar un servicio.</p>
          </div>
        ) : (
          myDeliveries.map((o) => {
            const d = districts.find((dist) => dist.id === o.districtId)!;
            const isCompleted = o.status === "delivered";
            
            const elapsedMinutes = o.elapsedMinutesSimulated ?? 10;
            const isLate = elapsedMinutes > o.promisedMax;
            const isWarning = elapsedMinutes >= o.promisedMin && elapsedMinutes <= o.promisedMax;
            
            const baseFee = 5.00;
            const expressExtra = o.expressShipping ? 2.00 : 0;
            const latePenalty = isLate ? 1.50 : 0;
            const earnings = baseFee + expressExtra - latePenalty;

            return (
              <div
                key={o.id}
                className={cn(
                  "rounded-2xl border p-4 shadow-sm space-y-3 relative overflow-hidden transition",
                  isCompleted ? "border-success/20 bg-success/5" : "border-primary/20 bg-card"
                )}
              >
                {o.expressShipping && (
                  <div className="absolute top-0 right-0 bg-yellow-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-bl-lg uppercase">
                    ⚡ Express
                  </div>
                )}
                
                <div className="flex items-start justify-between">
                  <div>
                    {isCompleted ? (
                      <div className="text-xs text-success font-black flex items-center gap-1">
                        <CheckCircle className="size-3.5" /> ENTREGADO
                      </div>
                    ) : (
                      <div className="text-xs text-primary font-bold flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-primary animate-ping" /> En Curso
                      </div>
                    )}
                    <div className="font-bold text-sm mt-0.5">{d.storeName} — {d.name}</div>
                  </div>
                  <div className="text-xs text-muted-foreground font-semibold">#{o.id.slice(-4).toUpperCase()}</div>
                </div>

                {!isCompleted && (
                  <div className="flex items-center justify-between rounded-xl bg-muted/40 p-2.5 border">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "size-3 rounded-full animate-pulse",
                        isLate ? "bg-destructive" : isWarning ? "bg-warning" : "bg-success"
                      )} />
                      <div className="text-[11px] font-black">
                        {isLate && <span className="text-destructive">🔴 Retrasado: {elapsedMinutes} min</span>}
                        {isWarning && <span className="text-warning">🟡 En límite: {elapsedMinutes} min</span>}
                        {!isLate && !isWarning && <span className="text-success">🟢 A tiempo: {elapsedMinutes} min</span>}
                        <span className="text-muted-foreground font-normal"> (Promesa: {o.promisedMin}-{o.promisedMax}m)</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        updateOrder(o.id, { elapsedMinutesSimulated: elapsedMinutes + 5 });
                        toast.info(`Simulando paso del tiempo: +5 min (Transcurrido: ${elapsedMinutes + 5} min)`);
                      }}
                      className="bg-slate-800 text-white rounded-lg text-[9px] px-2 py-1 border hover:bg-slate-750 active:scale-95 font-bold"
                    >
                      ⏱️ +5 min
                    </button>
                  </div>
                )}

                <div className="space-y-1 text-xs text-muted-foreground border-y py-2.5 my-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-primary flex-shrink-0" />
                    <span className="line-clamp-1">{d.storeAddress}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-between">
                    <div className="flex items-center gap-1.5">
                      <ArrowLeftRight className="size-3.5 text-primary flex-shrink-0" />
                      <span>
                        {isCompleted 
                          ? `Entregado en: ${elapsedMinutes} min` 
                          : `Tiempo de entrega: ${o.promisedMin}–${o.promisedMax} min`
                        }
                      </span>
                    </div>
                    {isCompleted && isLate && (
                      <span className="text-[10px] text-destructive bg-destructive/15 px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
                        <AlertCircle className="size-3" /> Penalización aplicada
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pb-1">
                  <span className="text-muted-foreground">Ganancia acumulada:</span>
                  <span className={cn("font-bold text-sm", isCompleted ? "text-success" : "text-muted-foreground")}>
                    S/{earnings.toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    onClick={() => setViewProductsOrder(o)}
                    className="flex-1 rounded-xl h-10 text-xs font-bold border-slate-300"
                  >
                    <Eye className="size-3.5 mr-1" /> Ver Productos
                  </Button>
                  {!isCompleted && (
                    <Button
                      onClick={() => deliverOrder(o.id, elapsedMinutes, o.promisedMax)}
                      className="flex-1 bg-success hover:bg-success-dark text-white rounded-xl h-10 text-xs font-bold"
                    >
                      <CheckCircle2 className="size-3.5 mr-1" /> Marcar Entregado
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={!!viewProductsOrder} onOpenChange={() => setViewProductsOrder(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-left font-bold text-sm">Productos del Pedido #{viewProductsOrder?.id.slice(-4).toUpperCase()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2 text-xs text-muted-foreground">
            {viewProductsOrder?.items.map((i) => (
              <div key={i.product.id} className="flex items-center justify-between">
                <span>{i.product.emoji} {i.qty}× {i.product.name}</span>
                <span className="font-bold text-foreground">S/{(i.qty * i.product.price).toFixed(2)}</span>
              </div>
            ))}
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between font-bold text-foreground text-sm">
              <span>Total del pedido</span>
              <span>S/{viewProductsOrder?.total.toFixed(2)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PhoneShell>
  );
}
