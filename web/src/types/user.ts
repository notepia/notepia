import { AIModality } from "./ai";

export interface User {
    id: string;
    name: string;
    email: string;
    preferences: Preferences;
    gen_commands: GenCommand[];
}

interface Preferences {
    lang: string
    theme: Theme
} 

export type Theme = "light" | "dark";

export type MenuType = "editorTextSelectionMenu" | "editorImageSelectionMenu" | "notePageMenu"

export interface GenCommand {
    id?: string
    menu_type: MenuType
    name: string
    prompt: string
    modality: AIModality
    model: string
}