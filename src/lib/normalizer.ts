export interface NormalizedField {
  value: string;
  confidence: number;
}

export interface NormalizedName {
  first: NormalizedField;
  middle: NormalizedField | null;
  last: NormalizedField;
}

export interface NormalizedAddress {
  line: NormalizedField;
  city: NormalizedField;
  state: NormalizedField;
  pincode: NormalizedField;
}

export interface NormalizedData {
  name: NormalizedName;
  dob: NormalizedField | null;
  address: NormalizedAddress | null;
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDate(raw: string): string | null {
  const patterns = [
    /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/,
    /^(\d{4})[\/-](\d{2})[\/-](\d{2})$/,
  ];
  const match1 = raw.match(patterns[0]);
  if (match1) {
    const [, dd, mm, yyyy] = match1;
    return `${yyyy}-${mm}-${dd}`;
  }
  const match2 = raw.match(patterns[1]);
  if (match2) {
    const [, yyyy, mm, dd] = match2;
    return `${yyyy}-${mm}-${dd}`;
  }
  return null;
}

function normalizePincode(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 6);
}

export function normalizeOcrOutput(
  raw: Record<string, unknown>
): NormalizedData {
  const rawName = typeof raw.name === "string" ? raw.name : "";
  const nameParts = titleCase(rawName).split(" ");
  const first = nameParts[0] ?? "";
  const last = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const middle =
    nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : null;

  const confidence =
    typeof raw.confidence === "number" ? raw.confidence : 0.8;

  const rawDob = typeof raw.dob === "string" ? raw.dob : null;
  const dob = rawDob ? normalizeDate(rawDob) : null;

  const rawAddress = typeof raw.address === "string" ? raw.address : null;
  let address: NormalizedAddress | null = null;
  if (rawAddress) {
    const parts = rawAddress.split(",").map((p) => p.trim());
    address = {
      line: { value: parts[0] ?? "", confidence },
      city: { value: titleCase(parts[1] ?? ""), confidence },
      state: { value: titleCase(parts[2] ?? "Rajasthan"), confidence },
      pincode: { value: normalizePincode(parts[3] ?? ""), confidence },
    };
  }

  return {
    name: {
      first: { value: first, confidence },
      middle: middle ? { value: middle, confidence } : null,
      last: { value: last, confidence },
    },
    dob: dob ? { value: dob, confidence } : null,
    address,
  };
}
