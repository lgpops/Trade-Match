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
  | "hvac"
  | "builder"
  | "engineer"
  | "accountant"
  | "lawyer"
  | "designer"
  | "marketer"
  | "consultant";

export type Trade = {
  key: TradeKey;
  name: string;
  nickname: string;
  color: string;
};

export const TRADES: Trade[] = [
  { key: "builder", name: "Builder", nickname: "Builder", color: "#D97706" },
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
  { key: "engineer", name: "Engineer", nickname: "Engineer", color: "#1D4ED8" },
  { key: "accountant", name: "Accountant", nickname: "Accountant", color: "#047857" },
  { key: "lawyer", name: "Lawyer", nickname: "Lawyer", color: "#6D28D9" },
  { key: "designer", name: "Designer", nickname: "Designer", color: "#DB2777" },
  { key: "marketer", name: "Marketer", nickname: "Marketing", color: "#DC2626" },
  { key: "consultant", name: "Consultant", nickname: "Consultant", color: "#334155" },
];

export function getTrade(key: TradeKey): Trade {
  return TRADES.find((t) => t.key === key) ?? TRADES[0]!;
}
