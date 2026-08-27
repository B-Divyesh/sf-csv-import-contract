const SLUG = "csv-import-contract";
const KEY = `sb_license:${SLUG}`;
const CACHE_KEY = `${KEY}:verdict`;
const API = "https://api.sociobot.in/api/v1";
const DAY = 86_400_000;

export interface LicenseState { unlocked: boolean; notice: string; token?: string }

function cachedValid(token: string): boolean {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null") as { token: string; valid: boolean; checkedAt: number } | null;
    return Boolean(cached?.token === token && cached.valid);
  } catch { return false; }
}

export function captureLicense(): string | undefined {
  const url = new URL(location.href);
  const token = url.searchParams.get("license")?.trim();
  if (token) {
    localStorage.setItem(KEY, token);
    url.searchParams.delete("license");
    history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }
  return token || localStorage.getItem(KEY) || undefined;
}

export function storeLicense(token: string): void {
  localStorage.setItem(KEY, token.trim());
  localStorage.removeItem(CACHE_KEY);
}

export function initialLicenseState(): LicenseState {
  const token = captureLicense();
  return { unlocked: token ? cachedValid(token) : false, notice: "", token };
}

export async function verifyLicense(token: string, force = false): Promise<LicenseState> {
  let cached: { token: string; valid: boolean; checkedAt: number } | null = null;
  try { cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null"); } catch { /* ignore */ }
  if (!force && cached?.token === token && Date.now() - cached.checkedAt < DAY) {
    return { unlocked: cached.valid, notice: cached.valid ? "License active." : "License no longer active.", token };
  }
  try {
    const response = await fetch(`${API}/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error("verification unavailable");
    const result = await response.json() as { valid: boolean };
    localStorage.setItem(CACHE_KEY, JSON.stringify({ token, valid: result.valid, checkedAt: Date.now() }));
    return { unlocked: result.valid, notice: result.valid ? "License active." : "License no longer active.", token };
  } catch {
    return { unlocked: cachedValid(token), notice: "Could not re-check the license. Using the last saved verdict.", token };
  }
}

export const checkoutUrl = `${API}/products/${SLUG}/checkout`;
