import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, MessageCircle, Phone, Star, Check } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApp } from "@/store/app-store";
import { districts } from "@/lib/gofast-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tracking/$orderId")({
  component: Tracking,
});

const steps = ["confirmed", "preparing", "on_the_way", "delivered"] as const;
const labels: Record<(typeof steps)[number], string> = {
  confirmed: "Pedido confirmado",
  preparing: "Preparando en tienda",
  on_the_way: "En camino",
  delivered: "Entregado",
};

function Tracking() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const { orders, updateOrder, addCredit } = useApp();
  const order = orders.find((o) => o.id === orderId);
  const [chatOpen, setChatOpen] = useState(false);
  const [pinPos, setPinPos] = useState(20);
  const [compensated, setCompensated] = useState(false);

  const [isDelayed] = useState(() => Math.random() < 0.4);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const reasons = [
    "Demora excesiva en la entrega",
    "Dirección de entrega incorrecta",
    "Productos agotados / Error en tienda",
    "Cambio de planes / Ya no lo necesito",
  ];

  useEffect(() => {
    if (!order || order.status === "delivered" || order.status === "refunded") return;

    const stages: { delay: number; status: (typeof steps)[number] }[] = [
      { delay: 2500, status: "preparing" },
      { delay: 7000, status: "on_the_way" },
      { delay: 15000, status: "delivered" },
    ];

    const timers = stages.map((s) =>
      setTimeout(() => {
        const currentOrder = useApp.getState().orders.find((o) => o.id === order.id);
        if (currentOrder && currentOrder.status !== "refunded" && currentOrder.status !== "delivered") {
          updateOrder(order.id, { status: s.status });
          if (s.status === "delivered") {
            toast.success("📦 ¡Tu pedido ha sido entregado!");
          }
        }
      }, s.delay)
    );

    let delayTimer: NodeJS.Timeout;
    if (isDelayed) {
      delayTimer = setTimeout(() => {
        const currentOrder = useApp.getState().orders.find((o) => o.id === order.id);
        if (currentOrder && currentOrder.status !== "delivered" && currentOrder.status !== "refunded" && !compensated) {
          addCredit(3, `Compensación demora pedido #${order.id.slice(-4).toUpperCase()}`);
          toast.warning("Tu pedido presenta demoras en ruta. S/3.00 de crédito añadidos.");
          setCompensated(true);
        }
      }, 11000);
    }

    return () => {
      timers.forEach(clearTimeout);
      if (delayTimer) clearTimeout(delayTimer);
    };
  }, [order?.id, isDelayed]);

  useEffect(() => {
    if (!order || order.status === "delivered" || order.status === "refunded") return;
    const interval = setInterval(() => {
      setPinPos((p) => (p >= 78 ? 20 : p + 1.5));
    }, 200);
    return () => clearInterval(interval);
  }, [order?.status]);

  if (!order) {
    return (
      <PhoneShell withNav={false}>
        <div className="p-6 text-center">
          <div>Orden no encontrada</div>
          <Button className="mt-4" onClick={() => navigate({ to: "/orders" })}>Mis órdenes</Button>
        </div>
      </PhoneShell>
    );
  }

  const district = districts.find((d) => d.id === order.districtId)!;
  
  const isRefunded = order.status === "refunded";
  const isDelivered = order.status === "delivered";
  const currentIdx = steps.indexOf(isRefunded ? "confirmed" : order.status);

  let headerTitle = "Pedido en camino";
  if (isRefunded) headerTitle = "Pedido Reembolsado";
  else if (isDelivered) headerTitle = "Pedido Entregado";

  function handleRefund() {
    const finalReason = refundReason === "Otro" ? customReason : refundReason;
    if (!finalReason) {
      toast.error("Por favor selecciona o escribe un motivo");
      return;
    }

    updateOrder(order.id, { status: "refunded" });
    addCredit(order.total, `Reembolso pedido #${order.id.slice(-4).toUpperCase()} - ${finalReason}`);
    
    setRefundOpen(false);
    toast.success(`💰 Reembolso de S/${order.total.toFixed(2)} abonado a tus créditos.`);
    navigate({ to: "/orders" });
  }

  return (
    <PhoneShell withNav={false}>
      <div className="sticky top-0 z-30 bg-card border-b px-4 pt-5 pb-3 flex items-center gap-3">
        <button onClick={() => navigate({ to: "/orders" })} className="active:scale-90">
          <ChevronLeft className="size-6" />
        </button>
        <div>
          <div className="font-bold">{headerTitle}</div>
          <div className="text-[11px] text-muted-foreground">
            {district.name} · {order.promisedMin}–{order.promisedMax} min
          </div>
        </div>
      </div>

      <div className="relative h-56 overflow-hidden bg-[linear-gradient(135deg,#e8f0e3_0%,#dceadb_50%,#cfe0d1_100%)]">
        <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 400 220" preserveAspectRatio="none">
          <path d="M0 110 Q100 60 200 110 T400 110" stroke="#9ab39d" strokeWidth="2" fill="none" strokeDasharray="6 4" />
          <path d="M0 60 L400 60" stroke="#cfd9c8" strokeWidth="1" />
          <path d="M0 160 L400 160" stroke="#cfd9c8" strokeWidth="1" />
          <path d="M100 0 L100 220" stroke="#cfd9c8" strokeWidth="1" />
          <path d="M280 0 L280 220" stroke="#cfd9c8" strokeWidth="1" />
        </svg>
        {!isRefunded && (
          <div className="absolute" style={{ left: `${isDelivered ? 85 : pinPos}%`, top: "42%" }}>
            <div className="animate-pin-bounce -translate-x-1/2 -translate-y-full">
              <div className="size-10 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-lg text-lg">
                {isDelivered ? "✅" : "🛵"}
              </div>
              <div className="size-2 rounded-full bg-primary mx-auto mt-0.5 shadow" />
            </div>
          </div>
        )}
        <div className="absolute right-6 bottom-6">
          <div className="size-8 rounded-full bg-secondary text-secondary-foreground grid place-items-center text-sm">
            {isRefunded ? "❌" : "🏠"}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {isRefunded && (
          <div className="rounded-2xl border-destructive/20 border bg-destructive/5 p-4 text-sm text-destructive leading-relaxed">
            <b>Pedido cancelado y reembolsado:</b> El importe total de <b>S/{order.total.toFixed(2)}</b> ha sido abonado inmediatamente a tu balance de créditos GoFast.
          </div>
        )}

        {!isRefunded && (
          <div className="rounded-2xl bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-primary/15 grid place-items-center text-xl">🧑‍🦱</div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{order.rider.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star className="size-3 fill-current text-warning" /> {order.rider.rating} · Moto {order.rider.plate}
                </div>
              </div>
              <button onClick={() => setChatOpen(true)} className="size-9 grid place-items-center rounded-full bg-muted active:scale-90">
                <MessageCircle className="size-4" />
              </button>
              <button className="size-9 grid place-items-center rounded-full bg-success text-success-foreground active:scale-90">
                <Phone className="size-4" />
              </button>
            </div>
          </div>
        )}

        {!isRefunded && (
          <div className="rounded-2xl bg-card p-4">
            <div className="font-semibold text-sm mb-3">Estado del pedido</div>
            <div className="space-y-3">
              {steps.map((s, i) => {
                const done = i <= currentIdx;
                const active = i === currentIdx;
                return (
                  <div key={s} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "size-6 rounded-full grid place-items-center text-[10px] transition",
                          done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {done ? <Check className="size-3.5" /> : i + 1}
                      </div>
                      {i < steps.length - 1 && (
                        <div className={cn("w-0.5 h-6 my-0.5", done ? "bg-success" : "bg-muted")} />
                      )}
                    </div>
                    <div className="pt-0.5">
                      <div className={cn("text-sm font-medium", active && "text-primary")}>{labels[s]}</div>
                      {active && (
                        <div className="text-[11px] text-muted-foreground">En proceso...</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!isRefunded && !isDelivered && (
          <div className="rounded-2xl bg-card p-4 space-y-2 border shadow-sm">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Acciones Rápidas (Demo)</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-xl text-xs font-bold border-primary text-primary hover:bg-primary/5 py-4 h-10"
                onClick={() => {
                  updateOrder(order.id, { status: "delivered" });
                  toast.success("📦 ¡Pedido marcado como entregado!");
                }}
              >
                Simular Entrega
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-xl text-xs font-bold border-destructive/20 text-destructive hover:bg-destructive/5 py-4 h-10"
                onClick={() => setRefundOpen(true)}
              >
                Reembolsar Pedido
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-card p-4">
          <div className="font-semibold text-sm mb-2">Resumen del pedido</div>
          <div className="text-xs text-muted-foreground space-y-1">
            {order.items.map((i) => (
              <div key={i.product.id} className="flex justify-between">
                <span>{i.qty}× {i.product.name}</span>
                <span>S/{(i.qty * i.product.price).toFixed(2)}</span>
              </div>
            ))}
            <div className="h-px bg-border my-1" />
            <div className="flex justify-between font-semibold text-foreground">
              <span>Total</span><span>S/{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Chat con {order.rider.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="rounded-2xl bg-muted p-3 max-w-[80%]">Hola, ya estoy en camino 🛵</div>
            <div className="rounded-2xl bg-primary text-primary-foreground p-3 max-w-[80%] ml-auto">¡Gracias! Te espero.</div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {["¿Cuánto falta?", "Toca el timbre", "Déjalo en portería", "Gracias 🙏"].map((m) => (
              <Button key={m} variant="outline" size="sm" onClick={() => toast(m)}>
                {m}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-left">Solicitud de Reembolso</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground leading-normal">
              Elige el motivo del reembolso. El total de <b>S/{order.total.toFixed(2)}</b> se acreditará a tu balance GoFast.
            </div>
            <div className="space-y-2 pt-1">
              {reasons.map((r) => (
                <button
                  key={r}
                  onClick={() => setRefundReason(r)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border text-xs font-medium transition",
                    refundReason === r ? "border-primary bg-primary/5 text-primary" : "bg-card hover:bg-muted/40"
                  )}
                >
                  {r}
                </button>
              ))}
              <button
                onClick={() => setRefundReason("Otro")}
                className={cn(
                  "w-full text-left p-3 rounded-xl border text-xs font-medium transition",
                  refundReason === "Otro" ? "border-primary bg-primary/5 text-primary" : "bg-card hover:bg-muted/40"
                )}
              >
                Otro motivo
              </button>
            </div>

            {refundReason === "Otro" && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Escribe el motivo detalladamente..."
                className="w-full h-20 p-2.5 rounded-xl border text-xs bg-muted/20 outline-none resize-none text-foreground"
              />
            )}

            <Button
              className="w-full rounded-xl font-bold mt-2 h-10 text-xs"
              onClick={handleRefund}
            >
              Confirmar Reembolso
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PhoneShell>
  );
}
