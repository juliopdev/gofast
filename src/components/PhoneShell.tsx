import { type ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function PhoneShell({ children, withNav = true }: { children: ReactNode; withNav?: boolean }) {
  return (
    <div className="phone-frame-bg">
      <div className="phone-shell flex flex-col">
        <div className="flex-1 overflow-y-auto no-scrollbar">{children}</div>
        {withNav && <BottomNav />}
      </div>
    </div>
  );
}
