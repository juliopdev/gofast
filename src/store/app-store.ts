import { create } from "zustand";
import { persist } from "zustand/middleware";
import { districts, type DistrictStatus, type Product } from "@/lib/gofast-data";

export type CartItem = { product: Product; qty: number };

export type Order = {
  id: string;
  districtId: string;
  items: CartItem[];
  subtotal: number;
  delivery: number;
  total: number;
  promisedMin: number;
  promisedMax: number;
  createdAt: number;
  status: "confirmed" | "preparing" | "on_the_way" | "delivered";
  rider: { name: string; rating: number; plate: string };
  creditsAwarded: number;
};

export type CreditEntry = {
  id: string;
  amount: number;
  reason: string;
  at: number;
};

type State = {
  onboarded: boolean;
  districtId: string;
  cart: CartItem[];
  orders: Order[];
  credits: number;
  creditHistory: CreditEntry[];
  districtStatuses: Record<string, DistrictStatus>;
  notifications: boolean;
  setOnboarded: (v: boolean) => void;
  setDistrict: (id: string) => void;
  addToCart: (p: Product) => void;
  decFromCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  addOrder: (o: Order) => void;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  addCredit: (amount: number, reason: string) => void;
  setDistrictStatus: (id: string, s: DistrictStatus) => void;
  setNotifications: (v: boolean) => void;
};

const initialStatuses: Record<string, DistrictStatus> = Object.fromEntries(
  districts.map((d) => [d.id, d.status])
);

export const useApp = create<State>()(
  persist(
    (set) => ({
      onboarded: false,
      districtId: "ica",
      cart: [],
      orders: [],
      credits: 15,
      creditHistory: [
        { id: "c0", amount: 10, reason: "Retraso en entrega - San Juan Bautista", at: Date.now() - 86400000 },
        { id: "c1", amount: 5, reason: "Compensación por demora - Subtanjalla", at: Date.now() - 172800000 },
      ],
      districtStatuses: initialStatuses,
      notifications: true,
      setOnboarded: (v) => set({ onboarded: v }),
      setDistrict: (id) => set({ districtId: id }),
      addToCart: (p) =>
        set((s) => {
          const found = s.cart.find((c) => c.product.id === p.id);
          if (found) return { cart: s.cart.map((c) => (c.product.id === p.id ? { ...c, qty: c.qty + 1 } : c)) };
          return { cart: [...s.cart, { product: p, qty: 1 }] };
        }),
      decFromCart: (id) =>
        set((s) => ({
          cart: s.cart
            .map((c) => (c.product.id === id ? { ...c, qty: c.qty - 1 } : c))
            .filter((c) => c.qty > 0),
        })),
      removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((c) => c.product.id !== id) })),
      clearCart: () => set({ cart: [] }),
      addOrder: (o) => set((s) => ({ orders: [o, ...s.orders] })),
      updateOrder: (id, patch) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
      addCredit: (amount, reason) =>
        set((s) => ({
          credits: s.credits + amount,
          creditHistory: [
            { id: `c${Date.now()}`, amount, reason, at: Date.now() },
            ...s.creditHistory,
          ],
        })),
      setDistrictStatus: (id, status) =>
        set((s) => ({ districtStatuses: { ...s.districtStatuses, [id]: status } })),
      setNotifications: (v) => set({ notifications: v }),
    }),
    { name: "gofast-store" }
  )
);

export const cartCount = (cart: CartItem[]) => cart.reduce((a, c) => a + c.qty, 0);
export const cartSubtotal = (cart: CartItem[]) =>
  cart.reduce((a, c) => a + c.qty * c.product.price, 0);
