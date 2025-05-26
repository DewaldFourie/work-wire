import { useTheme } from "../contexts/use-theme.ts";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

type ThemeToggleProps = {
    width?: number;
    height?: number;
};

export default function ThemeToggle({ width = 80, height = 40 }: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();
    const [isDark, setIsDark] = useState(theme === "dark");

    useEffect(() => {
        setIsDark(theme === "dark");
    }, [theme]);

    const handleToggle = () => {
        toggleTheme();
        setIsDark((prev) => !prev);
    };

    // Knob size is 80% of height, translate distance is (width - knob) / 2
    const knobSize = height * 0.8;
    const knobTranslate = width - knobSize - 8; // padding compensation

    return (
        <button
            onClick={handleToggle}
            aria-label="Toggle dark mode"
            className="relative flex items-center justify-between bg-gray-300 dark:bg-gray-700 rounded-full transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-2"
            style={{ width, height }}
        >
            <Sun
                className={`transition-all duration-300 ${isDark ? "opacity-50 text-gray-100" : "opacity-100 text-yellow-400"}`}
                style={{ width: height * 0.5, height: height * 0.5 }}
            />
            <Moon
                className={`transition-all duration-300 ${isDark ? "opacity-100 text-indigo-400" : "opacity-50 grayscale"}`}
                style={{ width: height * 0.5, height: height * 0.5 }}
            />
            <div
                className="absolute bg-white rounded-full shadow-md transition-transform duration-500 ease-in-out"
                style={{
                    top: (height - knobSize) / 2,
                    left: 4,
                    width: knobSize,
                    height: knobSize,
                    transform: isDark
                        ? `translateX(${knobTranslate}px) rotate(180deg)`
                        : `translateX(0) rotate(0deg)`,
                }}
            />
        </button>
    );
}
