import type { CollarType } from "./demographics";

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
  | "consultant"
  | "other";

export type JobKey = TradeKey;

export type Trade = {
  key: TradeKey;
  name: string;
  nickname: string;
  collarType: CollarType;
  color: string;
};

export const TRADES: Trade[] = [
  { key: "builder", name: "Builder", nickname: "Builder", collarType: "blue", color: "#D97706" },
  { key: "carpenter", name: "Carpenter", nickname: "Chippy", collarType: "blue", color: "#A0522D" },
  { key: "electrician", name: "Electrician", nickname: "Sparky", collarType: "blue", color: "#E8A92E" },
  { key: "plumber", name: "Plumber", nickname: "Plumber", collarType: "blue", color: "#2563EB" },
  { key: "painter", name: "Painter", nickname: "Painter", collarType: "blue", color: "#7C3AED" },
  { key: "bricklayer", name: "Bricklayer", nickname: "Brickie", collarType: "blue", color: "#B85042" },
  { key: "roofer", name: "Roofer", nickname: "Roofer", collarType: "blue", color: "#475569" },
  { key: "tiler", name: "Tiler", nickname: "Tiler", collarType: "blue", color: "#0D9488" },
  { key: "concreter", name: "Concreter", nickname: "Concreter", collarType: "blue", color: "#6B7280" },
  { key: "welder", name: "Welder", nickname: "Welder", collarType: "blue", color: "#EA580C" },
  { key: "mechanic", name: "Mechanic", nickname: "Mech", collarType: "blue", color: "#1F2937" },
  { key: "landscaper", name: "Landscaper", nickname: "Landscaper", collarType: "blue", color: "#16A34A" },
  { key: "glazier", name: "Glazier", nickname: "Glazier", collarType: "blue", color: "#0EA5E9" },
  { key: "plasterer", name: "Plasterer", nickname: "Plasterer", collarType: "blue", color: "#C49A6C" },
  { key: "hvac", name: "HVAC Tech", nickname: "Aircon", collarType: "blue", color: "#06B6D4" },
  { key: "engineer", name: "Engineer", nickname: "Engineer", collarType: "white", color: "#1D4ED8" },
  { key: "accountant", name: "Accountant", nickname: "Accountant", collarType: "white", color: "#047857" },
  { key: "lawyer", name: "Lawyer", nickname: "Lawyer", collarType: "white", color: "#6D28D9" },
  { key: "designer", name: "Designer", nickname: "Designer", collarType: "white", color: "#DB2777" },
  { key: "marketer", name: "Marketer", nickname: "Marketing", collarType: "white", color: "#DC2626" },
  { key: "consultant", name: "Consultant", nickname: "Consultant", collarType: "white", color: "#334155" },
  { key: "other", name: "Other", nickname: "Other", collarType: "other", color: "#D72638" },
];

export function getTrade(key: TradeKey): Trade {
  return TRADES.find((t) => t.key === key) ?? TRADES[0]!;
}

export function getTradesForCollar(collarType: CollarType): Trade[] {
  return TRADES.filter((trade) => trade.collarType === collarType);
}

export function isTradeForCollar(key: TradeKey, collarType: CollarType): boolean {
  const trade = getTrade(key);
  return trade.collarType === collarType;
}

export function getTradeLabel(key: TradeKey, customJobTitle?: string): string {
  if (key === "other" && customJobTitle) return customJobTitle;
  return getTrade(key).name;
}
