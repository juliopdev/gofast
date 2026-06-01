export type DistrictStatus = "green" | "yellow" | "red";

export type District = {
  id: string;
  name: string;
  status: DistrictStatus;
  riders: number;
  storeName: string;
  storeAddress: string;
  extraMinutes: number; // delivery factor
  queue: number; // pedidos en cola
};

export const districts: District[] = [
  {
    id: "ica",
    name: "Ica (Centro)",
    status: "green",
    riders: 6,
    storeName: "Plaza Vea",
    storeAddress: "Av. Municipalidad 256, frente a la Plaza de Armas",
    extraMinutes: 5,
    queue: 1,
  },
  {
    id: "tinguina",
    name: "La Tinguiña",
    status: "green",
    riders: 5,
    storeName: "Tottus",
    storeAddress: "Av. Los Maestros 742, esquina con Prolongación Lima",
    extraMinutes: 8,
    queue: 2,
  },
  {
    id: "sjb",
    name: "San Juan Bautista",
    status: "yellow",
    riders: 2,
    storeName: "Metro",
    storeAddress: "Av. San Martín 518, centro comercial El Quetzal",
    extraMinutes: 25,
    queue: 4,
  },
  {
    id: "subtanjalla",
    name: "Subtanjalla",
    status: "green",
    riders: 4,
    storeName: "Plaza Vea",
    storeAddress: "Av. 8 de Octubre 333, urbanización Santa Rosa",
    extraMinutes: 10,
    queue: 1,
  },
];

export type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  emoji: string;
};

export const products: Product[] = [
  { id: "p1", name: "Leche Gloria evaporada", price: 4.5, unit: "400gr", category: "Lácteos", emoji: "🥛" },
  { id: "p2", name: "Arroz Costeño", price: 24.9, unit: "5kg", category: "Arroz y menestras", emoji: "🍚" },
  { id: "p3", name: "Aceite Primor", price: 12.0, unit: "1L", category: "Abarrotes", emoji: "🫒" },
  { id: "p4", name: "Pan de molde Bimbo", price: 8.5, unit: "unidad", category: "Panadería", emoji: "🍞" },
  { id: "p5", name: "Yogurt Gloria", price: 9.9, unit: "1L", category: "Lácteos", emoji: "🥣" },
  { id: "p6", name: "Pollo entero fresco", price: 18.0, unit: "kg", category: "Carnes", emoji: "🍗" },
  { id: "p7", name: "Coca Cola", price: 6.5, unit: "1.5L", category: "Bebidas", emoji: "🥤" },
  { id: "p8", name: "Papel higiénico Suave", price: 12.9, unit: "4 rollos", category: "Limpieza", emoji: "🧻" },
];

export const popularIds = ["p2", "p7"];

export const categories = [
  { id: "lacteos", name: "Lácteos", emoji: "🥛" },
  { id: "bebidas", name: "Bebidas", emoji: "🥤" },
  { id: "arroz", name: "Arroz y menestras", emoji: "🍚" },
  { id: "limpieza", name: "Limpieza", emoji: "🧻" },
  { id: "panaderia", name: "Panadería", emoji: "🍞" },
  { id: "carnes", name: "Carnes", emoji: "🍗" },
  { id: "abarrotes", name: "Abarrotes", emoji: "🥫" },
  { id: "snacks", name: "Snacks", emoji: "🍪" },
];

export const ridersByDistrict: Record<string, { name: string; rating: number; plate: string }[]> = {
  ica: [
    { name: "Carlos Quispe", rating: 4.9, plate: "MA-1287" },
    { name: "Luis Ramírez", rating: 4.8, plate: "MB-3318" },
  ],
  tinguina: [
    { name: "Jorge Huamán", rating: 4.7, plate: "MC-7821" },
  ],
  sjb: [{ name: "Andrés Salazar", rating: 4.6, plate: "MD-5512" }],
  subtanjalla: [{ name: "Marco Peña", rating: 4.9, plate: "ME-9920" }],
};

export function estimateDelivery(districtId: string, itemCount: number) {
  const d = districts.find((x) => x.id === districtId)!;
  let base = 20 + itemCount * 2 + d.extraMinutes;
  if (d.queue > 3) base += 15;
  const min = base;
  const max = base + 10;
  return { min, max, district: d };
}
