import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Clock, Gift, Minus, Plus, Trash2 } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { districts, estimateDelivery, ridersByDistrict } from "@/lib/gofast-data";
import { useApp, cartSubtotal } from "@/store/app-store";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  component: Cart,
});

function Cart() {
  const navigate = useNavigate();
  const { cart, districtId, addToCart, decFromCart, removeFromCart, clearCart, addOrder, addCredit, credits } =
    useApp();
  const district = districts.find((d) => d.id === districtId)!;
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  const [expressShipping, setExpressShipping] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [applyCredits, setApplyCredits] = useState(false);

  const itemCount = cart.reduce((a, c) => a + c.qty, 0);
  const subtotal = cartSubtotal(cart);
  const delivery = useMemo(() => 5 + Math.round(district.extraMinutes / 5), [district]);

  const expressCost = expressShipping ? 2 : 0;
  const deliveryDiscount = couponApplied === "BIENVENIDA" ? delivery : 0;
  const subtotalAfterCoupon = subtotal + delivery + expressCost - deliveryDiscount;
  const usableCredits = applyCredits ? Math.min(credits, subtotalAfterCoupon) : 0;
  const finalTotal = Math.max(0, subtotalAfterCoupon - usableCredits);

  const est = estimateDelivery(districtId, itemCount);
  const estMin = expressShipping ? Math.max(10, est.min - 8) : est.min;
  const estMax = expressShipping ? Math.max(15, est.max - 8) : est.max;
  const longWindow = estMax > 45;

  function checkout() {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setSuccess(true);
      const orderId = `o${Date.now()}`;
      const rider =
        ridersByDistrict[districtId]?.[0] ?? { name: "Repartidor", rating: 4.8, plate: "MA-0000" };
      
      addOrder({
        id: orderId,
        districtId,
        items: cart,
        subtotal,
        delivery: couponApplied === "BIENVENIDA" ? 0 : delivery,
        total: finalTotal,
        promisedMin: estMin,
        promisedMax: estMax,
        createdAt: Date.now(),
        status: "confirmed",
        rider,
        creditsAwarded: longWindow ? 3 : 0,
        expressShipping,
        couponApplied,
        creditUsed: usableCredits,
      });

      if (usableCredits > 0) {
        addCredit(-usableCredits, `Compra en tienda - Pedido #${orderId.slice(-4)}`);
      }

      if (longWindow) {
        addCredit(3, `Ventana extendida - ${district.name}`);
        toast.success("S/3.00 de crédito añadidos a tu cuenta");
      }
      clearCart();
      setTimeout(() => {
        setSuccess(false);
        navigate({ to: "/tracking/$orderId", params: { orderId } });
      }, 1600);
    }, 1400);
  }

  if (cart.length === 0 && !success) {
    return (
      <PhoneShell withNav={false}>
        <Header onBack={() => navigate({ to: "/" })} title="Carrito" />
        <div className="px-6 py-20 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <div className="font-semibold">Tu carrito está vacío</div>
          <Button className="mt-6" onClick={() => navigate({ to: "/" })}>
            Explorar tiendas
          </Button>
        </div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell withNav={false}>
      <Header onBack={() => navigate({ to: "/catalog/$store", params: { store: districtId } })} title="Tu carrito" />

      <div className="px-4 py-4 space-y-2">
        {cart.map((c) => (
          <div key={c.product.id} className="flex items-center gap-3 rounded-2xl bg-card p-3">
            <div className="size-14 rounded-xl bg-muted grid place-items-center text-2xl">
              {c.product.emoji}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold leading-tight">{c.product.name}</div>
              <div className="text-xs text-muted-foreground">{c.product.unit} · S/{c.product.price.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => decFromCart(c.product.id)}
                className="size-7 grid place-items-center rounded-full bg-muted active:scale-90"
              >
                {c.qty === 1 ? <Trash2 className="size-3.5" /> : <Minus className="size-3.5" />}
              </button>
              <span className="text-sm font-bold min-w-4 text-center">{c.qty}</span>
              <button
                onClick={() => addToCart(c.product)}
                className="size-7 grid place-items-center rounded-full bg-primary text-primary-foreground active:scale-90"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
        {cart.length > 0 && (
          <button onClick={clearCart} className="text-xs text-muted-foreground underline ml-2">
            Vaciar carrito
          </button>
        )}
      </div>

      <div className="px-4 mt-2">
        <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-2 font-semibold">
            <Clock className="size-4 text-primary" />
            Tiempo estimado de entrega {expressShipping && "⚡ Express"}
          </div>
          <div className="mt-1 text-2xl font-black text-primary">
            {estMin}–{estMax} min
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Calculado con tu zona ({district.name}), {itemCount} producto{itemCount !== 1 ? "s" : ""} y la
            cola actual. {expressShipping && "Envío Express priorizado."}
          </div>
          {longWindow && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-start gap-2 rounded-xl bg-primary text-primary-foreground p-3"
            >
              <Gift className="size-5 mt-0.5" />
              <div className="text-sm font-medium">
                Te regalamos <b>S/3.00 de crédito</b> por aceptar esta ventana de entrega.
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="px-4 mt-4">
        <div className="rounded-2xl border bg-card p-4 flex items-center justify-between shadow-sm">
          <div className="flex-1 pr-3">
            <div className="flex items-center gap-1.5 font-bold text-sm">
              <span>⚡</span> Envío Express / Prioritario
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Prioriza tu pedido para recibirlo 5–10 min antes por <b>+S/2.00</b>.
            </div>
          </div>
          <input
            type="checkbox"
            checked={expressShipping}
            onChange={(e) => setExpressShipping(e.target.checked)}
            className="size-5 accent-primary cursor-pointer rounded"
          />
        </div>
      </div>

      <div className="px-4 mt-3">
        <div className="rounded-2xl border bg-card p-4 shadow-sm space-y-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">¿Tienes un cupón?</div>
          <div className="flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Código (ej: BIENVENIDA)"
              disabled={!!couponApplied}
              className="flex-1 h-10 px-3 rounded-xl border bg-muted/30 text-sm outline-none uppercase placeholder:normal-case disabled:opacity-50 text-foreground"
            />
            {couponApplied ? (
              <Button
                variant="outline"
                size="sm"
                className="h-10 text-destructive border-destructive/20 bg-destructive/5 rounded-xl text-xs font-bold"
                onClick={() => {
                  setCouponApplied(null);
                  setCouponInput("");
                }}
              >
                Quitar
              </Button>
            ) : (
              <Button
                size="sm"
                className="h-10 rounded-xl px-4 text-xs font-bold"
                onClick={() => {
                  if (couponInput.trim().toUpperCase() === "BIENVENIDA") {
                    setCouponApplied("BIENVENIDA");
                    toast.success("¡Cupón BIENVENIDA aplicado! Envío gratis.");
                  } else {
                    toast.error("Cupón no válido");
                  }
                }}
              >
                Aplicar
              </Button>
            )}
          </div>
          {couponApplied && (
            <div className="text-xs text-success font-semibold flex items-center gap-1">
              ✓ Cupón BIENVENIDA aplicado (¡Envío gratis!)
            </div>
          )}
        </div>
      </div>

      <div className="px-4 mt-3">
        <div className="rounded-2xl border bg-card p-4 flex items-center justify-between shadow-sm">
          <div className="flex-1 pr-3">
            <div className="flex items-center gap-1.5 font-bold text-sm">
              <span>💼</span> Usar Créditos Disponibles
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Tienes <b>S/{credits.toFixed(2)}</b> de saldo.
            </div>
          </div>
          <input
            type="checkbox"
            checked={applyCredits}
            disabled={credits <= 0}
            onChange={(e) => setApplyCredits(e.target.checked)}
            className="size-5 accent-primary cursor-pointer rounded disabled:opacity-50"
          />
        </div>
      </div>

      <div className="px-4 mt-4 space-y-1.5 text-sm">
        <Row label="Subtotal" value={`S/${subtotal.toFixed(2)}`} />
        <Row label="Envío" value={`S/${delivery.toFixed(2)}`} />
        {expressShipping && (
          <Row label="Envío Express" value="+S/2.00" />
        )}
        {couponApplied && (
          <Row label={<span className="text-success font-medium">Cupón BIENVENIDA</span>} value={<span className="text-success font-medium">-S/{delivery.toFixed(2)}</span>} />
        )}
        {usableCredits > 0 && (
          <Row label={<span className="text-success font-medium">Créditos usados</span>} value={<span className="text-success font-medium">-S/{usableCredits.toFixed(2)}</span>} />
        )}
        <div className="h-px bg-border my-2" />
        <Row label={<span className="font-bold">Total</span>} value={<span className="font-bold text-base text-primary">S/{finalTotal.toFixed(2)}</span>} />
      </div>

      <div className="p-4 pb-8">
        <Button
          className="w-full h-14 rounded-2xl text-base font-semibold"
          disabled={paying}
          onClick={checkout}
        >
          {paying ? "Procesando..." : `Pagar con Yape/Plin · S/${finalTotal.toFixed(2)}`}
        </Button>
      </div>

      <Dialog open={success}>
        <DialogContent className="max-w-xs text-center">
          <DialogHeader>
            <DialogTitle className="text-center">¡Pago confirmado!</DialogTitle>
          </DialogHeader>
          <div className="text-5xl">✅</div>
          <div className="text-sm text-muted-foreground">Buscando repartidor disponible...</div>
          <div className="flex justify-center gap-1 mt-2">
            <span className="size-2 rounded-full bg-primary animate-bounce" />
            <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:0.15s]" />
            <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:0.3s]" />
          </div>
        </DialogContent>
      </Dialog>
    </PhoneShell>
  );
}

function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="sticky top-0 z-30 bg-card border-b px-4 pt-5 pb-3 flex items-center gap-3">
      <button onClick={onBack} className="active:scale-90">
        <ChevronLeft className="size-6" />
      </button>
      <div className="font-bold">{title}</div>
    </div>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
