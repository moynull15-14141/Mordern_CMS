/**
 * Device/network metadata captured for Session rows (§5 Session Management,
 * extended Milestone 4.1 §3). `browser`/`operatingSystem` stay null until a
 * user-agent parser is wired in; `country`/`city` stay null until a geo-IP
 * lookup is wired in — no parsing/lookup logic exists yet, foundation only.
 */
export interface RequestContext {
  ipAddress: string | null;
  userAgent: string | null;
  deviceName: string | null;
  browser: string | null;
  operatingSystem: string | null;
  country: string | null;
  city: string | null;
}
