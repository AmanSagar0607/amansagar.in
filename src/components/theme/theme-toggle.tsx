// components/theme/theme-toggle.tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ThemeToggleProps = {
  className?: string;
  hideIcon?: boolean;
};

export function ThemeToggle({ className = "", hideIcon = false }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`h-4 w-4 ${className}`} />;
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative focus:outline-none flex items-center justify-center ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      {!hideIcon && (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={resolvedTheme}
            className="relative w-4 h-4 flex items-center justify-center"
            initial={{ rotate: resolvedTheme === 'light' ? 90 : -90, opacity: 0.5 }}
            animate={{ 
              rotate: 0,
              opacity: 1,
              transition: { 
                type: "tween",
                ease: "easeInOut",
                duration: 0.6
              }
            }}
            exit={{ 
              rotate: resolvedTheme === 'light' ? -90 : 90,
              opacity: 0.5,
              transition: { 
                type: "tween",
                ease: "easeInOut",
                duration: 0.6
              }
            }}
          >
            {resolvedTheme === "light" ? (
              <Moon className="absolute h-4 w-4" />
            ) : (
              <Sun className="absolute h-4 w-4" />
            )}
          </motion.span>
        </AnimatePresence>
      )}
    </motion.button>
  );
}