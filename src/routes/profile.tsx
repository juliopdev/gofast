import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useApp } from "@/store/app-store";
import { MapPin, CreditCard, ShieldCheck, BarChart3, Bike } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: Profile,
});

function Profile() {
  const { notifications, setNotifications, setOnboarded } = useApp();
  const [name] = useState("María Quispe");
  return (
    <PhoneShell>
      <div className="px-5 pt-7 pb-5 bg-secondary text-secondary-foreground rounded-b-3xl">
        <div className="flex items-center gap-3">
          <div className="size-14 rounded-full bg-primary text-primary-foreground grid place-items-center text-xl font-bold">
            M
          </div>
          <div>
            <div className="font-bold">{name}</div>
            <div className="text-xs opacity-70">+51 987 654 321 · GoFast desde 2024</div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-5 space-y-2">
        <Item icon={MapPin} to="/to" title="Direcciones guardadas" subtitle="2 direcciones" />
        <Item icon={CreditCard} to="/to" title="Métodos de pago" subtitle="Yape · Plin" />
        <Item icon={ShieldCheck} to="/to" title="Privacidad y seguridad" />
        <Item icon={BarChart3} to="/admin" title="War Room (Admin)" subtitle="Dashboard para el equipo" />
        <Item icon={Bike} to="/carrier" title="Portal de Repartidor" subtitle="Simular entregas y rutas (Demo)" />
      </div>

      <div className="px-5 mt-5 rounded-2xl bg-card p-4 flex items-center justify-between">
        <div>
          <div className="font-medium text-sm">Notificaciones push</div>
          <div className="text-xs text-muted-foreground">Avisos de estado y promos</div>
        </div>
        <Switch checked={notifications} onCheckedChange={setNotifications} />
      </div>

      <div className="px-5 mt-5">
        <h3 className="text-sm font-bold mb-2">Ayuda</h3>
        <Accordion type="single" collapsible className="rounded-2xl bg-card px-4">
          <AccordionItem value="1">
            <AccordionTrigger className="text-sm">¿Cómo gano créditos?</AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground">
              Cada vez que aceptas una ventana de entrega extendida o si nos demoramos, te abonamos créditos automáticamente.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="2">
            <AccordionTrigger className="text-sm">¿Qué pasa si mi zona está pausada?</AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground">
              Estamos reorganizando operaciones temporalmente. Te avisaremos por SMS cuando volvamos a operar.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="3">
            <AccordionTrigger className="text-sm">Métodos de pago aceptados</AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground">
              Yape, Plin, tarjetas Visa/Mastercard y efectivo al recibir.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="px-5 mt-6 pb-10">
        <button
          onClick={() => setOnboarded(false)}
          className="text-xs text-muted-foreground underline"
        >
          Ver onboarding de nuevo
        </button>
      </div>
    </PhoneShell>
  );
}

function Item({
  icon: Icon,
  title,
  subtitle,
  to,
}: {
  icon: typeof MapPin;
  title: string;
  subtitle?: string;
  to?: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-3 active:scale-[0.98] transition">
      <Link to={to} className="flex items-center gap-3 w-full">
        <div className="size-10 rounded-xl bg-muted grid place-items-center text-foreground">
          <Icon className="size-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">{title}</div>
          {subtitle && <div className="text-[11px] text-muted-foreground">{subtitle}</div>}
        </div>
      </Link>
    </div>
  );
}
