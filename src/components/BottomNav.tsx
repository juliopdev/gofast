import { Link, useLocation } from "@tanstack/react-router";
import { Home, ReceiptText, Wallet, User, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp, cartCount } from "@/store/app-store";

const tabs: { to: string; label: string; icon: typeof Home; exact?: boolean; isCart?: boolean }[] = [
  { to: "/", label: "Inicio", icon: Home, exact: true },
  { to: "/orders", label: "Órdenes", icon: ReceiptText },
  { to: "/cart", label: "Carrito", icon: ShoppingBag, isCart: true },
  { to: "/credits", label: "Créditos", icon: Wallet },
  { to: "/profile", label: "Perfil", icon: User },
];

export function BottomNav() {
  const loc = useLocation();
  const { cart } = useApp();
  const count = cartCount(cart);

  return (
    <nav className="sticky bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
      <div className="grid grid-cols-5">
        {tabs.map((t) => {
          const active = t.exact ? loc.pathname === t.to : loc.pathname.startsWith(t.to);
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to as never}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors active:scale-95 relative",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
                {t.isCart && count > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[9px] font-black rounded-full size-4 grid place-items-center animate-pulse">
                    {count}
                  </span>
                )}
              </div>
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
