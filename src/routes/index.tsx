import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, AlertTriangle, Search, ShoppingBag, Store, Gift } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { districts, categories } from "@/lib/gofast-data";
import { useApp } from "@/store/app-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "GoFast Market — Inicio" }],
  }),
  component: Home,
});

function Home() {
  const { districtId, setDistrict, districtStatuses } = useApp();
  const navigate = useNavigate();
  const district = districts.find((d) => d.id === districtId)!;
  const status = districtStatuses[districtId];
  const [pickerOpen, setPickerOpen] = useState(false);
  const [notifyPhone, setNotifyPhone] = useState("");
  const [notifySent, setNotifySent] = useState(false);

  return (
    <PhoneShell>
      <div className="bg-secondary text-secondary-foreground px-5 pt-6 pb-8 rounded-b-3xl">
        <div className="text-xs opacity-70">Entregando en</div>
        <Drawer open={pickerOpen} onOpenChange={setPickerOpen}>
          <DrawerTrigger asChild>
            <button className="mt-1 flex items-center gap-1.5 active:scale-95 transition-transform">
              <span className="text-lg font-bold">{district.name}</span>
              <ChevronDown className="size-4" />
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Elige tu distrito</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6 space-y-2">
              {districts.map((d) => {
                const s = districtStatuses[d.id];
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      setDistrict(d.id);
                      setPickerOpen(false);
                      setNotifySent(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between rounded-2xl border bg-card p-4 text-left active:scale-[0.98] transition",
                      d.id === districtId && "border-primary ring-2 ring-primary/20"
                    )}
                  >
                    <div>
                      <div className="font-semibold text-card-foreground">{d.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {d.storeName} · {d.riders} repartidores
                      </div>
                    </div>
                    <StatusDot status={s} />
                  </button>
                );
              })}
            </div>
          </DrawerContent>
        </Drawer>
        <div className="mt-1 text-xs opacity-70">{district.storeAddress}</div>

        <div className="mt-5 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            placeholder="Busca productos, marcas..."
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white text-foreground placeholder:text-muted-foreground text-sm font-medium outline-none"
          />
        </div>
      </div>

      <div className="px-5 -mt-4">
        {status === "yellow" && (
          <Alert
            tone="warning"
            title="⚠️ Alta demanda en esta zona"
            body={`Entrega estimada: 50–65 min. Te daremos S/10 de crédito por tu paciencia.`}
          />
        )}
        {status === "red" && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-foreground">
            <div className="flex items-start gap-2">
              <AlertTriangle className="size-5 text-destructive mt-0.5" />
              <div>
                <div className="font-semibold">Servicio pausado en esta zona</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Estamos reorganizando operaciones. ¿Deseas que te avisemos cuando volvamos?
                </p>
                {!notifySent ? (
                  <div className="mt-3 flex gap-2">
                    <input
                      value={notifyPhone}
                      onChange={(e) => setNotifyPhone(e.target.value)}
                      placeholder="999 999 999"
                      className="flex-1 h-10 px-3 rounded-xl border bg-card text-sm outline-none"
                    />
                    <Button size="sm" onClick={() => setNotifySent(true)}>
                      Avisarme
                    </Button>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-success font-medium">
                    ✓ Te avisaremos al {notifyPhone}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 mt-5">
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="rounded-2xl bg-gradient-to-br from-primary to-orange-500 p-4 text-primary-foreground flex items-center gap-3"
        >
          <Gift className="size-8" />
          <div>
            <div className="font-bold">Envío gratis en tu primera compra</div>
            <div className="text-xs opacity-90">Usa código BIENVENIDA</div>
          </div>
        </motion.div>
      </div>

      <div className="px-5 mt-6">
        <h2 className="text-base font-bold mb-3">Categorías</h2>
        <div className="grid grid-cols-4 gap-3">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate({ to: "/catalog/$store", params: { store: districtId } })}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-3 active:scale-95 transition"
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-[10px] font-medium text-center leading-tight">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-6 mb-8">
        <h2 className="text-base font-bold mb-3">Tiendas en {district.name}</h2>
        <Link
          to="/catalog/$store"
          params={{ store: districtId }}
          className={cn(
            "block rounded-2xl bg-card border p-4 active:scale-[0.98] transition",
            status === "red" && "opacity-50 pointer-events-none"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <Store className="size-6" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-card-foreground">{district.storeName}</div>
              <div className="text-xs text-muted-foreground">{district.storeAddress}</div>
              <div className="text-xs mt-1 flex items-center gap-2">
                <StatusDot status={status} />
                <span className="text-muted-foreground">
                  {status === "green" && "Entrega 25–40 min"}
                  {status === "yellow" && "Entrega 50–65 min"}
                  {status === "red" && "Servicio pausado"}
                </span>
              </div>
            </div>
            <ShoppingBag className="size-5 text-muted-foreground" />
          </div>
        </Link>
      </div>
    </PhoneShell>
  );
}

function Alert({ tone, title, body }: { tone: "warning" | "danger"; title: string; body: string }) {
  const cls =
    tone === "warning"
      ? "border-primary/30 bg-primary/10 text-foreground"
      : "border-destructive/30 bg-destructive/10";
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-2xl border p-4", cls)}
    >
      <div className="font-semibold text-sm">{title}</div>
      <p className="text-xs text-muted-foreground mt-1">{body}</p>
    </motion.div>
  );
}

function StatusDot({ status }: { status: "green" | "yellow" | "red" }) {
  const color =
    status === "green" ? "bg-success" : status === "yellow" ? "bg-warning" : "bg-destructive";
  return <span className={cn("inline-block size-2 rounded-full", color)} />;
}
