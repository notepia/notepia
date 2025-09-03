import { produce } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware"

type Theme = {
    name: string
}

interface ThemeState {
    theme: Theme,
    toggleTheme: () => void,
}

export const useThemeStore = create<ThemeState>()(persist((set) => ({
    theme: {
        name: "dark"
    },
    toggleTheme: () => set(produce(s => {
        s.theme.name = (s.theme.name == "light") ? "dark" : "light"
    }))
}), { name: "theme" }))

