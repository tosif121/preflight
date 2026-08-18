"use client";

export type UserRole = "citizen" | "operator";

export interface AuthUser {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  stateId: string;
}

const AUTH_KEY = "preflight_auth";

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function clearAuthUser(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function mockVerifyOtp(phone: string, otp: string): boolean {
  return otp === "123456";
}
