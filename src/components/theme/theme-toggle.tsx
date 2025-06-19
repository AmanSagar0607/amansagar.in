// components/theme/theme-toggle.tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type ThemeToggleProps = {
  className?: string;
  hideIcon?: boolean;
};

export function ThemeToggle({ className = "", hideIcon = false }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`h-5 w-5 ${className}`} />;
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className={`focus:outline-none flex items-center gap-2 ${className}`}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      {!hideIcon && (theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      ))}
      <span className="text-sm font-medium">
      </span>
    </motion.button>
  );
}