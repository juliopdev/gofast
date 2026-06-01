import { Link, useLocation } from "@tanstack/react-router";
import { Home, ReceiptText, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs: { to: string; label: string; icon: typeof Home; exact?: boolean }[] = [
  { to: "/", label: "Inicio", icon: Home, exact: true },
  { to: "/orders", label: "Órdenes", icon: ReceiptText },
  { to: "/credits", label: "Créditos", icon: Wallet },
  { to: "/profile", label: "Perfil", icon: User },
];

export function BottomNav() {
  const loc = useLocation();
  return (
    <nav className="sticky bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
      <div className="grid grid-cols-4">
        {tabs.map((t) => {
          const active = t.exact ? loc.pathname === t.to : loc.pathname.startsWith(t.to);
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to as never}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors active:scale-95",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
