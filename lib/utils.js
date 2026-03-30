import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getLoggedInUser = () => {
  try {
    if (typeof window !== "undefined") {
      const userdetails = localStorage.getItem("loggedInUser");
      return userdetails ? JSON.parse(userdetails) : null;
    }
    return null;
  } catch {
    return null;
  }
};
