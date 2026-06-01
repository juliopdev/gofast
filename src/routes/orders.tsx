import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useApp } from "@/store/app-store";
import { districts } from "@/lib/gofast-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orders")({
  component: Orders,
});

function Orders() {
  const { orders, addToCart } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState("active");
  const active = orders.filter((o) => o.status !== "delivered" && o.status !== "refunded");
  const past = orders.filter((o) => o.status === "delivered" || o.status === "refunded");

  return (
    <PhoneShell>
      <div className="px-5 pt-7 pb-3">
        <h1 className="text-2xl font-bold">Mis órdenes</h1>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="px-5">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="active">Activas</TabsTrigger>
          <TabsTrigger value="past">Pasadas</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4 space-y-3">
          {active.length === 0 ? (
            <Empty text="No tienes pedidos activos" />
          ) : (
            active.map((o) => {
              const d = districts.find((x) => x.id === o.districtId)!;
              return (
                <Link
                  key={o.id}
                  to="/tracking/$orderId"
                  params={{ orderId: o.id }}
                  className="block rounded-2xl bg-card p-4 active:scale-[0.98] transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm">{d.storeName} · {d.name}</div>
                    <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold">
                      {o.status === "confirmed" ? "Confirmado" : o.status === "preparing" ? "Preparando" : "En camino"}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {o.items.length} productos · S/{o.total.toFixed(2)}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="size-2 rounded-full bg-primary animate-pulse" />
                    <span className="font-semibold text-primary">Llega en {o.promisedMin}–{o.promisedMax} min</span>
                  </div>
                </Link>
              );
            })
          )}
        </TabsContent>
        <TabsContent value="past" className="mt-4 space-y-3">
          {past.length === 0 ? (
            <Empty text="Aún no tienes pedidos pasados" />
          ) : (
            past.map((o) => {
              const d = districts.find((x) => x.id === o.districtId)!;
              return (
                <div key={o.id} className="rounded-2xl bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm">{d.storeName} · {d.name}</div>
                    <span className={cn(
                      "text-[10px] font-bold px-2.5 py-0.5 rounded-full",
                      o.status === "refunded" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                    )}>
                      {o.status === "refunded" ? "Reembolsado" : "Entregado"}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {o.items.length} productos · S/{o.total.toFixed(2)}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-xl text-xs font-bold"
                      onClick={() => {
                        o.items.forEach((i) => {
                          for (let n = 0; n < i.qty; n++) addToCart(i.product);
                        });
                        navigate({ to: "/cart" });
                      }}
                    >
                      Reordenar
                    </Button>
                    {o.status === "delivered" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-xl text-xs font-bold border-primary/20 text-primary hover:bg-primary/5"
                        onClick={() => {
                          toast.success(`🧾 ¡Boleta del pedido #${o.id.slice(-4).toUpperCase()} descargada con éxito! (PDF)`);
                        }}
                      >
                        Descargar boleta
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>
      <div className="h-10" />
    </PhoneShell>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground">{text}</div>
  );
}
