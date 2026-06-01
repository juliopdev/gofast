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
  status: "confirmed" | "preparing" | "on_the_way" | "delivered" | "refunded";
  rider: { name: string; rating: number; plate: string };
  creditsAwarded: number;
  expressShipping?: boolean;
  couponApplied?: string | null;
  creditUsed?: number;
  isLateForRider?: boolean;
  elapsedMinutesSimulated?: number;
};

export type CreditEntry = {
  id: string;
  amount: number;
  reason: string;
  at: number;
};

export type Address = {
  id: string;
  label: string;
  districtId: string;
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
  addresses: Address[];
  activeAddressId: string;
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
  addAddress: (addr: Address) => void;
  setActiveAddressId: (id: string) => void;
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
      orders: [
        {
          id: "o-mock-1",
          districtId: "ica",
          items: [
            { product: { id: "p1", name: "Leche Gloria evaporada", price: 4.5, unit: "400gr", category: "Lácteos", emoji: "🥛" }, qty: 2 },
            { product: { id: "p4", name: "Pan de molde Bimbo", price: 8.5, unit: "unidad", category: "Panadería", emoji: "🍞" }, qty: 1 },
          ],
          subtotal: 17.50,
          delivery: 5.00,
          total: 22.50,
          promisedMin: 20,
          promisedMax: 30,
          createdAt: Date.now() - 300000,
          status: "confirmed",
          rider: { name: "Buscando repartidor...", rating: 0, plate: "---" },
          creditsAwarded: 0,
        },
        {
          id: "o-mock-2",
          districtId: "tinguina",
          items: [
            { product: { id: "p2", name: "Arroz Costeño", price: 24.9, unit: "5kg", category: "Arroz y menestras", emoji: "🍚" }, qty: 1 },
          ],
          subtotal: 24.90,
          delivery: 6.00,
          total: 30.90,
          promisedMin: 25,
          promisedMax: 35,
          createdAt: Date.now() - 600000,
          status: "confirmed",
          rider: { name: "Buscando repartidor...", rating: 0, plate: "---" },
          creditsAwarded: 0,
        },
        {
          id: "o-mock-3",
          districtId: "subtanjalla",
          items: [
            { product: { id: "p3", name: "Aceite Primor", price: 12.0, unit: "1L", category: "Abarrotes", emoji: "🫒" }, qty: 2 },
          ],
          subtotal: 24.00,
          delivery: 7.00,
          total: 31.00,
          promisedMin: 30,
          promisedMax: 40,
          createdAt: Date.now() - 86400000,
          status: "delivered",
          rider: { name: "Marco Peña", rating: 4.9, plate: "ME-9920" },
          creditsAwarded: 0,
        },
        {
          id: "o-mock-4",
          districtId: "sjb",
          items: [
            { product: { id: "p5", name: "Yogurt Gloria", price: 9.9, unit: "1L", category: "Lácteos", emoji: "🥣" }, qty: 2 },
          ],
          subtotal: 19.80,
          delivery: 5.00,
          total: 24.80,
          promisedMin: 15,
          promisedMax: 25,
          createdAt: Date.now() - 400000,
          status: "confirmed",
          rider: { name: "Buscando repartidor...", rating: 0, plate: "---" },
          creditsAwarded: 0,
        },
        {
          id: "o-mock-5",
          districtId: "ica",
          items: [
            { product: { id: "p6", name: "Pollo entero fresco", price: 18.0, unit: "kg", category: "Carnes", emoji: "🍗" }, qty: 1 },
          ],
          subtotal: 18.00,
          delivery: 5.00,
          total: 23.00,
          promisedMin: 22,
          promisedMax: 32,
          createdAt: Date.now() - 500000,
          status: "confirmed",
          rider: { name: "Buscando repartidor...", rating: 0, plate: "---" },
          creditsAwarded: 0,
        },
        {
          id: "o-mock-6",
          districtId: "tinguina",
          items: [
            { product: { id: "p8", name: "Papel higiénico Suave", price: 12.9, unit: "4 rollos", category: "Limpieza", emoji: "🧻" }, qty: 1 },
          ],
          subtotal: 12.90,
          delivery: 6.00,
          total: 18.90,
          promisedMin: 26,
          promisedMax: 36,
          createdAt: Date.now() - 800000,
          status: "confirmed",
          rider: { name: "Buscando repartidor...", rating: 0, plate: "---" },
          creditsAwarded: 0,
        },
      ],
      credits: 15,
      creditHistory: [
        { id: "c0", amount: 10, reason: "Retraso en entrega - San Juan Bautista", at: Date.now() - 86400000 },
        { id: "c1", amount: 5, reason: "Compensación por demora - Subtanjalla", at: Date.now() - 172800000 },
      ],
      districtStatuses: initialStatuses,
      notifications: true,
      addresses: [
        { id: "addr-1", label: "Casa (Ica Centro) - Av. Grau 124", districtId: "ica" },
        { id: "addr-2", label: "Oficina - Av. Los Maestros 742", districtId: "tinguina" },
      ],
      activeAddressId: "addr-1",
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
      addAddress: (addr) => set((s) => ({ addresses: [...s.addresses, addr] })),
      setActiveAddressId: (id) =>
        set((s) => {
          const addr = s.addresses.find((a) => a.id === id);
          return {
            activeAddressId: id,
            districtId: addr ? addr.districtId : s.districtId,
          };
        }),
    }),
    { name: "gofast-store" }
  )
);

export const cartCount = (cart: CartItem[]) => cart.reduce((a, c) => a + c.qty, 0);
export const cartSubtotal = (cart: CartItem[]) =>
  cart.reduce((a, c) => a + c.qty * c.product.price, 0);
