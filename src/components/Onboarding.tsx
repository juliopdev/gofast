import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Gift } from "lucide-react";
import { useApp } from "@/store/app-store";

const slides = [
  {
    icon: Clock,
    title: "Supermercado en minutos",
    body: "Tu pedido en la puerta de tu casa, rápido y fácil.",
  },
  {
    icon: MapPin,
    title: "Rastrea tu pedido",
    body: "Sigue a tu repartidor en tiempo real desde el mapa.",
  },
  {
    icon: Gift,
    title: "Créditos si nos tardamos",
    body: "Si tu pedido se demora, te compensamos automáticamente.",
  },
];

export function Onboarding() {
  const [i, setI] = useState(0);
  const setOnboarded = useApp((s) => s.setOnboarded);
  const Slide = slides[i];
  const Icon = Slide.icon;
  return (
    <div className="phone-frame-bg">
      <div className="phone-shell flex flex-col">
        <div className="flex-1 px-6 pt-16 pb-8 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center"
              >
                <div className="grid size-28 place-items-center rounded-3xl bg-primary/10 text-primary">
                  <Icon className="size-12" strokeWidth={2.2} />
                </div>
                <h1 className="mt-8 text-2xl font-bold text-foreground">{Slide.title}</h1>
                <p className="mt-3 max-w-xs text-base text-muted-foreground">{Slide.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mb-8 flex items-center justify-center gap-2">
            {slides.map((_, n) => (
              <div
                key={n}
                className={`h-1.5 rounded-full transition-all ${n === i ? "w-8 bg-primary" : "w-2 bg-muted"}`}
              />
            ))}
          </div>
          <Button
            size="lg"
            className="h-14 w-full rounded-2xl text-base font-semibold"
            onClick={() => {
              if (i < slides.length - 1) setI(i + 1);
              else setOnboarded(true);
            }}
          >
            {i < slides.length - 1 ? "Siguiente" : "Comenzar"}
          </Button>
          {i < slides.length - 1 && (
            <button
              onClick={() => setOnboarded(true)}
              className="mt-3 text-sm text-muted-foreground"
            >
              Saltar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
