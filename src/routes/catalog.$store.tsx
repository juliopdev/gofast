import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Minus, ChevronLeft, ShoppingBag } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { products, popularIds, districts } from "@/lib/gofast-data";
import { useApp, cartCount, cartSubtotal } from "@/store/app-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/catalog/$store")({
  component: Catalog,
});

function Catalog() {
  const { store } = Route.useParams();
  const district = districts.find((d) => d.id === store) ?? districts[0];
  const navigate = useNavigate();
  const { cart, addToCart, decFromCart } = useApp();
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );
  const count = cartCount(cart);
  const subtotal = cartSubtotal(cart);

  return (
    <PhoneShell withNav={false}>
      <div className="sticky top-0 z-30 bg-card border-b">
        <div className="px-4 pt-5 pb-3 flex items-center gap-3">
          <button onClick={() => navigate({ to: "/" })} className="active:scale-90 transition">
            <ChevronLeft className="size-6" />
          </button>
          <div className="flex-1">
            <div className="text-[11px] text-muted-foreground">Comprando en</div>
            <div className="font-bold text-sm">{district.storeName} · {district.name}</div>
          </div>
        </div>
        <div className="px-4 pb-3 relative">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos"
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted text-sm outline-none"
          />
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3 pb-32">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-card p-3">
                <div className="aspect-square rounded-xl bg-muted animate-pulse" />
                <div className="h-3 mt-3 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-3 mt-2 w-1/2 bg-muted rounded animate-pulse" />
              </div>
            ))
          : filtered.map((p) => {
              const inCart = cart.find((c) => c.product.id === p.id);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative rounded-2xl bg-card p-3 flex flex-col"
                >
                  {popularIds.includes(p.id) && (
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground border-0 text-[10px]">
                      Popular
                    </Badge>
                  )}
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-muted to-muted/40 grid place-items-center text-5xl">
                    {p.emoji}
                  </div>
                  <div className="mt-2 text-sm font-medium leading-tight line-clamp-2">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">{p.unit}</div>
                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <div className="font-bold text-sm">S/{p.price.toFixed(2)}</div>
                    {inCart ? (
                      <div className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-full px-1">
                        <button
                          onClick={() => decFromCart(p.id)}
                          className="size-6 grid place-items-center active:scale-90"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="text-xs font-bold min-w-4 text-center">{inCart.qty}</span>
                        <button
                          onClick={() => addToCart(p)}
                          className="size-6 grid place-items-center active:scale-90"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          addToCart(p);
                          if (!sheetOpen) setSheetOpen(true);
                          setTimeout(() => setSheetOpen(false), 1200);
                        }}
                        className="size-8 grid place-items-center rounded-full bg-primary text-primary-foreground active:scale-90 transition"
                      >
                        <Plus className="size-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
      </div>

      {count > 0 && (
        <motion.button
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          onClick={() => navigate({ to: "/cart" })}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[398px] bg-primary text-primary-foreground rounded-2xl h-14 px-5 flex items-center justify-between shadow-xl active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="size-5" />
              <span className="absolute -top-1.5 -right-2 bg-white text-primary text-[10px] font-bold rounded-full size-4 grid place-items-center">
                {count}
              </span>
            </div>
            <span className="font-semibold">Ver carrito</span>
          </div>
          <span className="font-bold">S/{subtotal.toFixed(2)}</span>
        </motion.button>
      )}

      <Drawer open={sheetOpen} onOpenChange={setSheetOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Agregado al carrito ✓</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <div className="text-sm text-muted-foreground">
              {count} producto{count !== 1 ? "s" : ""} · S/{subtotal.toFixed(2)}
            </div>
            <Button
              className="w-full mt-3 h-12 rounded-xl"
              onClick={() => {
                setSheetOpen(false);
                navigate({ to: "/cart" });
              }}
            >
              Ir al carrito
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </PhoneShell>
  );
}
