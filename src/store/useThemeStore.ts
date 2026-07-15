import { create } from "zustand";
import { ThemeStore } from "../types";

export const useThemeStore = create<ThemeStore>((set) => ({
    theme: typeof window !== "undefined" ? localStorage.getItem("chat-theme") || "coffee" : "coffee",
    setTheme: (theme: string) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("chat-theme", theme);
        }
        set({ theme });
    },
}));