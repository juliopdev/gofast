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

  useEffect(() => {
    if (!order) return;
    const stages: { delay: number; status: (typeof steps)[number] }[] = [
      { delay: 2500, status: "preparing" },
      { delay: 7000, status: "on_the_way" },
    ];
    const timers = stages.map((s) =>
      setTimeout(() => updateOrder(order.id, { status: s.status }), s.delay)
    );
    // simulated delay compensation after 12s
    const delayTimer = setTimeout(() => {
      if (!compensated) {
        addCredit(5, "Retraso en entrega - compensación automática");
        toast.warning("Tu pedido se retrasa. S/5 de crédito han sido añadidos.");
        setCompensated(true);
      }
    }, 12000);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(delayTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPinPos((p) => (p >= 78 ? 20 : p + 1.5));
    }, 200);
    return () => clearInterval(interval);
  }, []);

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
  const currentIdx = steps.indexOf(order.status);

  return (
    <PhoneShell withNav={false}>
      <div className="sticky top-0 z-30 bg-card border-b px-4 pt-5 pb-3 flex items-center gap-3">
        <button onClick={() => navigate({ to: "/orders" })} className="active:scale-90">
          <ChevronLeft className="size-6" />
        </button>
        <div>
          <div className="font-bold">Pedido en camino</div>
          <div className="text-[11px] text-muted-foreground">{district.name} · {order.promisedMin}–{order.promisedMax} min</div>
        </div>
      </div>

      {/* simulated map */}
      <div className="relative h-56 overflow-hidden bg-[linear-gradient(135deg,#e8f0e3_0%,#dceadb_50%,#cfe0d1_100%)]">
        <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 400 220" preserveAspectRatio="none">
          <path d="M0 110 Q100 60 200 110 T400 110" stroke="#9ab39d" strokeWidth="2" fill="none" strokeDasharray="6 4" />
          <path d="M0 60 L400 60" stroke="#cfd9c8" strokeWidth="1" />
          <path d="M0 160 L400 160" stroke="#cfd9c8" strokeWidth="1" />
          <path d="M100 0 L100 220" stroke="#cfd9c8" strokeWidth="1" />
          <path d="M280 0 L280 220" stroke="#cfd9c8" strokeWidth="1" />
        </svg>
        <div className="absolute" style={{ left: `${pinPos}%`, top: "42%" }}>
          <div className="animate-pin-bounce -translate-x-1/2 -translate-y-full">
            <div className="size-10 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-lg">
              🛵
            </div>
            <div className="size-2 rounded-full bg-primary mx-auto mt-0.5 shadow" />
          </div>
        </div>
        <div className="absolute right-6 bottom-6">
          <div className="size-8 rounded-full bg-secondary text-secondary-foreground grid place-items-center text-sm">🏠</div>
        </div>
      </div>

      <div className="p-4">
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

        <div className="mt-4 rounded-2xl bg-card p-4">
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

        <div className="mt-4 rounded-2xl bg-card p-4">
          <div className="font-semibold text-sm mb-2">Resumen</div>
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
    </PhoneShell>
  );
}
