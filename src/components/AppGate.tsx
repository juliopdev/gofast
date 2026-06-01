import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "@tanstack/react-router";
import { SplashScreen } from "./SplashScreen";
import { Onboarding } from "./Onboarding";
import { useApp } from "@/store/app-store";

export function AppGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const onboarded = useApp((s) => s.onboarded);
  const loc = useLocation();
  const isAdmin = loc.pathname.startsWith("/admin");

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 grid place-items-center bg-primary text-primary-foreground">
        <div className="text-4xl font-black">GoFast</div>
      </div>
    );
  }

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <AnimatePresence>{showSplash && <SplashScreen />}</AnimatePresence>
      {!showSplash && (onboarded ? children : <Onboarding />)}
    </>
  );
}
