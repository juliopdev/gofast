import { createFileRoute } from "@tanstack/react-router";
import { PhoneShell } from "@/components/PhoneShell";
import { useApp } from "@/store/app-store";
import { Wallet, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/credits")({
  component: Credits,
});

function Credits() {
  const { credits, creditHistory } = useApp();
  return (
    <PhoneShell>
      <div className="px-5 pt-7 pb-3">
        <h1 className="text-2xl font-bold">Créditos GoFast</h1>
      </div>
      <div className="px-5">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-orange-600 text-primary-foreground p-5">
          <div className="flex items-center gap-2 opacity-90 text-sm">
            <Wallet className="size-4" /> Balance disponible
          </div>
          <div className="mt-2 text-4xl font-black">S/{credits.toFixed(2)}</div>
          <div className="mt-1 text-xs opacity-80">Se aplican automáticamente en tu próximo pedido.</div>
        </div>

        <div className="mt-5 rounded-3xl border border-primary/20 bg-card p-5 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Recomendado
          </div>
          <div className="flex items-center gap-2 font-black text-lg">
            <Sparkles className="size-5 text-primary" /> GoFast Prime
          </div>
          <div className="mt-1 text-2xl font-black text-foreground">S/19.90 <span className="text-xs text-muted-foreground font-normal">/ mes</span></div>
          <div className="mt-3 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">✓</span> Envíos gratis ilimitados en compras mayores a S/30
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">✓</span> Prioridad de despacho garantizada en horas punta
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">✓</span> 5% de reembolso (cashback) directo en tus créditos
            </div>
          </div>
          <Button size="sm" className="mt-4 w-full rounded-xl py-4 h-10 font-bold">Probar 7 días gratis</Button>
        </div>

        <h2 className="mt-6 mb-2 text-sm font-bold text-muted-foreground">Historial</h2>
        <div className="space-y-2 pb-8">
          {creditHistory.map((h) => (
            <div key={h.id} className="flex items-center justify-between rounded-2xl bg-card p-3">
              <div>
                <div className="text-sm font-medium">{h.reason}</div>
                <div className="text-[11px] text-muted-foreground">
                  {new Date(h.at).toLocaleDateString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              <div className="text-success font-bold">+S/{h.amount.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>
    </PhoneShell>
  );
}
