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

        <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="size-4 text-primary" /> GoFast Plus
          </div>
          <div className="text-sm text-muted-foreground mt-1">Envíos gratis ilimitados por S/29.90/mes</div>
          <Button size="sm" className="mt-3">Probar gratis 7 días</Button>
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
