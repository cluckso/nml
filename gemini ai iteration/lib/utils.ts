import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock auth check
export const isLoggedIn = () => {
  return localStorage.getItem("nml_auth") === "true";
};

export const login = () => {
  localStorage.setItem("nml_auth", "true");
};

export const logout = () => {
  localStorage.removeItem("nml_auth");
};