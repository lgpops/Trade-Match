export type CollarType = "blue" | "white" | "other";
export type CollarPreference = CollarType | "everyone";

export type Ethnicity =
  | "asian"
  | "black"
  | "latino"
  | "middleEastern"
  | "pacificIslander"
  | "southAsian"
  | "white"
  | "mixed"
  | "other";

export type EthnicityPreference = Ethnicity | "everyone";

export const COLLAR_OPTIONS: { value: CollarType; label: string; sub: string }[] = [
  {
    value: "blue",
    label: "Blue collar",
    sub: "Hands-on, trades, site, service and field work",
  },
  {
    value: "white",
    label: "White collar",
    sub: "Office, professional, creative and corporate work",
  },
  {
    value: "other",
    label: "Other",
    sub: "Artists, athletes, founders, performers and anything else",
  },
];

export const COLLAR_FILTER_OPTIONS: {
  value: CollarPreference;
  label: string;
}[] = [
  { value: "everyone", label: "All" },
  { value: "blue", label: "Blue" },
  { value: "white", label: "White" },
  { value: "other", label: "Other" },
];

export const ETHNICITY_OPTIONS: { value: Ethnicity; label: string }[] = [
  { value: "asian", label: "Asian" },
  { value: "black", label: "Black" },
  { value: "latino", label: "Latino" },
  { value: "middleEastern", label: "Middle Eastern" },
  { value: "pacificIslander", label: "Pacific Islander" },
  { value: "southAsian", label: "South Asian" },
  { value: "white", label: "White" },
  { value: "mixed", label: "Mixed" },
  { value: "other", label: "Other" },
];

export const ETHNICITY_FILTER_OPTIONS: {
  value: EthnicityPreference;
  label: string;
}[] = [{ value: "everyone", label: "All" }, ...ETHNICITY_OPTIONS];

export const DEFAULT_MIN_HEIGHT_CM = 150;
export const HEIGHT_SLIDER_MIN_CM = 140;
export const HEIGHT_SLIDER_MAX_CM = 215;

export function getCollarLabel(value: CollarPreference | undefined): string {
  if (!value || value === "everyone") return "All collars";
  return COLLAR_OPTIONS.find((opt) => opt.value === value)?.label ?? "All collars";
}

export function getEthnicityLabel(value: EthnicityPreference | undefined): string {
  if (!value || value === "everyone") return "All ethnicities";
  return ETHNICITY_OPTIONS.find((opt) => opt.value === value)?.label ?? "All ethnicities";
}

export function formatCollarType(collarType: CollarType): string {
  return COLLAR_OPTIONS.find((opt) => opt.value === collarType)?.label ?? "Collar";
}

export function formatEthnicity(ethnicity: Ethnicity): string {
  return ETHNICITY_OPTIONS.find((opt) => opt.value === ethnicity)?.label ?? "Other";
}

export function formatHeight(cm: number | undefined): string {
  if (!cm) return "Height not set";
  return `${cm} cm / ${formatHeightImperial(cm)}`;
}

export function formatHeightImperial(cm: number): string {
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}"`;
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = Math.round(cm / 2.54);
  return {
    feet: Math.floor(totalInches / 12),
    inches: totalInches % 12,
  };
}

export function formatMinHeightPreference(minHeightCm: number): string {
  return minHeightCm <= DEFAULT_MIN_HEIGHT_CM
    ? "Any height"
    : `${formatHeight(minHeightCm)} and up`;
}

export function isHeightWithinPreference(
  heightCm: number,
  minHeightCm: number,
): boolean {
  return heightCm >= minHeightCm;
}
