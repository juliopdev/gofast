import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-primary text-primary-foreground"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="flex items-center gap-3"
      >
        <div className="grid size-16 place-items-center rounded-2xl bg-white/15 backdrop-blur">
          <Zap className="size-9" fill="currentColor" />
        </div>
        <div className="text-4xl font-black tracking-tight">GoFast</div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-4 text-sm font-medium opacity-80"
      >
        Supermercado en minutos · Ica
      </motion.div>
    </motion.div>
  );
}
