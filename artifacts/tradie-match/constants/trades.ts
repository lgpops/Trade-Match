export type TradeKey =
  | "carpenter"
  | "electrician"
  | "plumber"
  | "painter"
  | "bricklayer"
  | "roofer"
  | "tiler"
  | "concreter"
  | "welder"
  | "mechanic"
  | "landscaper"
  | "glazier"
  | "plasterer"
  | "hvac";

export type Trade = {
  key: TradeKey;
  name: string;
  nickname: string;
  color: string;
};

export const TRADES: Trade[] = [
  { key: "carpenter", name: "Carpenter", nickname: "Chippy", color: "#A0522D" },
  { key: "electrician", name: "Electrician", nickname: "Sparky", color: "#E8A92E" },
  { key: "plumber", name: "Plumber", nickname: "Plumber", color: "#2563EB" },
  { key: "painter", name: "Painter", nickname: "Painter", color: "#7C3AED" },
  { key: "bricklayer", name: "Bricklayer", nickname: "Brickie", color: "#B85042" },
  { key: "roofer", name: "Roofer", nickname: "Roofer", color: "#475569" },
  { key: "tiler", name: "Tiler", nickname: "Tiler", color: "#0D9488" },
  { key: "concreter", name: "Concreter", nickname: "Concreter", color: "#6B7280" },
  { key: "welder", name: "Welder", nickname: "Welder", color: "#EA580C" },
  { key: "mechanic", name: "Mechanic", nickname: "Mech", color: "#1F2937" },
  { key: "landscaper", name: "Landscaper", nickname: "Landscaper", color: "#16A34A" },
  { key: "glazier", name: "Glazier", nickname: "Glazier", color: "#0EA5E9" },
  { key: "plasterer", name: "Plasterer", nickname: "Plasterer", color: "#C49A6C" },
  { key: "hvac", name: "HVAC Tech", nickname: "Aircon", color: "#06B6D4" },
];

export function getTrade(key: TradeKey): Trade {
  return TRADES.find((t) => t.key === key) ?? TRADES[0]!;
}
