import React from "react";
import { useTheme } from "../../providers/Theme";
import { Moon, Sun } from "lucide-react";

const ThemeButton: React.FC = () => {
  const { theme, setTheme } = useTheme()!;

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-2"
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};

export default ThemeButton;
